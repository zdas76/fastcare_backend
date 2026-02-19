import { id } from "zod/v4/locales"
import prisma from "../../shared/prisma"

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

    console.log(result);

    return result
}

const updateMPOTarget = async (payload: any) => {
    return payload
}

const deleteMPOTarget = async (payload: any) => {
    return payload
}

export const MpoTargetService = {
    createMPOTarget,
    getMPOTarget,
    updateMPOTarget,
    deleteMPOTarget
}