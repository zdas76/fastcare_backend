import { OrdStatus, VoucherType } from "../../../../generated/prisma";
import { generateVoucherNumber } from "../../helpers/createVoucherNo";
import prisma from "../../shared/prisma";
import { TCretidItem, TDepoTransection } from "./depoTransection.interface";
import { generateVoucherNo } from "./utiles";

const createDepoAllocation = async (payload: any) => {

    const { providerdepoId, receiverdepoId, date, productItems } = payload;

    const isProviderDepoExist = await prisma.depo.findUnique({
        where: {
            id: providerdepoId
        }
    })

    if (!isProviderDepoExist) {
        throw new Error("Provider depo not found");
    }

    const isReceiverDepoExist = await prisma.depo.findUnique({
        where: {
            id: receiverdepoId
        }
    })

    if (!isReceiverDepoExist) {
        throw new Error("Receiver depo not found");
    }

    const voucherNo = await generateVoucherNo("DPTV");

    const depoTransecitonId = await prisma.depoTransaction.create({
        data: {
            providerdepoId: providerdepoId,
            receiverdepoId: receiverdepoId,
            date: new Date(date),
            voucherNo: voucherNo,
            voucherType: VoucherType.ALLOCATION,
        } as any
    })

    const depoInventoryData = productItems.map((item: any) => {
        return {
            date: new Date(date),
            productId: item.productId,
            reqQuantity: item.quantity,
            depoTransactionId: depoTransecitonId.id
        }
    })

    const depoInvenoty = await prisma.depoInventory.createMany({
        data: depoInventoryData
    })

    return depoInvenoty;

}

const getAllDepoVouchers = async (voucherType: VoucherType) => {
    const result = await prisma.depoTransaction.findMany({
        where: { voucherType: voucherType, },
        include: {
            providerdepo: {
                select: {
                    id: true,
                    depoName: true
                }
            },
            receiverdepo: {
                select: {
                    id: true,
                    depoName: true
                }
            }
        }
    })
    return result;
}

const getDepoVoucherById = async (id: number) => {

    const result = await prisma.depoTransaction.findUnique({
        where: { id: id },
        include: {
            providerdepo: {
                select: {
                    id: true,
                    depoName: true
                }
            },
            receiverdepo: {
                select: {
                    id: true,
                    depoName: true
                }
            },
            depoInventories: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            tp: true
                        }
                    }
                }
            },
            depoJournals: {
                include: {
                    ledgerHead: {
                        select: {
                            id: true,
                            ledgerName: true
                        }
                    }
                }
            },
        }
    })
    return result;
}

const editDepoAllocation = async (id: number, payload: any) => {

    const isDepoAllocationExist = await prisma.depoTransaction.findUnique({
        where: { id: id }
    })

    if (!isDepoAllocationExist) {
        throw new Error("Depo allocation not found");
    }

    const editDepoTransection = await prisma.$transaction(async (tx) => {

        await tx.depoTransaction.update({
            where: { id: id },
            data: {
                providerdepoId: payload.providerdepoId,
                receiverdepoId: payload.receiverdepoId,
            }
        })

        const inventryData = await Promise.all(payload.depoInventories.map(async (item: any) => {
            const product = await tx.product.findUnique({
                where: { id: item.productId }
            })

            if (!product) {
                throw new Error("Product not found");
            }

            return {
                id: item.id,
                reqQuantity: item.reqQuantity,
                unitePrice: product.tp,
                amount: product.tp * item.reqQuantity
            }
        }))

        if (!inventryData || inventryData.length === 0) {
            throw new Error("Invalid data: depoInventories must be provided");
        }

        // Update each depoInventory record individually
        await Promise.all(inventryData.map(async (item: any) => {
            await tx.depoInventory.update({
                where: { id: item.id },
                data: {
                    reqQuantity: item.reqQuantity,
                    unitePrice: item.unitePrice,
                    amount: item.amount
                }
            })
        }))


    })

    return editDepoTransection;
}

