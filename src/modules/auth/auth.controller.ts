import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login-dto';
import { AuthLoginResponse } from './response/auth-login-response';
import { AuthRegisterDto } from './dto/auth-register-dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Body() req: AuthLoginDto): Promise<AuthLoginResponse> {
        return await this.authService.login(req);
    }

    @Post('register')
    async register(@Body() req: AuthRegisterDto): Promise<AuthLoginResponse> {
        return await this.authService.register(req);
    }
}
