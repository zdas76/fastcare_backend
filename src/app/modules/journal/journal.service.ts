import { FixedJournal } from "./../../../../node_modules/.prisma/client/index.d";
import {
  OrdStatus,
  PaymentType,
  VoucherType,
  type LedgerHead,
  type TransactionInfo,
} from "@prisma/client";
import prisma from "../../shared/prisma";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { generateVoucherNumber } from "../../helpers/createVoucherNo";

//Create Purchase Received Voucher
const createPurchestReceivedIntoDB = async (payload: any) => {
  console.log(payload);

  const createPurchestVoucher = await prisma.$transaction(async (tx: any) => {
    // Check if supplier exists
    const supplierExists = await tx.party.findFirst({
      where: { id: payload.supplierId },
    });

    console.log(supplierExists, "suppliers");

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
    // await Promise.all(
    //   payload.productItem.map((item: any) =>
    //     tx.Inventory.create({
    //       data: {
    //         productId: item.productId,
    //         transactionId: createTransactionInfo.id,
    //         date: new Date(payload.date),
    //         unitPrice: item.unitPrice,
    //         quantityAdd: item.quantity,
    //         debitAmount: item.amount,
    //         depoId: payload.depoId,
    //       },
    //     })
    //   )
    // );

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
        },
      },
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
        tx.Inventory.create({
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
        tx.Inventory.create({
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
        depoId: payload.receverdepoId,
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
        depoId: payload.providerdepoId,
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

// create Salse Voucher
const createSalesVoucher = async (payload: any) => {
  const createSalseVoucher = await prisma.$transaction(async (tx: any) => {
    //check party
    if (payload.chemistId) {
      const partyExists = await tx.chemist.findFirst({
        where: { chemistId: payload.chemistId },
      });

      if (!partyExists) {
        throw new Error(
          `Invalid chemistId: ${payload.chemistId}. No matching Party or Customer found.`
        );
      }
    }

    if (payload.partyId) {
      const partyExists = await tx.party.findFirst({
        where: { partyId: payload.partyId },
      });

      if (!partyExists) {
        throw new Error(
          `Invalid chemistId: No matching Party or Customer found.`
        );
      }
    }

    // step 1. create transaction entries
    const createTransactionInfo: TransactionInfo =
      await tx.transactionInfo.create({
        data: {
          date: payload?.date,
          invoiceNo: payload.invoiceNo || null,
          voucherNo: payload.voucherNo,
          paymentType: payload.paymentType,
          voucherType: VoucherType.SALES,
          chemistId: payload.chemistId || null,
          partyId: payload.partyId || null,
        },
      });

    // 2. create bank transaction
    const BankTXData: {
      transactionId: number;
      bankAccountId: number;
      debitAmount: number;
      date: Date;
    }[] = [];

    payload.paymentItems.map(async (item: any) => {
      if (item.bankAccountId) {
        BankTXData.push({
          transactionId: createTransactionInfo.id,
          bankAccountId: item.bankAccountId,
          date: payload.date,
          debitAmount: item?.amount,
        });
      }
    });

    if (BankTXData.length > 0) {
      await tx.BankTransaction.createMany({
        data: BankTXData,
      });
    }

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
            transactionId: createTransactionInfo.id,
            productId: item.productId,
            unitPrice: item.unitPrice,
            quantityLess: item.quantity,
            creditAmount: item.amount,
          },
        })
      )
    );

    if (
      !Array.isArray(payload.paymentItems) ||
      payload.paymentItems.length === 0
    ) {
      throw new Error("Invalid data: paymentItems must be a non-empty array");
    }

    await Promise.all(
      payload.paymentItems.map((item: any) =>
        tx.journal.create({
          data: {
            transactionId: createTransactionInfo.id,
            date: payload.date,
            depoId: isExistedDepo?.id,
            ledgerHeadId: item.ledgerItemId,
            debitAmount: item.amount,
            narration: item?.narration || "",
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

      await tx.journal.create({
        data: {
          transactionId: createTransactionInfo.id,
          date: payload.date,
          depoId: payload.depoId,
          ledgerHeadId: discountItem.id,
          debitAmount: payload.discount,
          narration: "Discount",
        },
      });
    }

    if (payload.orderNo) {
      const isOrderStatus = await tx.orderStatus.findFirst({
        where: {
          orderNo: payload?.orderNo,
        },
      });

      if (isOrderStatus) {
        await tx.orderStatus.update({
          where: {
            id: isOrderStatus.id,
          },
          data: {
            status: OrdStatus.CONFIRMED,
          },
        });
      }
    }

    return createTransactionInfo.id;
  });

  const result = await prisma.transactionInfo.findFirst({
    where: {
      id: createSalseVoucher,
    },
    select: {
      date: true,
      voucherNo: true,
      voucherType: true,
      paymentType: true,
      inventory: true,
      journal: true,
    },
  });
  return result;
};

// Create Payment Voucher
const createPaymentVoucher = async (payload: any) => {
  // Step 1: Resolve related entities
  let employeeId: string | null = null;
  let partyId: number | null = null;
  let chemistId: string | null = null;
  let stakeholderId: string | null = null; // 👈 matches your schema

  if (payload.userType === "EMPLOYEE") {
    const isEmployee = await prisma.user.findFirst({
      where: { id: payload.paymentTo },
    });
    if (!isEmployee)
      throw new AppError(StatusCodes.NOT_FOUND, "Employee not found");
    employeeId = isEmployee.employeeId;
  }

  if (["SUPPLIER", "VENDOR"].includes(payload.userType)) {
    const isParty = await prisma.party.findFirst({
      where: { id: payload.paymentTo },
    });
    if (!isParty) throw new AppError(StatusCodes.NOT_FOUND, "Party not found");
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
    const createTransactionInfo: TransactionInfo =
      await tx.transactionInfo.create({
        data: {
          date: new Date(payload?.date),
          voucherNo: payload.voucherNo,
          voucherType: VoucherType.PAYMENT,
          ...(partyId && { party: { connect: { id: partyId } } }),
          ...(chemistId && { chemist: { connect: { chemistId } } }),
          ...(stakeholderId && {
            stakeholder: { connect: { stakeId: stakeholderId } },
          }),
          ...(employeeId && { user: { connect: { employeeId } } }),
        },
      });

    // 2. create bank transaction
    const BankTXData: {
      transactionId: number;
      bankAccountId: number;
      debitAmount: number;
      date: Date;
    }[] = [];

    await tx.journal.createMany({
      data: [
        {
          transactionId: createTransactionInfo.id,
          ledgerHeadId: payload.creditItemId,
          date: new Date(payload.date),
          depoId: payload.depoId,
          creditAmount: payload.amount,
          narration: payload.narration,
        },
        {
          transactionId: createTransactionInfo.id,
          ledgerHeadId: payload.debitItemId,
          date: new Date(payload.date),
          depoId: payload.depoId,
          debitAmount: payload.amount,
          narration: payload.narration,
        },
      ],
    });

    return createTransactionInfo;
  });
  return createVoucher;
};

const createReceiptVoucher = async (payload: any) => {
  const createVoucher = await prisma.$transaction(async (tx: any) => {
    //check party
    const partyExists = await tx.party.findFirst({
      where: { id: payload.partyId },
    });

    if (!partyExists) {
      throw new Error(
        `Invalid partyOrcustomerId: ${payload.partyOrcustomerId}. No matching Party or Customer found.`
      );
    }
    const transactionInfoData = {
      date: payload?.date,
      voucherNo: payload.voucherNo,
      partyType: partyExists.partyType,
      partyId: partyExists.id,
      voucherType: VoucherType.RECEIVED,
    };

    // step 1. create transaction entries
    const createTransactionInfo: TransactionInfo =
      await tx.transactionInfo.create({
        data: transactionInfoData,
      });

    // 2. create bank transaction
    const BankTXData: {
      transactionId: number;
      bankAccountId: number;
      debitAmount: number;
      date: Date;
    }[] = [];

    payload.debitItem.map(async (item: any) => {
      if (item.bankId) {
        BankTXData.push({
          transactionId: createTransactionInfo.id,
          bankAccountId: item.bankId,
          date: payload.date,
          debitAmount: item?.amount,
        });
      }
    });

    if (BankTXData.length > 0) {
      await tx.bankTransaction.createMany({
        data: BankTXData,
      });
    }

    if (!Array.isArray(payload.debitItem) || payload.debitItem.length === 0) {
      throw new Error("Invalid data: salseItem must be a non-empty array");
    }

    const journalDebitItems: {
      transactionId: number;
      accountsItemId: number;
      debitAmount: number;
      narration: string;
    }[] = [];

    payload.debitItem.map((item: any) => {
      if (!item.bankId)
        journalDebitItems.push({
          transactionId: createTransactionInfo.id,
          accountsItemId: item.accountsItemId,
          debitAmount: item.amount || 0,
          narration: item?.narration || "",
        });
    });

    if (!Array.isArray(payload.creditItem) || payload.creditItem.length === 0) {
      throw new Error("Invalid data: salseItem must be a non-empty array");
    }

    // Step 7: Prepare Journal Credit Entries (For Payment Accounts)
    const journalCreditItems = payload.creditItem.map((item: any) => ({
      transactionId: createTransactionInfo.id,
      accountsItemId: item.accountsItemId,
      creditAmount: item.amount || 0,
      narration: item?.narration || "",
    }));

    const journalItems = [...journalDebitItems, ...journalCreditItems];

    const createJournal = await tx.journal.createMany({
      data: journalItems,
    });
    return createJournal;
  });
  return createVoucher;
};

const createMoneyReceivedVoucher = async (payload: any, user: any) => {
  console.log(payload);
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
        "Please chreate a accounts receivable ledger item"
      );
    }

    const voucherNo = await generateVoucherNumber("MRV");

    console.log(voucherNo, "voucherNo");

    // step 1. create transaction entries
    const createTransactionInfo: TransactionInfo =
      await tx.transactionInfo.create({
        data: {
          date: new Date(),
          voucherNo: voucherNo,
          voucherType: VoucherType.MONEY_RECEIVED,
          chemistId: chemist?.chemistId,
          journal: {
            create: {
              ledgerHeadId: ledgerId.id,
              date: new Date(),
              depoId: payload.depoId,
              narration: "Paid",
              debitAmount: payload.totalAmount,
            },
          },
        },
      });

    await tx.transactionInfo.create({
      data: {
        date: new Date(),
        voucherNo: voucherNo,
        voucherType: VoucherType.MONEY_RECEIVED,
        employeeId: user?.employeeId,
        journal: {
          create: payload.paymentItems.map((item: any) => ({
            date: new Date(),
            depoId: payload.depoId,
            ledgerHeadId: item.ledgerItemId,
            creditAmount: item.amount,
            narration: item.narration,
          })),
        },
      },
    });

    // 2. create bank transaction

    return createTransactionInfo;
  });

  return moneyReceived;
};

const createJournalVoucher = async (payload: any) => {
  const Journal = await prisma.$transaction(async (tx): Promise<any> => {
    const chemist = await tx.chemist.findFirst({
      where: {
        chemistId: payload.chemistId,
      },
    });
    if (!chemist) {
      throw new AppError(StatusCodes.NOT_FOUND, "Chemist nor found");
    }
    // step 1. create transaction entries
    const createTransactionInfo: TransactionInfo =
      await tx.transactionInfo.create({
        data: {
          date: new Date(payload.date),
          voucherNo: payload.voucherNo,
          voucherType: VoucherType.JOURNAL,
          chemistId: chemist?.chemistId,
        },
      });

    await tx.journal.createMany({
      data: [
        {
          transactionId: createTransactionInfo.id,
          ledgerHeadId: payload.debitItemId,
          date: payload.date,
          debitAmount: payload.amount,
          narration: payload.narration,
        },
        {
          transactionId: createTransactionInfo.id,
          ledgerHeadId: payload.creditItemId,
          date: payload.date,
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
  console.log(payload);

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
