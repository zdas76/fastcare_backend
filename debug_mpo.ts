
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma";

dotenv.config();

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log("Checking MPO users...");
    const users = await prisma.user.findMany();
    console.log(`Total users: ${users.length}`);

    const mpos = await prisma.user.findMany({
        where: {
            roles: {
                array_contains: "MPO"
            }
        }
    });
    console.log(`MPOs found with array_contains: ${mpos.length}`);

    if (mpos.length === 0 && users.length > 0) {
        console.log("Sample roles from first user:", JSON.stringify(users[0]?.roles));
    } else {
        for (const mpo of mpos) {
            const scope = await prisma.scope.findFirst({
                where: { employeeId: mpo.employeeId },
                include: { chemist: true }
            });
            console.log(`MPO: ${mpo.name} (${mpo.employeeId}), Status: ${mpo.status}, Scope: ${scope ? "Found" : "Not Found"}, Chemists: ${scope?.chemist.length || 0}`);
        }
    }

    const ledgerHead = await prisma.ledgerHead.findFirst({
        where: {
            ledgerName: {
                contains: "accounts receivable",
            },
        },
    });
    console.log("Ledger head 'accounts receivable':", ledgerHead ? `Found (ID: ${ledgerHead.id})` : "Not Found");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
