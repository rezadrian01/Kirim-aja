import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { OpenCageService } from 'src/common/opencage/opencage.service';
import { UserAddress } from '@prisma/client';

@Injectable()
export class UserAddressService {
    constructor(
        private prismaService: PrismaService,
        private opencageService: OpenCageService,
    ) {}

    private readonly UPLOADS_PATH = '/uploads/photos/';

    private generatePhotoPath(filename?: string) {
        return filename ? `${this.UPLOADS_PATH}${filename}` : null;
    }

    private async getCoordinatesFromAddress(
        address: string,
    ): Promise<{ lat: number; lng: number }> {
        return await this.opencageService.geocode(address);
    }

    async create(
        createUserAddressDto: CreateUserAddressDto,
        userId: number,
        photoFileName?: string,
    ): Promise<UserAddress> {
        const { lat, lng } = await this.getCoordinatesFromAddress(
            createUserAddressDto.address,
        );

        return await this.prismaService.userAddress.create({
            data: {
                address: createUserAddressDto.address,
                tag: createUserAddressDto.tag,
                label: createUserAddressDto.label,
                photo: this.generatePhotoPath(photoFileName),
                latitude: lat,
                longitude: lng,
                userId: userId,
            },
        });
    }

    async findAll(userId: number): Promise<UserAddress[]> {
        return await this.prismaService.userAddress.findMany({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phoneNumber: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async findOne(id: number, userId: number): Promise<UserAddress> {
        const userAddress = await this.prismaService.userAddress.findFirst({
            where: {
                AND: [{ id }, { userId }],
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phoneNumber: true,
                        avatar: true,
                    },
                },
            },
        });
        if (!userAddress) {
            throw new NotFoundException('User address not found');
        }
        return userAddress;
    }

    async update(
        id: number,
        userId: number,
        updateUserAddressDto: UpdateUserAddressDto,
        photoFileName?: string,
    ): Promise<UserAddress> {
        const userAddress = await this.findOne(id, userId);

        let newLatitude = userAddress.latitude;
        let newLongitude = userAddress.longitude;

        if (
            updateUserAddressDto?.address &&
            updateUserAddressDto?.address !== userAddress.address
        ) {
            const coords = await this.getCoordinatesFromAddress(
                updateUserAddressDto.address,
            );
            newLatitude = coords.lat;
            newLongitude = coords.lng;
        }
        if (photoFileName) {
            userAddress.photo = this.generatePhotoPath(photoFileName);
        }

        return await this.prismaService.userAddress.update({
            where: { id },
            data: {
                address: updateUserAddressDto?.address ?? userAddress.address,
                tag: updateUserAddressDto?.tag ?? userAddress.tag,
                label: updateUserAddressDto?.label ?? userAddress.label,
                photo: userAddress.photo,
                latitude: newLatitude,
                longitude: newLongitude,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phoneNumber: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async remove(id: number, userId: number): Promise<void> {
        await this.findOne(id, userId);
        await this.prismaService.userAddress.delete({ where: { id, userId } });
    }
}
