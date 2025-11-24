import {
  OrdStatus,
  VoucherType,
  type LedgerHead,
  type TransactionInfo,
} from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { generateVoucherNumber } from "../../helpers/createVoucherNo";
import prisma from "../../shared/prisma";

//Create Purchase Received Voucher
const createPurchestReceivedIntoDB = async (payload: any) => {
  const createPurchestVoucher = await prisma.$transaction(async (tx: any) => {
    // Check if supplier exists
    const supplierExists = await tx.party.findFirst({
      where: { id: payload.supplierId },
    });

    if (!supplierExists) {
      throw new Error(`Invalid supplierId: No Supplier found.`);
    }

    // step 1. create transaction entries
    const createTransaction: TransactionInfo = await tx.transactionInfo.create({
      data: {
        date: payload?.date,
        invoiceNo: payload.invoiceNo || null,
        voucherNo: payload.voucherNo,
        voucherType: VoucherType.PURCHASE,
        partyId: supplierExists.id,
      },
    });

    //Step 3: Insert Inventory Records

    if (
      !Array.isArray(payload.productItem) ||
      payload.productItem.length === 0
    ) {
      throw new Error("Invalid data: items must be a non-empty array");
    }

    for (const item of payload.productItem) {
      await tx.inventory.create({
        data: {
          transactionId: createTransaction.id,
          date: new Date(payload.date),
          depoId: payload.depoId,
          productId: item.productId,
          unitPrice: item.unitPrice,
          quantityAdd: item.quantity,
          debitAmount: item.amount,
        },
      });
    }

    // 4️⃣ Build Journal Entries
    const journalEntries: any[] = [];

    const totalPurchaseAmount = payload.productItem.reduce(
      (sum: number, p: any) => sum + p.amount,
      0
    );

    const totalPaymentAmount = payload.paymentItem.reduce(
      (sum: number, p: any) => sum + p.amount,
      0
    );
    if (totalPurchaseAmount !== totalPaymentAmount) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Invalid data: items must be a non-empty array"
      );
    }

    const purchaseLedger = await tx.ledgerHead.findFirst({
      where: {
        ledgerName: {
          contains: "purchase",
        },
      },
    });

    if (!purchaseLedger) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        "Purchase ledger item not found"
      );
    }

    // (a) Debit Purchase A/C
    journalEntries.push({
      transactionId: createTransaction.id,
      ledgerHeadId: purchaseLedger.id,
      date: new Date(payload.date),
      depoId: payload.depoId,
      debitAmount: totalPurchaseAmount,
      narration: "Goods purchased",
    });

    if (
      !Array.isArray(payload.paymentItem) ||
      payload.paymentItem.length === 0
    ) {
      throw new Error("Invalid data: Payment option must be a non-empty array");
    }

    // (b) Credit Payment Ledgers
    for (const pay of payload.paymentItem) {
      journalEntries.push({
        transactionId: createTransaction.id,
        ledgerHeadId: pay.ledgerItemId,
        date: new Date(payload.date),
        depoId: payload.depoId,
        creditAmount: pay.amount,
        narration: pay.narration || "",
      });
    }

    // 2. create bank transaction
    const BankTXData: {
      transactionId: number;
      bankAccountId: number;
      creditAmount: number;
      date: Date;
    }[] = [];

    payload.paymentItem.map(async (item: any) => {
      if (item.bankId) {
        BankTXData.push({
          transactionId: createTransaction.id,
          bankAccountId: item.bankId,
          date: new Date(payload.date),
          creditAmount: Number(item.amount),
        });
      }
    });

    if (BankTXData.length > 0) {
      await tx.bankTransaction.createMany({
        data: BankTXData,
      });
    }

    // 6️⃣ Save Journal Entries
    await tx.journal.createMany({ data: journalEntries });

    // end  insert journal entries

    return createTransaction;
  });

  const result = await prisma.transactionInfo.findFirst({
    where: { id: createPurchestVoucher.id },
    include: {
      journal: {
        include: {
          ledgerHead: true,
          bankTransaction: {
            select: {
              bankAccount: {
                select: {
                  bankName: true,
                  branceName: true,
                  accountNumber: true,
                },
              },
              creditAmount: true,
              date: true,
            },
          },
        },
      },

      inventory: {
        select: {
          product: {
            select: {
              name: true,
              tp: true,
            },
          },
          date: true,
          unitPrice: true,
          quantityAdd: true,
          debitAmount: true,
        },
      },
    },
  });
  return result;
};

