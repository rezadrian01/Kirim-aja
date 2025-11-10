import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './modules/auth/guards/logged-in.guard';
import { PermissionGuard } from './modules/auth/guards/permission.guard';
import { RequireAnyPermission } from './modules/auth/decorators/permission.decorator';
import { QueueService } from './common/queue/queue.service';

@Controller()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly queueService: QueueService,
    ) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('protected')
    @RequireAnyPermission('shipments.create')
    getProtected() {
        return 'This is a protected resource';
    }

    @Get('send-email-test')
    async sendTestEmail() {
        await this.queueService.addEmailJob({
            to: 'recipient@example.com',
            type: 'testing',
        });

        return 'Test email sent successfully';
    }
}
