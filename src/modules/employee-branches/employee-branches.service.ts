import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeBranchDto } from './dto/create-employee-branch.dto';
import { UpdateEmployeeBranchDto } from './dto/update-employee-branch.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { EmployeeBranch } from '@prisma/client';

@Injectable()
export class EmployeeBranchesService {
    constructor(private readonly prismaService: PrismaService) {}

    private async validateUniqueEmail(email: string, excludeUserId?: number) {
        const existingUser = await this.prismaService.user.findUnique({
            where: { email },
        });
        if (existingUser && existingUser.id !== excludeUserId) {
            throw new BadRequestException('Email already in use');
        }
    }

    private async validateBranchExists(branchId: number) {
        const branch = await this.prismaService.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch) {
            throw new NotFoundException('Branch does not exist');
        }
    }

    private async validateRoleExists(roleId: number) {
        const role = await this.prismaService.role.findUnique({
            where: { id: roleId },
        });

        if (!role) {
            throw new NotFoundException('Role does not exist');
        }
    }

    async create(createEmployeeBranchDto: CreateEmployeeBranchDto) {
        await Promise.all([
            this.validateUniqueEmail(createEmployeeBranchDto.email),
            this.validateBranchExists(createEmployeeBranchDto.branch_id),
            this.validateRoleExists(createEmployeeBranchDto.role_id),
        ]);

        return await this.prismaService.$transaction(async (prisma) => {
            // Create the user
            const user = await prisma.user.create({
                data: {
                    name: createEmployeeBranchDto.name,
                    email: createEmployeeBranchDto.email,
                    phoneNumber: createEmployeeBranchDto.phone_number,
                    password: (await bcrypt.hash(
                        createEmployeeBranchDto.password,
                        10,
                    )) as string,
                    avatar: createEmployeeBranchDto.avatar || null,
                    roleId: createEmployeeBranchDto.role_id,
                },
            });

            // Create the employee branch
            const employeeBranch = await prisma.employeeBranch.create({
                data: {
                    userId: user.id,
                    branchId: createEmployeeBranchDto.branch_id,
                    type: createEmployeeBranchDto.type,
                },
            });

            return employeeBranch;
        });
    }

    async findAll(): Promise<EmployeeBranch[]> {
        const employeeBranches =
            await this.prismaService.employeeBranch.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phoneNumber: true,
                            avatar: true,
                        },
                    },
                    branch: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                        },
                    },
                },
            });

        return employeeBranches;
    }

    async findOne(id: number): Promise<EmployeeBranch> {
        const employeeBranch =
            await this.prismaService.employeeBranch.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phoneNumber: true,
                            avatar: true,
                        },
                    },
                    branch: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                        },
                    },
                },
            });
        if (!employeeBranch) {
            throw new NotFoundException('Employee Branch not found');
        }

        return employeeBranch;
    }

    async update(
        id: number,
        updateEmployeeBranchDto: UpdateEmployeeBranchDto,
    ): Promise<EmployeeBranch> {
        const existingEmployeeBranch = await this.findOne(id);

        const validationPromises: Promise<void>[] = [];

        if (updateEmployeeBranchDto.email) {
            validationPromises.push(
                this.validateUniqueEmail(
                    updateEmployeeBranchDto.email,
                    existingEmployeeBranch.userId,
                ),
            );
        }

        if (updateEmployeeBranchDto.branch_id) {
            validationPromises.push(
                this.validateBranchExists(existingEmployeeBranch.branchId),
            );
        }

        if (updateEmployeeBranchDto.role_id) {
            validationPromises.push(
                this.validateRoleExists(updateEmployeeBranchDto.role_id),
            );
        }

        return this.prismaService.$transaction(async (prisma) => {
            await Promise.all(validationPromises);

            const updatedUser = await prisma.user.update({
                where: { id: existingEmployeeBranch.userId },
                data: {
                    name: updateEmployeeBranchDto.name,
                    email: updateEmployeeBranchDto.email,
                    phoneNumber: updateEmployeeBranchDto.phone_number,
                    avatar: updateEmployeeBranchDto.avatar,
                    ...(updateEmployeeBranchDto.password && {
                        password: (await bcrypt.hash(
                            updateEmployeeBranchDto.password,
                            10,
                        )) as string,
                    }),
                    roleId: updateEmployeeBranchDto.role_id,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true,
                    avatar: true,
                },
            });

            const updatedEmployeeBranch = await prisma.employeeBranch.update({
                where: { id },
                data: {
                    branchId: updateEmployeeBranchDto.branch_id,
                    type: updateEmployeeBranchDto.type,
                },
            });

            return {
                ...updatedEmployeeBranch,
                user: updatedUser,
            };
        });
    }

    async remove(id: number): Promise<void> {
        const employeeBranch = await this.findOne(id);
        return this.prismaService.$transaction(async (prisma) => {
            await prisma.employeeBranch.delete({
                where: { id },
            });
            await prisma.user.delete({
                where: { id: employeeBranch.userId },
            });
        });
    }
}