//prodcut transfer godown to main depo
const addProductTransferIntoDB = async (payload: any) => {
  const createProductTransfer = await prisma.$transaction(async (tx: any) => {
    // Check if product exists

    await Promise.all(
      payload.productItems.map(async (product: { productId: number }) => {
        const isExisted = await tx.product.findFirst({
          where: { id: product.productId },
        });

        if (!isExisted) {
          throw new Error(
            `Invalid productId: ${payload.productId}. No matching Product found.`
          );
        }
      })
    );

    const transactionInfo = await tx.transactionInfo.create({
      data: {
        date: new Date(payload?.date),
        voucherNo: payload.voucherNo,
        voucherType: VoucherType.ALLOCATION,
      },
    });

    await Promise.all(
      payload.productItems.map((item: any) =>
        tx.inventory.create({
          data: {
            transactionId: transactionInfo?.id,
            depoId: payload.providerdepoId,
            date: new Date(payload?.date),
            productId: item.productId,
            unitPrice: item.unitPrice,
            quantityLess: item.quantity,
            creditAmount: item.amount,
          },
        })
      )
    );

    await Promise.all(
      payload.productItems.map((item: any) =>
        tx.inventory.create({
          data: {
            transactionId: transactionInfo?.id,
            depoId: payload.receverdepoId,
            date: new Date(payload?.date),
            productId: item.productId,
            unitPrice: item.unitPrice,
            quantityAdd: item.quantity,
            debitAmount: item.amount,
          },
        })
      )
    );

    const ledgerId = await tx.ledgerHead.findFirst({
      where: {
        ledgerName: {
          contains: "accounts receivable",
        },
      },
    });

    if (!ledgerId) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Please chreate a accounts receivable ledger item"
      );
    }

    await tx.journal.create({
      data: {
        transactionId: transactionInfo?.id,
        ledgerHeadId: ledgerId.id,
        date: new Date(payload?.date),
        depoId: payload.providerdepoId,
        debitAmount: payload.totalAmount,
        narration: "Product Received",
      },
    });

    const PayableledgerId = await tx.ledgerHead.findFirst({
      where: {
        ledgerName: {
          contains: "accounts payable",
        },
      },
    });

    if (!PayableledgerId) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Please chreate a accounts payable ledger item"
      );
    }

    await tx.journal.create({
      data: {
        transactionId: transactionInfo?.id,
        ledgerHeadId: PayableledgerId.id,
        date: new Date(payload?.date),
        depoId: payload.receverdepoId,
        creditAmount: payload.totalAmount,
        narration: "Product Provided",
      },
    });

    return transactionInfo;
  });

  const result = await prisma.transactionInfo.findFirst({
    where: {
      id: createProductTransfer.id,
    },

    select: {
      id: true,
      voucherNo: true,
      voucherType: true,
      status: true,
      date: true,
      journal: {
        include: {
          ledgerHead: true,
        },
      },

      inventory: {
        select: {
          date: true,
          debitAmount: true,
          depoId: true,
          id: true,
          productId: true,
          creditAmount: true,
          quantityAdd: true,
          quantityLess: true,
          transactionInfo: true,
          unitPrice: true,
        },
      },
    },
  });
  return result;
};

