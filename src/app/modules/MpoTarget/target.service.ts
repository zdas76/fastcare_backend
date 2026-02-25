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

export const MpoTargetService = {
    createMPOTarget,
    getMPOTarget,
    updateMPOTarget,
    deleteMPOTarget
}