const approveDepoAllocation = async (id: number, payload: TDepoTransection) => {

    const isDepoAllocationExist = await prisma.depoTransaction.findUnique({
        where: { id: id }
    })

    if (!isDepoAllocationExist) {
        throw new Error("Depo allocation not found");
    }

    const approveDepoTransection = await prisma.$transaction(async (tx) => {

        await tx.depoTransaction.update({
            where: { id: id },
            data: {
                status: OrdStatus.CONFIRMED,
                providerdepoId: payload.providerdepoId,
                receiverdepoId: payload.receiverdepoId,
            }
        })

        // Separate items with id (existing) from items without id (newly added)
        const existingItems = payload.depoInventories.filter((item: any) => item.id);
        const newItems = payload.depoInventories.filter((item: any) => !item.id);

        // Process existing items for update
        const inventryData = await Promise.all(existingItems.map(async (item: any) => {

            const product = await tx.product.findUnique({
                where: { id: item.productId }
            })

            if (!product) {
                throw new Error("Product not found");
            }
            let ProductAmount = 0
            ProductAmount = Number(product.tp) * Number(item.acceptedQuantity)
            return {
                id: item.id,
                productId: product.id,
                acceptedQuantity: item.acceptedQuantity,
                unitePrice: product.tp,
                amount: ProductAmount
            }
        }))

        if (inventryData.length === 0 && newItems.length === 0) {
            throw new Error("Invalid data: depoInventories must be provided");
        }

        // Update each existing depoInventory record
        await Promise.all(inventryData.map(async (item: any) => {
            await tx.depoInventory.update({
                where: { id: item.id },
                data: {
                    acceptedQuantity: item.acceptedQuantity,
                    unitePrice: item.unitePrice,
                    amount: item.amount
                }
            })
        }))

        // Create new depoInventory records for newly added items
        await Promise.all(newItems.map(async (item: any) => {
            const product = await tx.product.findUnique({
                where: { id: item.productId }
            })

            if (!product) {
                throw new Error("Product not found");
            }

            const ProductAmount = Number(product.tp) * Number(item.acceptedQuantity)

            await tx.depoInventory.create({
                data: {
                    depoTransactionId: id,
                    date: new Date(payload.date),
                    productId: product.id,
                    reqQuantity: item.reqQuantity,
                    acceptedQuantity: item.acceptedQuantity,
                    unitePrice: product.tp,
                    amount: ProductAmount,
                }
            })
        }))

        const voucherNo = await generateVoucherNumber("ALV");

        const transactionInfo = await tx.transactionInfo.create({
            data: {
                date: new Date(payload?.date),
                voucherNo: voucherNo,
                voucherType: VoucherType.ALLOCATION,
                invoiceNo: isDepoAllocationExist.voucherNo
            }
        });

        let totalAmount = 0;

        await Promise.all(
            payload.depoInventories.map(async (item) => {

                const product = await tx.product.findUnique({
                    where: { id: item.productId }
                })

                if (!product) {
                    throw new Error("Product not found");
                }

                totalAmount += Number(product.tp) * Number(item.acceptedQuantity);

                await tx.inventory.create({
                    data: {
                        transactionId: transactionInfo?.id,
                        depoId: payload.providerdepoId,
                        date: new Date(payload?.date),
                        productId: product?.id,
                        unitPrice: product?.tp,
                        quantityLess: item.acceptedQuantity,
                        creditAmount: Number(product.tp) * Number(item.acceptedQuantity),
                    }
                })
            })
        );

        if (Math.abs(payload.debitAmount - totalAmount) > 0.01) {
            throw new Error(`Invalid data: Total amount ${totalAmount} does not match payload amount ${payload.debitAmount}`);
        }

        await tx.journal.create({
            data: {
                transactionId: transactionInfo?.id,
                ledgerHeadId: payload.ledgerHeadId,
                date: new Date(payload?.date),
                depoId: payload.providerdepoId,
                debitAmount: totalAmount,
                narration: payload.narration || "Product Provided",
            }
        });

        const inventory = await tx.ledgerHead.findFirst({
            where: { ledgerName: { contains: "Inventory" } }
        })

        await tx.journal.create({
            data: {
                transactionId: transactionInfo?.id,
                ledgerHeadId: inventory?.id,
                date: new Date(payload?.date),
                depoId: payload.providerdepoId,
                creditAmount: totalAmount,
                narration: payload.narration || "Product Provided",
            }
        });

        return { transactionInfo, inventryData };
    })

    return approveDepoTransection;
}

