import { Module } from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { UserAddressController } from './user-address.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';
import { OpenCageService } from 'src/common/opencage/opencage.service';

@Module({
    controllers: [UserAddressController],
    providers: [
        UserAddressService,
        PrismaService,
        PermissionsService,
        OpenCageService,
    ],
})
export class UserAddressModule {}
