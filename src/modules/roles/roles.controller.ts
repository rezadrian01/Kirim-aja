import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { BaseResponse } from 'src/common/interfaces/base-response.dto';
import { RoleResponse } from '../auth/response/auth-login-response';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Get()
    async findAll(): Promise<BaseResponse<RoleResponse[]>> {
        return {
            message: 'success',
            data: await this.rolesService.findAll(),
        };
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
    ): Promise<BaseResponse<RoleResponse>> {
        return {
            message: 'success',
            data: await this.rolesService.findOne(+id),
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateRoleDto: UpdateRoleDto,
    ): Promise<BaseResponse<RoleResponse>> {
        return {
            message: 'success',
            data: await this.rolesService.update(+id, updateRoleDto),
        };
    }
}