const confirmDepoAllocation = async (id: number, payload: TDepoTransection) => {

    const isDepoAllocationExist = await prisma.depoTransaction.findUnique({
        where: { id: id }
    })

    if (!isDepoAllocationExist) {
        throw new Error("Depo allocation not found");
    }

    const confirmDepoTransection = await prisma.$transaction(async (tx) => {
        const depoTransection = await tx.depoTransaction.update({
            where: { id: id },
            data: {
                status: OrdStatus.RECEIVED,
            }
        })

        const transactionInfo = await tx.transactionInfo.findFirst({
            where: { invoiceNo: isDepoAllocationExist.voucherNo },
        });

        let totalAmount = 0;

        await Promise.all(
            payload.depoInventories.map(async (item: any) => {

                const product = await tx.product.findUnique({
                    where: { id: item.productId }
                })

                if (!product) {
                    throw new Error("Product not found");
                }

                totalAmount += product.tp * item.acceptedQuantity;

                await tx.inventory.create({
                    data: {
                        transactionId: transactionInfo?.id,
                        depoId: isDepoAllocationExist.receiverdepoId,
                        date: new Date(payload?.date),
                        productId: product?.id,
                        unitPrice: product?.tp,
                        quantityAdd: item.acceptedQuantity,
                        debitAmount: totalAmount,
                    }
                })
            })
        );

        if (Math.abs(payload.debitAmount - totalAmount) > 0.01) {
            throw new Error(`Invalid data: Total amount ${totalAmount} does not match payload amount ${payload.debitAmount}`);
        }

        await tx.journal.create({
            data: {
                transactionId: transactionInfo?.id,
                ledgerHeadId: payload.ledgerHeadId,
                date: new Date(payload?.date),
                depoId: isDepoAllocationExist.receiverdepoId,
                creditAmount: totalAmount,
                narration: payload.narration || "Product Received",
            }
        });

        const inventory = await tx.ledgerHead.findFirst({
            where: { ledgerName: { contains: "Inventory" } }
        })

        await tx.journal.create({
            data: {
                transactionId: transactionInfo?.id,
                ledgerHeadId: inventory?.id,
                date: new Date(payload?.date),
                depoId: isDepoAllocationExist.receiverdepoId,
                debitAmount: totalAmount,
                narration: payload.narration || "Product Received",
            },
        });

        return { depoTransection, transactionInfo };
    })

    return confirmDepoTransection;
}

const deleteDepoAllocation = async (id: number) => {
    const result = await prisma.$transaction(async (tx) => {
        await tx.depoInventory.deleteMany({
            where: { depoTransactionId: id },
        })
        await tx.depoJournal.deleteMany({
            where: { depoTransactionId: id },
        })
        const depoTransection = await tx.depoTransaction.delete({
            where: { id: id },
        })

        return depoTransection
    })
    return result
}

const createDepoPayment = async (payload: any) => {

    const createDepoPayment = await prisma.$transaction(async (tx) => {

        const voucherNo = await generateVoucherNo("DPQV")

        const depoTransectioninfo = await tx.depoTransaction.create({
            data: {
                providerdepoId: payload.providerdepoId,
                receiverdepoId: payload.receiverdepoId,
                date: new Date(payload?.date),
                voucherNo: voucherNo,
                voucherType: VoucherType.PAYMENT,
                status: OrdStatus.PENDING,
            }
        })

        await Promise.all(payload.debitItems.map(async (item: any) => {
            await tx.depoJournal.create({
                data: {
                    depoTransactionId: depoTransectioninfo?.id,
                    date: new Date(payload?.date),
                    ledgerHeadId: item.itemId,
                    debitAmount: item.amount,
                    narration: item.narration,
                }
            })

        }));

        await Promise.all(payload.creditItems?.map(async (item: TCretidItem) => {
            await tx.depoJournal.create({
                data: {
                    depoTransactionId: depoTransectioninfo?.id,
                    date: new Date(payload?.date),
                    ledgerHeadId: item.itemId,
                    creditAmount: item.amount,
                    narration: item.narration,
                }
            })

        }));

        return { depoTransectioninfo }
    })

    return createDepoPayment
}