const createSalesVoucher = async (payload: any) => {
  const result = await prisma.$transaction(async (tx) => {
    // 1️⃣ Validate Party / Chemist
    if (payload.chemistId) {
      const chemistExists = await tx.chemist.findUnique({
        where: { chemistId: payload.chemistId },
      });
      if (!chemistExists) {
        throw new Error(`Invalid chemistId: ${payload.chemistId}`);
      }
    }

    if (payload.partyId) {
      const partyExists = await tx.party.findUnique({
        where: { id: payload.partyId },
      });
      if (!partyExists) {
        throw new Error(`Invalid partyId: ${payload.partyId}`);
      }
    }

    if (payload.voucherNo) {
      const OrderNoExists = await tx.transactionInfo.findUnique({
        where: { voucherNo: payload.voucherNo },
      });
      if (OrderNoExists) {
        throw new Error(`Invalid voucherNo: ${payload.voucherNo}`);
      }
    }

    // 2️⃣ Create Transaction Entry
    const createTransaction = await tx.transactionInfo.create({
      data: {
        date: new Date(payload.date),
        invoiceNo: payload.orderNo || null,
        voucherNo: payload.voucherNo,
        voucherType: VoucherType.SALES,
        chemistId: payload.chemistId || null,
        partyId: payload.partyId || null,
      },
    });

    // Step 2: Handle bank transactions if ledgerItemId is a bank account
    // for (const item of payload.paymentItems) {
    //   // check if this ledgerItemId belongs to a bank account
    // }

    // 3️⃣ Validate Depo
    const depo = await tx.depo.findUnique({
      where: { id: payload.depoId },
    });
    if (!depo) throw new Error(`Invalid depoId: ${payload.depoId}`);

    // 4️⃣ Insert Inventory (quantityLess)
    if (!payload.productItems?.length)
      throw new Error("Invalid data: productItems must be non-empty");

    await Promise.all(
      payload.productItems.map((item: any) =>
        tx.inventory.create({
          data: {
            date: new Date(payload.date),
            depoId: depo.id,
            transactionId: createTransaction.id,
            productId: item.productId,
            unitPrice: item.unitPrice,
            quantityLess: item.quantity,
            creditAmount: item.amount,
          },
        })
      )
    );

    // 5️⃣ Create Payment Journal Entries (Debit)
    if (!payload.paymentItems?.length)
      throw new Error("Invalid data: paymentItems must be non-empty");

    const journalEntries: any[] = [];

    for (const payItem of payload.paymentItems) {
      if (payItem.bankAccountId) {
        const isBankAccount = await tx.bankAccount.findFirst({
          where: { id: payItem.bankAccountId },
        });

        if (isBankAccount) {
          journalEntries.push({
            transactionId: createTransaction.id,
            date: new Date(payload.date),
            depoId: depo.id,
            ledgerHeadId: payItem.ledgerItemId,
            debitAmount: payItem.amount,
            narration: payItem.narration || "",
            bankTransaction: {
              create: {
                date: new Date(payload.date),
                bankAccountId: isBankAccount.id,
                debitAmount: payItem.amount,
              },
            },
          });
        }
      } else {
        journalEntries.push({
          transactionId: createTransaction.id,
          date: new Date(payload.date),
          depoId: depo.id,
          ledgerHeadId: payItem.ledgerItemId,
          debitAmount: payItem.amount,
          narration: payItem.narration || "",
        });
      }
    }

    // 6️⃣ Handle Discount (Debit)
    if (payload.discount && payload.discount > 0) {
      const discountLedger = await tx.ledgerHead.findFirst({
        where: {
          ledgerName: { contains: "discount" },
        },
      });
      if (!discountLedger) throw new Error("Discount Ledger Head Not Found");

      journalEntries.push({
        transactionId: createTransaction.id,
        date: new Date(payload.date),
        depoId: depo.id,
        ledgerHeadId: discountLedger.id,
        debitAmount: payload.discount,
        narration: "Discount",
      });
    }

    // 7️⃣ Credit Sales Ledger
    const salesLedger = await tx.ledgerHead.findFirst({
      where: { ledgerName: { contains: "sales" } },
    });
    if (!salesLedger) throw new Error("Sales Ledger Head Not Found");

    const totalSaleAmount = payload.productItems.reduce(
      (sum: number, p: any) => sum + p.amount,
      0
    );

    journalEntries.push({
      transactionId: createTransaction.id,
      date: new Date(payload.date),
      depoId: depo.id,
      ledgerHeadId: salesLedger.id,
      creditAmount: totalSaleAmount,
      narration: "Sales transaction",
    });

    // 8️⃣ Validate Journal Balance (Debit = Credit)
    const totalDebit = journalEntries.reduce(
      (sum, j) => sum + (j.debitAmount || 0),
      0
    );
    const totalCredit = journalEntries.reduce(
      (sum, j) => sum + (j.creditAmount || 0),
      0
    );

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(
        `Unbalanced entry: Debit=${totalDebit}, Credit=${totalCredit}`
      );
    }

    // 9️⃣ Insert Journals
    await Promise.all(
      journalEntries.map((entry) => tx.journal.create({ data: entry }))
    );

    // 🔟 Update Order Status if exists
    if (payload.orderNo) {
      const order = await tx.orderStatus.findFirst({
        where: { orderNo: payload.orderNo },
      });
      if (order) {
        await tx.orderStatus.update({
          where: { id: order.id },
          data: { status: OrdStatus.CONFIRMED },
        });
      }
    }

    return createTransaction.id;
  });

  // 🔁 Fetch Final Transaction Info
  return prisma.transactionInfo.findUnique({
    where: { id: result },
    include: {
      inventory: true,
      journal: { include: { ledgerHead: true } },
    },
  });
};

