import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from 'src/common/email/email.service';

export interface EmailJobData {
    to: string;
    type: string;
}

@Processor('email-queue')
export class EmailQueueProcessor {
    private readonly logger: Logger = new Logger(EmailQueueProcessor.name);
    constructor(private readonly emailService: EmailService) {}

    @Process('send-email')
    async handleSendEmail(job: Job<EmailJobData>): Promise<void> {
        const { data } = job;
        this.logger.log(
            `Processing email job for ${data.to} of type ${data.type}`,
        );
        try {
            switch (data.type) {
                case 'testing':
                    await this.emailService.testingEmail(data.to);
                    this.logger.log(`Test email sent to ${data.to}`);
                    break;
                default:
                    this.logger.warn(`Unknown email type: ${data.type}`);
                    break;
            }
        } catch (error) {
            this.logger.error(
                `Failed to process email job ${data.type} to ${data.to}`,
                error,
            );
            throw error;
        }
    }
}