const updateDepoPayment = async (id: number, payload: any) => {
    const depoPaymentExist = await prisma.depoTransaction.findUnique({
        where: { id: id, voucherType: VoucherType.PAYMENT }
    })

    if (!depoPaymentExist) {
        throw new Error("Depo payment not found");
    }

    if (depoPaymentExist.status !== "PENDING") {
        throw new Error("Depo payment is already confirmed");
    }

    const result = await prisma.$transaction(async (tx) => {

        await tx.depoTransaction.update({
            where: { id: id },
            data: {
                date: new Date(payload?.date),
                providerdepoId: payload.providerdepoId,
                receiverdepoId: payload.receiverdepoId,
            }
        })

        await tx.depoJournal.deleteMany({
            where: { depoTransactionId: id },
        })
        await Promise.all(payload.creditItems?.map(async (item: any) => {
            await tx.depoJournal.create({
                data: {
                    depoTransactionId: id,
                    date: new Date(payload?.date),
                    ledgerHeadId: item.itemId,
                    creditAmount: item.amount,
                    narration: item.narration,
                }
            })
        }));

        await Promise.all(payload.debitItems.map(async (item: any) => {
            await tx.depoJournal.create({
                data: {
                    depoTransactionId: id,
                    date: new Date(payload?.date),
                    ledgerHeadId: item.itemId,
                    debitAmount: item.amount,
                    narration: item.narration,
                }
            })
        }));

        const depoTransection = await tx.depoTransaction.update({
            where: { id: id },
            data: {
                date: new Date(payload?.date),
            }
        })

        return depoTransection
    })
    return result
}

const createDepoReceive = async (payload: any) => {


    const result = await prisma.$transaction(async (tx) => {


        const depoTransectioninfo = await tx.depoTransaction.findFirst({
            where: {
                voucherNo: payload.voucherNo,

            }
        })

        if (!depoTransectioninfo?.id) {
            throw new Error("Depo transaction not found");
        }

        if (depoTransectioninfo?.status !== "PENDING") {
            throw new Error("Depo transaction is already confirmed");
        }

        await tx.depoTransaction.update({
            where: { id: depoTransectioninfo?.id },
            data: {
                status: OrdStatus.CONFIRMED,
            }
        })



        // const tranasectionVoucherNo = await generateVoucherNumber("PV")

        // const transactionInfo = await tx.transactionInfo.create({
        //     data: {
        //         date: new Date(payload?.date),
        //         voucherNo: tranasectionVoucherNo,
        //         voucherType: VoucherType.PAYMENT,
        //     }
        // })

        // await Promise.all(payload.debitItems.map(async (item: any) => {
        //     await tx.journal.create({
        //         data: {
        //             transactionId: transactionInfo?.id,
        //             date: new Date(payload?.date),
        //             ledgerHeadId: item.itemId,
        //             depoId: payload.providerdepoId,
        //             debitAmount: item.amount,
        //             narration: item.narration,
        //         }
        //     })

        // }));

        // await Promise.all(payload.creditItems?.map(async (item: TCretidItem) => {
        //     await tx.journal.create({
        //         data: {
        //             transactionId: transactionInfo?.id,
        //             date: new Date(payload?.date),
        //             ledgerHeadId: item.itemId,
        //             depoId: payload.providerdepoId,
        //             creditAmount: item.amount,
        //             narration: item.narration,
        //         }
        //     })

        // }));




        //     await Promise.all(payload.creditItems?.map(async (item: any) => {
        //     await tx.depoJournal.create({
        //         data: {
        //             depoTransactionId: depoTransectioninfo?.id,
        //             date: new Date(payload?.date),
        //             ledgerHeadId: item.itemId,
        //             creditAmount: item.amount,
        //             narration: item.narration,
        //         }
        //     })
        // }));

        // await Promise.all(payload.debitItems.map(async (item: any) => {
        //     await tx.depoJournal.create({
        //         data: {
        //             depoTransactionId: depoTransectioninfo?.id,
        //             date: new Date(payload?.date),
        //             ledgerHeadId: item.itemId,
        //             debitAmount: item.amount,
        //             narration: item.narration,
        //         }
        //     })
        // }
        // ));




        return depoTransectioninfo

    })

    return result
}


export const DepoTransectionService = {
    createDepoAllocation,
    getAllDepoVouchers,
    editDepoAllocation,
    approveDepoAllocation,
    confirmDepoAllocation,
    createDepoPayment,
    getDepoVoucherById,
    deleteDepoAllocation,
    updateDepoPayment,
    createDepoReceive,

}