// Create Payment Voucher
const createPaymentVoucher = async (payload: any) => {
  // Step 1: Resolve related entities
  let employeeId: string | null = null;
  let partyId: number | null = null;
  let chemistId: string | null = null;
  let stakeholderId: string | null = null;

  if (payload.userType === "EMPLOYEE") {
    const isEmployee = await prisma.user.findFirst({
      where: { id: payload.paymentTo },
    });
    if (!isEmployee) {
      throw new AppError(StatusCodes.NOT_FOUND, "Employee not found");
    }
    employeeId = isEmployee.employeeId;
  }

  if (["SUPPLIER", "VENDOR"].includes(payload.userType)) {
    const isParty = await prisma.party.findFirst({
      where: { id: payload.paymentTo },
    });
    if (!isParty) {
      throw new AppError(StatusCodes.NOT_FOUND, "Party not found");
    }
    partyId = isParty.id;
  }

  if (payload.userType === "CHEMIST") {
    const isChemist = await prisma.chemist.findFirst({
      where: { id: payload.paymentTo },
    });
    if (!isChemist)
      throw new AppError(StatusCodes.NOT_FOUND, "Chemist not found");
    chemistId = isChemist.chemistId;
  }

  if (payload.userType === "STAKEHOLDER") {
    const isStakeholder = await prisma.stakeholder.findFirst({
      where: { id: payload.paymentTo },
    });
    if (!isStakeholder)
      throw new AppError(StatusCodes.NOT_FOUND, "Stakeholder not found");
    stakeholderId = isStakeholder.stakeId; // 👈 note spelling matches model
  }

  const createVoucher = await prisma.$transaction(async (tx: any) => {
    // step 1. create transaction entries
    const createTransaction: TransactionInfo = await tx.transactionInfo.create({
      data: {
        date: new Date(payload?.date),
        voucherNo: payload.voucherNo,
        voucherType: VoucherType.PAYMENT,
        partyId: partyId,
        chemistId: chemistId,
        stakeholderId: stakeholderId,
        employeeId: employeeId,
      },
    });

    // // 2. create bank transaction
    // const BankTXData: {
    //   transactionId: number;
    //   bankAccountId: number;
    //   debitAmount: number;
    //   date: Date;
    // }[] = [];

    const journalEntries = payload.items.flatMap((item: any) => [
      {
        transactionId: createTransaction.id,
        ledgerHeadId: item.debitItemId,
        date: new Date(payload.date),
        debitAmount: item.amount,
        narration: item.narration,
      },
      {
        transactionId: createTransaction.id,
        ledgerHeadId: item.creditItemId,
        date: new Date(payload.date),
        creditAmount: item.amount,
        narration: item.narration,
      },
    ]);

    await tx.journal.createMany({
      data: journalEntries,
    });

    return createTransaction;
  });
  return createVoucher;
};

