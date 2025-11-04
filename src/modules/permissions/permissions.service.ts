import { Injectable, NotFoundException } from '@nestjs/common';
import { Permission } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class PermissionsService {
    constructor(private prismaService: PrismaService) {}
    async findAll(): Promise<Permission[]> {
        return await this.prismaService.permission.findMany();
    }

    async findOne(id: number): Promise<Permission> {
        const permission = await this.prismaService.permission.findUnique({
            where: { id },
        });
        if (!permission) {
            throw new NotFoundException(`Permission with ID ${id} not found`);
        }
        return permission;
    }

    async getUserPermission(userId: number): Promise<string[]> {
        const permissions = await this.prismaService.user.findUnique({
            where: { id: userId },
            include: {
                role: {
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });

        if (!permissions) return [];

        return (
            permissions.role.rolePermissions.map((rp) => rp.permission.key) ||
            []
        );
    }

    async userHasAnyPermission(
        userId: number,
        permissions: string[],
    ): Promise<boolean> {
        const userPermissions = await this.getUserPermission(userId);
        return permissions.some((permission) =>
            userPermissions.includes(permission),
        );
    }

    async userHasAllPermissions(
        userId: number,
        permissions: string[],
    ): Promise<boolean> {
        const userPermissions = await this.getUserPermission(userId);
        return permissions.every((permission) =>
            userPermissions.includes(permission),
        );
    }
}
