import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Req,
} from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BaseResponse } from 'src/common/interfaces/base-response.dto';
import { UserAddress } from '@prisma/client';

@Controller('user-address')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserAddressController {
    constructor(private readonly userAddressService: UserAddressService) {}

    @Post()
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: './public/uploads/photos',
                filename: (req, file, cb) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + extname(file.originalname));
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|avif)$/)) {
                    cb(new Error('Only image files are allowed!'), false);
                } else {
                    cb(null, true);
                }
            },
        }),
    )
    async create(
        @Req() req: Request & { user: { id: number } },
        @Body() createUserAddressDto: CreateUserAddressDto,
        @UploadedFile() photo: Express.Multer.File | undefined,
    ): Promise<BaseResponse<UserAddress>> {
        return {
            message: 'User address created successfully',
            data: await this.userAddressService.create(
                createUserAddressDto,
                +req.user.id,
                photo ? photo.filename : undefined,
            ),
        };
    }

    @Get()
    async findAll(
        @Req() req: Request & { user: { id: number } },
    ): Promise<BaseResponse<UserAddress[]>> {
        return {
            message: 'User addresses retrieved successfully',
            data: await this.userAddressService.findAll(+req.user.id),
        };
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
        @Req() req: Request & { user: { id: number } },
    ): Promise<BaseResponse<UserAddress>> {
        return {
            message: 'User address retrieved successfully',
            data: await this.userAddressService.findOne(+id, +req.user.id),
        };
    }

    @Patch(':id')
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: './public/uploads/photos',
                filename: (req, file, cb) => {
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + extname(file.originalname));
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|avif)$/)) {
                    cb(new Error('Only image files are allowed!'), false);
                } else {
                    cb(null, true);
                }
            },
        }),
    )
    async update(
        @Param('id') id: string,
        @Req() req: Request & { user: { id: number } },
        @Body() updateUserAddressDto: UpdateUserAddressDto,
        @UploadedFile() photo: Express.Multer.File | undefined,
    ): Promise<BaseResponse<UserAddress>> {
        return {
            message: 'User address updated successfully',
            data: await this.userAddressService.update(
                +id,
                +req.user.id,
                updateUserAddressDto,
                photo ? photo.filename : undefined,
            ),
        };
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @Req() req: Request & { user: { id: number } },
    ): Promise<BaseResponse<null>> {
        await this.userAddressService.remove(+id, +req.user.id);
        return {
            message: 'User address deleted successfully',
            data: null,
        };
    }
}
