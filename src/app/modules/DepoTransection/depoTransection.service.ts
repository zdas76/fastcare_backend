import { OrdStatus, VoucherType } from "../../../../generated/prisma";
import { generateVoucherNumber } from "../../helpers/createVoucherNo";
import prisma from "../../shared/prisma";
import { generateVoucherNo } from "./utiles";

const createDepoAllocation = async (payload: any) => {

    const { providerdepoId, receverdepoId, date, narration, productItems } = payload;

    const isProviderDepoExist = await prisma.depo.findUnique({
        where: {
            id: providerdepoId
        }
    })

    if (!isProviderDepoExist) {
        throw new Error("Provider depo not found");
    }

    const isReceverDepoExist = await prisma.depo.findUnique({
        where: {
            id: receverdepoId
        }
    })

    if (!isReceverDepoExist) {
        throw new Error("Recever depo not found");
    }

    const voucherNo = await generateVoucherNo();


    const depoTransecitonId = await prisma.depoTransaction.create({
        data: {
            providerdepoId: providerdepoId,
            receverdepoId: receverdepoId,
            date: new Date(date),
            voucherNo: voucherNo,
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


const getAllDepoAllocation = async () => {
    const result = await prisma.depoTransaction.findMany({
        include: {
            providerdepo: {
                select: {
                    id: true,
                    depoName: true
                }
            },
            receverdepo: {
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
            }
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
                receverdepoId: payload.receverdepoId,
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

const updateDepoAllocation = async (id: number, payload: any) => {

    const isDepoAllocationExist = await prisma.depoTransaction.findUnique({
        where: { id: id }
    })

    if (!isDepoAllocationExist) {
        throw new Error("Depo allocation not found");
    }

    const updateDepoTransection = await prisma.$transaction(async (tx) => {

        await tx.depoTransaction.update({
            where: { id: id },
            data: {
                status: OrdStatus.CONFIRMED,
                providerdepoId: payload.providerdepoId,
                receverdepoId: payload.receverdepoId,
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
                acceptedQuantity: item.acceptedQuantity,
                unitePrice: product.tp,
                amount: product.tp * item.acceptedQuantity
            }
        }))

        if (!inventryData || inventryData.length === 0) {
            throw new Error("Invalid data: depoInventories must be provided");
        }

        // Update each depoInventory record individually
        await Promise.all(inventryData.map(async (item: any) => {
            console.log("item", item)
            await tx.depoInventory.update({
                where: { id: item.id },
                data: {
                    acceptedQuantity: item.acceptedQuantity,
                    unitePrice: item.unitePrice,
                    amount: item.amount
                }
            })
        }))

        const voucherNo = await generateVoucherNumber("ALV");

        const transactionInfo = await tx.transactionInfo.upsert({
            where: { id: id },
            update: {
                date: new Date(payload?.date),
                voucherNo: voucherNo,
                voucherType: VoucherType.ALLOCATION,
                invoiceNo: isDepoAllocationExist.voucherNo
            },
            create: {
                date: new Date(payload?.date),
                voucherNo: voucherNo,
                voucherType: VoucherType.ALLOCATION,
                invoiceNo: isDepoAllocationExist.voucherNo
            }
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

                await tx.inventory.upsert({
                    where: { id: item.id },
                    update: {
                        transactionId: transactionInfo?.id,
                        depoId: payload.providerdepoId,
                        date: new Date(payload?.date),
                        productId: product?.id,
                        unitPrice: product?.tp,
                        quantityLess: item.quantity,
                        creditAmount: item.amount,
                    },
                    create: {
                        transactionId: transactionInfo?.id,
                        depoId: payload.providerdepoId,
                        date: new Date(payload?.date),
                        productId: product?.id,
                        unitPrice: product?.tp,
                        quantityLess: item.quantity,
                        creditAmount: item.amount,
                    }
                })
            })
        );

        if (Math.abs(payload.totalAmount - totalAmount) > 0.01) {
            throw new Error(`Invalid data: Total amount ${totalAmount} does not match payload amount ${payload.totalAmount}`);
        }

        await tx.journal.upsert({
            where: { id: id },
            update: {
                transactionId: transactionInfo?.id,
                ledgerHeadId: payload.ledgerHeadId,
                date: new Date(payload?.date),
                depoId: payload.providerdepoId,
                debitAmount: totalAmount,
                narration: payload.narration || "Product Provided",
            },
            create: {
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

        const journal = await tx.journal.upsert({
            where: { id: id },
            update: {
                transactionId: transactionInfo?.id,
                ledgerHeadId: inventory?.id,
                date: new Date(payload?.date),
                depoId: payload.providerdepoId,
                creditAmount: totalAmount,
                narration: payload.narration || "Product Provided",
            },
            create: {
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

    return updateDepoTransection;
}

export const DepoTransectionService = {
    createDepoAllocation,
    getAllDepoAllocation,
    editDepoAllocation,
    updateDepoAllocation
}