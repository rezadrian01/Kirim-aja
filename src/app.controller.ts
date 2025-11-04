import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './modules/auth/guards/logged-in.guard';
import { PermissionGuard } from './modules/auth/guards/permission.guard';
import { RequireAnyPermission } from './modules/auth/decorators/permission.decorator';

@Controller()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('protected')
    @RequireAnyPermission('shipments.create')
    getProtected() {
        return 'This is a protected resource';
    }
}
