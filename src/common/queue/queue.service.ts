import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailJobData } from './processors/email-queue.processor';
import { PaymentExpiredJobData } from './processors/payment-expired-queue-processor';

export class QueueService {
    constructor(
        @InjectQueue('email-queue') private emailQueue: Queue,
        @InjectQueue('payment-expired-queue')
        private paymentExpiredQueue: Queue,
    ) {}

    async addEmailJob(
        data: EmailJobData,
        options?: { delay?: number; attempts?: number },
    ) {
        return this.emailQueue.add('send-email', data, {
            delay: options?.delay || 0,
            attempts: options?.attempts || 3,
            removeOnComplete: true,
            removeOnFail: false,
            backoff: {
                type: 'exponential',
                delay: 5000, // 5 seconds
            },
        });
    }

    async addPaymentExpiredJob(data: PaymentExpiredJobData, expiryDate: Date) {
        const delay = expiryDate.getTime() - Date.now();
        if (delay <= 0) {
            return this.paymentExpiredQueue.add('expired-payment', data, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: 10,
                removeOnFail: 5,
            });
        }

        return this.paymentExpiredQueue.add('expired-payment', data, {
            delay,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: 10,
            removeOnFail: 5,
        });
    }

    async cancelPaymentExpiredJob(paymentId: number) {
        const jobs: {
            data: { paymentId: number };
            remove: () => Promise<void>;
        }[] = await this.paymentExpiredQueue.getJobs(['delayed', 'waiting']);
        for (const job of jobs) {
            if (job.data.paymentId === paymentId) {
                await job.remove();
                break;
            }
        }
    }
}
