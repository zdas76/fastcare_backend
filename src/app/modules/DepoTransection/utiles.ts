import prisma from "../../shared/prisma";

export const generateVoucherNo = async () => {

    const lastTransaction = await prisma.depoTransaction.findFirst({
        orderBy: {
            createdAt: 'desc',
        },
    });

    if (!lastTransaction) {
        return "DT-000001";
    }
    const lastVoucherNo = lastTransaction.voucherNo;
    const lastVoucherNoParts = lastVoucherNo.split("-");
    const lastVoucherNoNumber = parseInt(lastVoucherNoParts[1]);
    const newVoucherNoNumber = lastVoucherNoNumber + 1;
    const newVoucherNo = "DT-" + newVoucherNoNumber.toString().padStart(6, '0');
    return newVoucherNo;
}