import { Module } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { EmailQueueProcessor } from './processors/email-queue.processor';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bull';
import { PaymentExpiredQueueProcessor } from './processors/payment-expired-queue-processor';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    imports: [
        BullModule.forRoot({
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
                password: process.env.REDIS_PASSWORD || undefined,
            },
        }),
        BullModule.registerQueue(
            {
                name: 'email-queue',
            },
            {
                name: 'payment-expired-queue',
            },
        ),
    ],
    providers: [
        QueueService,
        EmailService,
        EmailQueueProcessor,
        PaymentExpiredQueueProcessor,
        PrismaService,
    ],
    exports: [QueueService],
})
export class QueueModule {}
