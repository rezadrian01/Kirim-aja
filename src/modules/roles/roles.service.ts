import { Injectable, NotFoundException } from '@nestjs/common';
// import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RoleResponse } from '../auth/response/auth-login-response';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
    constructor(private prismaService: PrismaService) {}

    async findAll(): Promise<RoleResponse[]> {
        const roles = await this.prismaService.role.findMany({
            include: {
                rolePermissions: {
                    include: { permission: true },
                },
            },
        });
        return roles.map((role) => {
            return {
                id: role.id,
                name: role.name,
                key: role.key,
                permissions: role.rolePermissions.map((rp) => ({
                    id: rp.permission.id,
                    name: rp.permission.name,
                    key: rp.permission.key,
                    resource: rp.permission.resource,
                })),
            };
        });
    }

    async findOne(id: number): Promise<RoleResponse> {
        const role = await this.prismaService.role.findUnique({
            where: { id },
            include: {
                rolePermissions: {
                    include: { permission: true },
                },
            },
        });
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        return {
            id: role.id,
            name: role.name,
            key: role.key,
            permissions: role.rolePermissions.map((rp) => ({
                id: rp.permission.id,
                name: rp.permission.name,
                key: rp.permission.key,
                resource: rp.permission.resource,
            })),
        };
    }

    async update(
        id: number,
        updateRoleDto: UpdateRoleDto,
    ): Promise<RoleResponse> {
        await this.findOne(id);

        await this.prismaService.rolePermission.deleteMany({
            where: { roleId: id },
        });

        if (updateRoleDto.permission_ids.length > 0) {
            const rolePermissionsData = updateRoleDto.permission_ids.map(
                (permissionId) => ({
                    roleId: id,
                    permissionId,
                }),
            );

            await this.prismaService.rolePermission.createMany({
                data: rolePermissionsData,
                skipDuplicates: true,
            });
        }

        return this.findOne(id);
    }
}