const createReceiptVoucher = async (payload: any) => {
  const createVoucher = await prisma.$transaction(async (tx: any) => {
    let partyId: number | undefined;
    let employeeId: string | undefined;
    let chemistId: string | undefined;

    //check party
    if (payload.userType === "SUPPLIER" || payload.userType === "VENDOR") {
      const partyExists = await tx.party.findFirst({
        where: { id: payload.receivedForm },
      });

      if (!partyExists) {
        throw new Error(
          `Invalid partyOrcustomerId: ${payload.partyOrcustomerId}. No matching Party or Customer found.`
        );
      }
      partyId = partyExists.id;
    }

    //check employee
    if (payload.userType === "EMPLOYEE") {
      const employeeExists = await tx.user.findFirst({
        where: { id: payload.receivedForm },
      });

      if (!employeeExists) {
        throw new Error(`Invalid employee, no employee found.`);
      }

      employeeId = employeeExists.employeeId;
    }

    //check employee
    if (payload.userType === "CHEMIST") {
      const chemistIdExists = await tx.chemist.findFirst({
        where: { id: payload.receivedForm },
      });

      if (!chemistIdExists) {
        throw new Error(`Invalid employee, no employee found.`);
      }

      chemistId = chemistIdExists.chemistId;
    }

    // step 1. create transaction entries
    const createTransaction: TransactionInfo = await tx.transactionInfo.create({
      data: {
        date: new Date(payload.date),
        voucherNo: payload.voucherNo,
        partyId: partyId || null,
        employeeId: employeeId || null,
        chemistId: chemistId || null,
        voucherType: VoucherType.RECEIVED,
      },
    });

    // 2. create bank transaction
    const BankTXData: {
      transactionId: number;
      bankAccountId: number;
      debitAmount: number;
      date: Date;
    }[] = [];

    // payload.items.map(async (item: any) => {
    //   if (item.bankId) {
    //     BankTXData.push({
    //       transactionId: createTransaction.id,
    //       bankAccountId: item.bankId,
    //       date: payload.date,
    //       debitAmount: item?.amount,
    //     });
    //   }
    // });

    // if (BankTXData.length > 0) {
    //   await tx.bankTransaction.createMany({
    //     data: BankTXData,
    //   });
    // }

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error("Invalid data: salseItem must be a non-empty array");
    }

    const journalEntries = payload.items.flatMap((item: any) => [
      {
        transactionId: createTransaction.id,
        ledgerHeadId: item.debitItemId,
        date: new Date(payload.date),
        debitAmount: item.amount,
        narration: item.narration,
      },
      {
        transactionId: createTransaction.id,
        ledgerHeadId: item.creditItemId,
        date: new Date(payload.date),
        creditAmount: item.amount,
        narration: item.narration,
      },
    ]);

    const createJournal = await tx.journal.createMany({
      data: journalEntries,
    });
    return createJournal;
  });
  return createVoucher;
};

const createMoneyReceivedVoucher = async (payload: any, user: any) => {
  const moneyReceived = await prisma.$transaction(async (tx): Promise<any> => {
    const chemist = await tx.chemist.findFirst({
      where: {
        chemistId: payload.chemistId,
      },
    });
    if (!chemist) {
      throw new AppError(StatusCodes.NOT_FOUND, "Chemist nor found");
    }
    const ledgerId = await tx.ledgerHead.findFirst({
      where: {
        ledgerName: {
          contains: "accounts receivable",
        },
      },
    });

    if (!ledgerId) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Please create a Accounts Receivable ledger item"
      );
    }

    const voucherNo = await generateVoucherNumber("MRV");

    // step 1. create transaction entries
    const createTransaction: TransactionInfo = await tx.transactionInfo.create({
      data: {
        date: new Date(),
        voucherNo: voucherNo,
        voucherType: VoucherType.MONEY_RECEIVED,
        chemistId: chemist?.chemistId,
        employeeId: user?.employeeId,
        journal: {
          create: {
            ledgerHeadId: ledgerId.id,
            date: new Date(),
            depoId: payload.depoId,
            narration: "Paid",
            creditAmount: payload.totalAmount,
          },
        },
      },
    });

    for (const item of payload.paymentItems) {
      await tx.journal.create({
        data: {
          date: new Date(),
          transactionId: createTransaction.id,
          depoId: payload.depoId,
          ledgerHeadId: item.ledgerItemId,
          debitAmount: item.amount,
          narration: item.narration,
        },
      });
    }

    return createTransaction;
  });

  return moneyReceived;
};

