import prisma from "../../shared/prisma";

export const generateVoucherNo = async (type: string) => {

    const lastTransaction = await prisma.depoTransaction.findFirst({
        where: {
            voucherNo: {
                startsWith: type
            }
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    if (!lastTransaction) {
        return `${type}-000001`;
    }
    const lastVoucherNo = lastTransaction.voucherNo;
    const lastVoucherNoParts = lastVoucherNo.split("-");
    const lastVoucherNoNumber = parseInt(lastVoucherNoParts[1]);
    const newVoucherNoNumber = lastVoucherNoNumber + 1;
    const newVoucherNo = `${type}-` + newVoucherNoNumber.toString().padStart(6, '0');
    return newVoucherNo;
}