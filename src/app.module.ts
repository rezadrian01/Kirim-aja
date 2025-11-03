import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from './common/prisma/prisma.service';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';

@Module({
    imports: [AuthModule],
    controllers: [AppController],
    providers: [AppService, PrismaService, JwtStrategy],
})
export class AppModule {}
