import { id, ta } from "zod/v4/locales"
import prisma from "../../shared/prisma"
import { VoucherType } from "../../../../generated/prisma"

const createMPOTarget = async (payload: any) => {

    const isEmployee = await prisma.user.findUnique({
        where: {
            employeeId: payload.employeeId
        }
    })
    if (!isEmployee) {
        throw new Error("Employee not found")

    }

    const isTargetExist = await prisma.mpoTarget.findFirst({
        where: {
            employeeId: payload.employeeId,
            month: payload.month
        }
    })
    if (isTargetExist) {
        throw new Error("Target already exists")
    }
    const result = await prisma.mpoTarget.create({
        data: payload
    })

    return result
}

const getMPOTarget = async () => {
    const result = await prisma.mpoTarget.findMany({

        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    employeeId: true,
                    status: true,
                    roles: true,
                }
            }
        }
    })


    return result
}

const updateMPOTarget = async (payload: any, id: number) => {

    const isTargetExist = await prisma.mpoTarget.findFirst({
        where: {
            id
        }
    })
    if (!isTargetExist) {
        throw new Error("Target not found")
    }
    const isEmployee = await prisma.user.findUnique({
        where: {
            employeeId: isTargetExist.employeeId
        }
    })
    if (!isEmployee) {
        throw new Error("Employee not found")

    }
    const result = await prisma.mpoTarget.update({
        where: {
            id
        },
        data: payload
    })
    return result
}

const deleteMPOTarget = async (id: number) => {
    const isTargetExist = await prisma.mpoTarget.findFirst({
        where: {
            id
        }
    })
    if (!isTargetExist) {
        throw new Error("Target not found")
    }
    const isEmployee = await prisma.user.findUnique({
        where: {
            employeeId: isTargetExist.employeeId
        }
    })
    if (!isEmployee) {
        throw new Error("Employee not found")

    }
    const result = await prisma.mpoTarget.delete({
        where: {
            id
        }
    })
    return result
}

const getAllMpoProgressReport = async ({
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
            ...(depoId && depoId > 0 ? { scope: { depo: { some: { id: depoId } } } } : {}),
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

    // Ledger head
    const ledgerHead = await prisma.ledgerHead.findFirst({
        where: {
            ledgerName: {
                contains: "accounts receivable",
            },
        },
    });

    if (!ledgerHead) {
        throw new Error("Ledger head not found");
    }


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


        const target = await prisma.mpoTarget.findFirst({
            where: {
                employeeId: mpo.employeeId,
            },
        });

        const chemistIds = scope?.chemist.map((c: any) => c.chemistId) || [];


        const transections = await prisma.journal.aggregate({
            _sum: { debitAmount: true, creditAmount: true },
            where: {
                transactionInfo: {
                    chemistId: { in: chemistIds },
                    voucherType: {
                        not: VoucherType.SALES_RETURN,
                    },
                },
                ledgerHeadId: ledgerHead.id,
                date: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
        });

        mpoProgressReport.push(
            {
                mpo,
                target,
                transections
            }
        )
    }

    return mpoProgressReport;
};

const getAllMpoProgressReportById = async (employeeId: string, {
    startDate,
    endDate,
}: {
    startDate?: string;
    endDate?: string;
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

    const mpo = await prisma.user.findUnique({
        where: {
            employeeId: employeeId,
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

    if (!mpo) {
        throw new Error("MPO not found")
    }
    // Ledger head
    const ledgerHead = await prisma.ledgerHead.findFirst({
        where: {
            ledgerName: {
                contains: "accounts receivable",
            },
        },
    });

    if (!ledgerHead) {
        throw new Error("Ledger head not found");
    }



    const scope = await prisma.scope.findFirst({
        where: {
            employeeId: mpo?.employeeId,
        },
        include: {
            chemist: { select: { chemistId: true } },
        },
    });

    if (!scope) {
        throw new Error("Scope not found")
    }


    const target = await prisma.mpoTarget.findFirst({
        where: {
            employeeId: mpo?.employeeId,
        },
    });

    const chemistIds = scope?.chemist.map((c: any) => c.chemistId) || [];


    const transections = await prisma.journal.aggregate({
        _sum: { debitAmount: true, creditAmount: true },
        where: {
            transactionInfo: {
                chemistId: { in: chemistIds },
            },
            ledgerHeadId: ledgerHead.id,
            date: {
                gte: fromDate,
                lte: toDate,
            },
        },
    });

    return {
        mpo,
        target,
        transections
    };
};



export const MpoTargetService = {
    createMPOTarget,
    getMPOTarget,
    updateMPOTarget,
    deleteMPOTarget,
    getAllMpoProgressReport,
    getAllMpoProgressReportById
}