import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from './common/prisma/prisma.service';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ProfileModule } from './modules/profile/profile.module';
import { BranchesModule } from './modules/branches/branches.module';
import { EmployeeBranchesModule } from './modules/employee-branches/employee-branches.module';
import { UserAddressModule } from './modules/user-address/user-address.module';
import { EmailService } from './common/email/email.service';
import { QueueModule } from './common/queue/queue.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';

@Module({
    imports: [
        AuthModule,
        RolesModule,
        PermissionsModule,
        ProfileModule,
        BranchesModule,
        EmployeeBranchesModule,
        UserAddressModule,
        QueueModule,
        ShipmentsModule,
    ],
    controllers: [AppController],
    providers: [AppService, PrismaService, JwtStrategy, EmailService],
})
export class AppModule {}