const createJournalVoucher = async (payload: any) => {
  // Step 1: Resolve related entities
  let employeeId: string | null = null;
  let partyId: number | null = null;
  let chemistId: string | null = null;
  let stakeholderId: string | null = null;

  if (payload.userType === "EMPLOYEE") {
    const isEmployee = await prisma.user.findFirst({
      where: { id: payload.journalFor },
    });
    if (!isEmployee) {
      throw new AppError(StatusCodes.NOT_FOUND, "Employee not found");
    }
    employeeId = isEmployee.employeeId;
  }

  if (["SUPPLIER", "VENDOR"].includes(payload.userType)) {
    const isParty = await prisma.party.findFirst({
      where: { id: payload.journalFor },
    });
    if (!isParty) {
      throw new AppError(StatusCodes.NOT_FOUND, "Party not found");
    }
    partyId = isParty.id;
  }

  if (payload.userType === "CHEMIST") {
    const isChemist = await prisma.chemist.findFirst({
      where: { id: payload.journalFor },
    });
    if (!isChemist)
      throw new AppError(StatusCodes.NOT_FOUND, "Chemist not found");
    chemistId = isChemist.chemistId;
  }

  if (payload.userType === "STAKEHOLDER") {
    const isStakeholder = await prisma.stakeholder.findFirst({
      where: { id: payload.journalFor },
    });
    if (!isStakeholder)
      throw new AppError(StatusCodes.NOT_FOUND, "Stakeholder not found");
    stakeholderId = isStakeholder.stakeId; // 👈 note spelling matches model
  }

  const Journal = await prisma.$transaction(async (tx): Promise<any> => {
    // step 1. create transaction entries
    const createTransactionInfo: TransactionInfo =
      await tx.transactionInfo.create({
        data: {
          date: new Date(payload.date),
          voucherNo: payload.voucherNo,
          voucherType: VoucherType.JOURNAL,
          chemistId,
          stakeholderId,
          employeeId,
          partyId,
        },
      });

    await tx.journal.createMany({
      data: [
        {
          transactionId: createTransactionInfo.id,
          ledgerHeadId: payload.debitItemId,
          date: payload.date,
          depoId: payload.depoId,
          debitAmount: payload.amount,
          narration: payload.narration,
        },
        {
          transactionId: createTransactionInfo.id,
          ledgerHeadId: payload.creditItemId,
          date: payload.date,
          depoId: payload.depoId,
          creditAmount: payload.amount,
          narration: payload.narration,
        },
      ],
    });

    return createTransactionInfo.id;
  });
  return Journal;
};

const createFixedVoucher = async (payload: any) => {
  const createFixedVoucher = await prisma.$transaction(async (tx: any) => {
    //check party
    if (payload.chemistId) {
      const partyExists = await tx.chemist.findFirst({
        where: { chemistId: payload.chemistId },
      });

      if (!partyExists) {
        throw new Error(`Invalid chemistId: ${payload.chemistId} `);
      }
    }

    // step 1. create transaction entries
    const createFixedJournal: TransactionInfo = await tx.fixedJournal.create({
      data: {
        date: payload?.date,
        voucherNo: payload.voucherNo,
        chemistId: payload.chemistId,
        depoId: payload.depoId,
        ledgerHeadId: payload.paymentOption.ledgerHeadId,
        debitAmount: payload.paymentOption.amount,
        narration: payload.paymentOption.narration,
      },
    });

    if (
      !Array.isArray(payload.productItems) ||
      payload.productItems.length === 0
    ) {
      throw new Error("Invalid data: salseItem must be a non-empty array");
    }

    const isExistedDepo = await prisma.depo.findFirst({
      where: {
        id: payload.depoId,
      },
    });

    //Step 2: Insert Inventory Records

    await Promise.all(
      payload.productItems.map((item: any) =>
        tx.inventory.create({
          data: {
            date: new Date(payload.date),
            depoId: isExistedDepo?.id,
            fixedJournalId: createFixedJournal.id,
            productId: item.productId,
            unitPrice: item.unitPrice,
            quantityLess: item.quantity,
            creditAmount: item.amount,
            isFixted: true,
          },
        })
      )
    );

    if (payload.discount && payload.discount > 0) {
      const discountItem: LedgerHead | any = await tx.ledgerHead.findFirst({
        where: {
          ledgerName: {
            contains: "discount",
          },
        },
      });

      if (!discountItem) {
        throw new AppError(
          StatusCodes.NOT_FOUND,
          "Discount Ledger Head Not Found"
        );
      }

      await tx.fixedJournal.create({
        data: {
          date: payload.date,
          voucherNo: payload.voucherNo,
          chemistId: payload.chemistId,
          depoId: payload.depoId,
          ledgerHeadId: discountItem.id,
          debitAmount: payload.discount,
          narration: "Discount",
        },
      });
    }

    return createFixedJournal.id;
  });

  const result = await prisma.fixedJournal.findFirst({
    where: {
      id: createFixedVoucher,
    },
    include: {
      inventory: true,
    },
  });
  return result;
};

const createQantaVoucher = async () => {};

export const JurnalService = {
  createPurchestReceivedIntoDB,
  createSalesVoucher,
  addProductTransferIntoDB,
  createPaymentVoucher,
  createReceiptVoucher,
  createJournalVoucher,
  createQantaVoucher,
  createMoneyReceivedVoucher,
  createFixedVoucher,
};
