import { PrismaService } from 'src/common/prisma/prisma.service';
import { AuthLoginDto } from './dto/auth-login-dto';
import {
    AuthLoginResponse,
    UserResponse,
} from './response/auth-login-response';
import { JwtService } from '@nestjs/jwt';
import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { AuthRegisterDto } from './dto/auth-register-dto';

@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService,
    ) {}
    async login(request: AuthLoginDto): Promise<AuthLoginResponse> {
        const user = await this.prismaService.user.findUnique({
            where: { email: request.email },
            include: {
                role: {
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = (await bcrypt.compare(
            request.password,
            user.password,
        )) as boolean;

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.roleId,
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET_KEY || 'secretKey',
            expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        } as object);

        const { password, ...userWithoutPassword } = user;

        const formattedUser = {
            ...userWithoutPassword,
            role: {
                ...user.role,
                permissions: user.role.rolePermissions.map(
                    (rolePermission) => ({
                        id: rolePermission.permission.id,
                        name: rolePermission.permission.name,
                        key: rolePermission.permission.key,
                        resource: rolePermission.permission.resource,
                    }),
                ),
            },
        };

        const userResponse = plainToInstance(UserResponse, formattedUser, {
            excludeExtraneousValues: true,
        });

        return plainToInstance(
            AuthLoginResponse,
            {
                accessToken,
                user: userResponse,
            },
            { excludeExtraneousValues: true },
        );
    }

    async register(request: AuthRegisterDto): Promise<AuthLoginResponse> {
        const existingUser = await this.prismaService.user.findUnique({
            where: { email: request.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const role = await this.prismaService.role.findFirst({
            where: { key: 'customer' },
        });

        if (!role) {
            throw new UnauthorizedException('Default role not found');
        }

        const hashedPassword = (await bcrypt.hash(
            request.password,
            10,
        )) as string;

        const user = await this.prismaService.user.create({
            data: {
                name: request.name,
                email: request.email,
                phoneNumber: request.phone_number,
                password: hashedPassword,
                roleId: role.id,
            },
            include: {
                role: {
                    include: {
                        rolePermissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });

        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.roleId,
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET_KEY || 'secretKey',
            expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        } as object);

        const { password, ...userWithoutPassword } = user;

        const formattedUser = {
            ...userWithoutPassword,
            role: {
                ...user.role,
                permissions: user.role.rolePermissions.map(
                    (rolePermission) => ({
                        id: rolePermission.permission.id,
                        name: rolePermission.permission.name,
                        key: rolePermission.permission.key,
                        resource: rolePermission.permission.resource,
                    }),
                ),
            },
        };

        const userResponse = plainToInstance(UserResponse, formattedUser, {
            excludeExtraneousValues: true,
        });

        return plainToInstance(
            AuthLoginResponse,
            {
                accessToken,
                user: userResponse,
            },
            { excludeExtraneousValues: true },
        );
    }
}
