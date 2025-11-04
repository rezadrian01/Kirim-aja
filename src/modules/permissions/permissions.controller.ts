import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { BaseResponse } from 'src/common/interfaces/base-response.dto';
import { Permission } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) {}

    @Get()
    async findAll(): Promise<BaseResponse<Permission[]>> {
        return {
            message: 'Permissions retrieved successfully',
            data: await this.permissionsService.findAll(),
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<BaseResponse<Permission>> {
        return {
            message: 'Permission retrieved successfully',
            data: await this.permissionsService.findOne(+id),
        };
    }
}
