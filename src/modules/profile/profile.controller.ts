import {
    Controller,
    Get,
    Body,
    Patch,
    Req,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProfileResponse } from './response/profile-response';
import { BaseResponse } from 'src/common/interfaces/base-response.dto';

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get()
    findOne(@Req() req: Request & { user: any }) {
        return this.profileService.findOne(req.user.id as number);
    }

    @Patch()
    @UseInterceptors(
        FileInterceptor('avatar', {
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
        @Req() req: Request & { user: any },
        @Body() updateProfileDto: UpdateProfileDto,
        @UploadedFile() avatar: Express.Multer.File | undefined,
    ): Promise<BaseResponse<ProfileResponse>> {
        return {
            message: 'Profile updated successfully',
            data: await this.profileService.update(
                req.user.id as number,
                updateProfileDto,
                avatar ? avatar.filename : undefined,
            ),
        };
    }
}
