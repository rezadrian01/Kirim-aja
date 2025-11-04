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
}
