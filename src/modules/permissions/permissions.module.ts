import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
    controllers: [PermissionsController],
    providers: [PermissionsService, PrismaService],
})
export class PermissionsModule {}
