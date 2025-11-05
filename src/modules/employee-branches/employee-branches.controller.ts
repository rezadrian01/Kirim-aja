import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { EmployeeBranchesService } from './employee-branches.service';
import { CreateEmployeeBranchDto } from './dto/create-employee-branch.dto';
import { UpdateEmployeeBranchDto } from './dto/update-employee-branch.dto';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermissions } from '../auth/decorators/permission.decorator';
import { BaseResponse } from 'src/common/interfaces/base-response.dto';
import { EmployeeBranch } from '@prisma/client';

@Controller('employee-branches')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class EmployeeBranchesController {
    constructor(
        private readonly employeeBranchesService: EmployeeBranchesService,
    ) {}

    @Post()
    @RequirePermissions('employee.create')
    async create(
        @Body() createEmployeeBranchDto: CreateEmployeeBranchDto,
    ): Promise<BaseResponse<EmployeeBranch>> {
        return {
            message: 'Employee branch created successfully',
            data: await this.employeeBranchesService.create(
                createEmployeeBranchDto,
            ),
        };
    }

    @Get()
    @RequirePermissions('employee.read')
    async findAll(): Promise<BaseResponse<EmployeeBranch[]>> {
        return {
            message: 'Employee branches retrieved successfully',
            data: await this.employeeBranchesService.findAll(),
        };
    }

    @Get(':id')
    @RequirePermissions('employee.read')
    async findOne(
        @Param('id') id: string,
    ): Promise<BaseResponse<EmployeeBranch>> {
        return {
            message: 'Employee branch retrieved successfully',
            data: await this.employeeBranchesService.findOne(+id),
        };
    }

    @Patch(':id')
    @RequirePermissions('employee.update')
    async update(
        @Param('id') id: string,
        @Body() updateEmployeeBranchDto: UpdateEmployeeBranchDto,
    ): Promise<BaseResponse<EmployeeBranch>> {
        return {
            message: 'Employee branch updated successfully',
            data: await this.employeeBranchesService.update(
                +id,
                updateEmployeeBranchDto,
            ),
        };
    }

    @Delete(':id')
    @RequirePermissions('employee.delete')
    async remove(@Param('id') id: string): Promise<BaseResponse<void>> {
        await this.employeeBranchesService.remove(+id);
        return {
            message: 'Employee branch deleted successfully',
            data: null,
        };
    }
}
