import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function employeeBranchesSeed() {
    const employeeBranchesPath = path.resolve(
        __dirname,
        'data',
        'employee-branches.json',
    );
    const employeeBranchesRaw = fs.readFileSync(employeeBranchesPath, 'utf-8');
    const employeeBranches = JSON.parse(employeeBranchesRaw).data as {
        name: string;
        email: string;
        password: string;
        phoneNumber: string;
        roleKey: string;
        branchName: string;
        type: string;
    }[];

    for (const employeeBranch of employeeBranches) {
        const existingUser = await prisma.user.findFirst({
            where: { email: employeeBranch.email },
        });

        if (existingUser) {
            console.log(
                `⚠️  Employee "${employeeBranch.name}" already exists. Skipping.`,
            );
            continue;
        }

        // Find role by key
        const role = await prisma.role.findFirst({
            where: { key: employeeBranch.roleKey },
        });

        if (!role) {
            console.log(
                `❌ Role "${employeeBranch.roleKey}" not found. Skipping "${employeeBranch.name}".`,
            );
            continue;
        }

        // Find branch by name
        const branch = await prisma.branch.findFirst({
            where: { name: employeeBranch.branchName },
        });

        if (!branch) {
            console.log(
                `❌ Branch "${employeeBranch.branchName}" not found. Skipping "${employeeBranch.name}".`,
            );
            continue;
        }

        // Hash password
        const hashedPassword = (await bcrypt.hash(
            employeeBranch.password,
            10,
        )) as string;

        const user = await prisma.user.upsert({
            where: { email: employeeBranch.email },
            update: {},
            create: {
                name: employeeBranch.name,
                email: employeeBranch.email,
                phoneNumber: employeeBranch.phoneNumber,
                password: hashedPassword,
                roleId: role.id,
            },
        });

        const existingEmployeeBranch = await prisma.employeeBranch.findFirst({
            where: { userId: user.id, branchId: branch.id },
        });

        if (existingEmployeeBranch) {
            console.log(
                `⚠️  Employee Branch for "${employeeBranch.name}" at branch "${employeeBranch.branchName}" already exists. Skipping.`,
            );
            continue;
        }

        await prisma.employeeBranch.create({
            data: {
                userId: user.id,
                branchId: branch.id,
                type: employeeBranch.type,
            },
        });

        console.log(`✅ Employee "${employeeBranch.name}" seeded`);
    }
}

// For running directly
if (require.main === module) {
    employeeBranchesSeed()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
