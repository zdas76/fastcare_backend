import { string } from "zod";
import { VoucherType } from "../../../../generated/prisma";
import prisma from "../../shared/prisma";


const getInventoryProgressByMPO = async ({
    startDate,
    endDate,
    depoId
}: {
    startDate?: string;
    endDate?: string;
    depoId?: number;
}) => {

    let fromDate: Date;
    let toDate: Date;

    const today = new Date();
    const firstDayOfMonth = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), 1),
    );

    fromDate = startDate ? new Date(startDate) : firstDayOfMonth;
    if (endDate) {
        toDate = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    } else {
        toDate = today;
    }

    const getMPO = await prisma.user.findMany({
        where: {
            roles: { array_contains: "MPO" },
            status: "ACTIVE",
            ...(depoId && depoId > 0 ? { scope: { depo: { some: { id: Number(depoId) } } } } : {})
        },
        select: {
            id: true,
            employeeId: true,
            name: true,
            roles: true,
        }
    });

    let mpoProgressReport: any = [];

    for (const mpo of getMPO) {

        const scope = await prisma.scope.findFirst({
            where: {
                employeeId: mpo.employeeId,
            },
            include: {
                chemist: { select: { chemistId: true } },
            },
        });

        if (!scope) {
            continue;
        }

        const chemistIds = scope?.chemist.map((c: any) => c.chemistId) || [];

        const totalSales = await prisma.inventory.aggregate({
            _sum: { quantityLess: true },
            where: {
                transactionInfo: {
                    chemistId: { in: chemistIds },
                    voucherType: VoucherType.SALES,
                },
                date: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
        });

        const totalReturn = await prisma.inventory.aggregate({
            _sum: { quantityLess: true },
            where: {
                transactionInfo: {
                    employeeId: mpo.employeeId,
                    voucherType: VoucherType.SALES_RETURN,
                },
                date: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
        });

        const grandSale = (totalSales._sum.quantityLess ?? 0) - (totalReturn._sum.quantityLess ?? 0);
        mpoProgressReport.push(
            {
                mpo,
                totalSales: totalSales._sum.quantityLess ?? 0,
                totalReturn: totalReturn._sum.quantityLess ?? 0,
                grandSale
            }
        )
    }

    return mpoProgressReport;
};


const getInventoryProgressByMPOIds = async (employeeId: string, startDate?: string, endDate?: string) => {
    let fromDate: Date;
    let toDate: Date;

    const today = new Date();
    const firstDayOfMonth = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), 1),
    );

    fromDate = startDate ? new Date(startDate) : firstDayOfMonth;
    if (endDate) {
        toDate = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    } else {
        toDate = today;
    }

    const getMPO = await prisma.user.findFirst({
        where: {
            employeeId: employeeId,
            status: "ACTIVE",
        },
        select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
            roles: true,
            status: true,
        },
    });

    if (!getMPO) {
        throw new Error("MPO not found");
    }

    let ProductWiseProgressReport: any = [];

    const products = await prisma.product.findMany({
        where: {
            status: "ACTIVE",
        },
        select: {
            id: true,
            name: true,
        },
    });

    for (const product of products) {

        const scope = await prisma.scope.findFirst({
            where: {
                employeeId: getMPO.employeeId,
            },
            include: {
                chemist: { select: { chemistId: true } },
            },
        });

        if (!scope) {
            continue;
        }

        const chemistIds = scope?.chemist.map((c: any) => c.chemistId) || [];

        const totalSales = await prisma.inventory.aggregate({
            _sum: { quantityLess: true },
            where: {
                transactionInfo: {
                    chemistId: { in: chemistIds },
                    voucherType: VoucherType.SALES,
                },
                date: {
                    gte: fromDate,
                    lte: toDate,
                },
                productId: product.id
            },
        });

        const totalReturn = await prisma.inventory.aggregate({
            _sum: { quantityLess: true },
            where: {
                transactionInfo: {
                    employeeId: getMPO.employeeId,
                    voucherType: VoucherType.SALES_RETURN,
                },
                date: {
                    gte: fromDate,
                    lte: toDate,
                },
                productId: product.id
            },
        });

        const grandSale = (totalSales._sum.quantityLess ?? 0) - (totalReturn._sum.quantityLess ?? 0);
        ProductWiseProgressReport.push(
            {
                product,
                totalSales: totalSales._sum.quantityLess ?? 0,
                totalReturn: totalReturn._sum.quantityLess ?? 0,
                grandSale
            }
        )
    }

    return { getMPO, ProductWiseProgressReport };
};

const gerProductProgressByDepo = async (depoId?: number, startDate?: string, endDate?: string) => {

    let fromDate: Date;
    let toDate: Date;

    const today = new Date();
    const firstDayOfMonth = new Date(
        Date.UTC(today.getFullYear(), today.getMonth(), 1),
    );

    fromDate = startDate ? new Date(startDate) : firstDayOfMonth;
    if (endDate) {
        toDate = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    } else {
        toDate = today;
    }

    const products = await prisma.product.findMany({
        where: {
            status: "ACTIVE"
        },
        select: {
            id: true,
            name: true,
        }
    })

    const report = await Promise.all(products.map(async (product) => {

        const totalSales = await prisma.inventory.aggregate({
            _sum: { quantityLess: true },
            where: {
                transactionInfo: {
                    voucherType: VoucherType.SALES,
                },
                date: {
                    gte: fromDate,
                    lte: toDate,
                },
                productId: product.id,
                employeeId: null,
                ...(depoId && depoId > 0 ? { depoId: Number(depoId) } : {})

            },
        });

        const totalReturn = await prisma.inventory.aggregate({
            _sum: { quantityAdd: true },
            where: {
                transactionInfo: {
                    voucherType: VoucherType.SALES_RETURN,
                },
                date: {
                    gte: fromDate,
                    lte: toDate,
                },
                productId: product.id,
                ...(depoId && depoId > 0 ? { depoId: Number(depoId) } : {})
            },
        });

        const grandSale = (totalSales._sum.quantityLess ?? 0) - (totalReturn._sum.quantityAdd ?? 0);
        return {
            product,
            totalSales: totalSales._sum.quantityLess ?? 0,
            totalReturn: totalReturn._sum.quantityAdd ?? 0,
            grandSale
        }
    }))

    return report;
}




export const InventoryProgressService = {
    getInventoryProgressByMPO,
    getInventoryProgressByMPOIds,
    gerProductProgressByDepo
}