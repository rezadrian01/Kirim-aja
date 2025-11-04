import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponse } from './response/profile-response';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
    constructor(private prismaService: PrismaService) {}
    async findOne(id: number): Promise<ProfileResponse> {
        const user = await this.prismaService.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                phoneNumber: true,
            },
        });

        return plainToInstance(ProfileResponse, user, {
            excludeExtraneousValues: true,
        });
    }

    async update(
        id: number,
        updateProfileDto: UpdateProfileDto,
        avatarFileName?: string,
    ): Promise<ProfileResponse> {
        const user = await this.prismaService.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                phoneNumber: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updatedData = {};
        if (updateProfileDto.name !== undefined) {
            updatedData['name'] = updateProfileDto.name;
        }
        if (updateProfileDto.email !== undefined) {
            updatedData['email'] = updateProfileDto.email;
        }
        if (updateProfileDto.phone_number !== undefined) {
            updatedData['phoneNumber'] = updateProfileDto.phone_number;
        }
        if (updateProfileDto.password !== undefined) {
            updatedData['password'] = (await bcrypt.hash(
                updateProfileDto.password,
                10,
            )) as string;
        }
        if (avatarFileName !== undefined) {
            updatedData['avatar'] = `/uploads/photos/${avatarFileName}`;
        }

        const updatedUser = await this.prismaService.user.update({
            where: { id },
            data: updatedData,
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                phoneNumber: true,
            },
        });

        return plainToInstance(ProfileResponse, updatedUser, {
            excludeExtraneousValues: true,
        });
    }
}
