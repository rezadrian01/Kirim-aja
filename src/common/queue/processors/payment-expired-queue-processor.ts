import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PaymentStatus } from 'src/common/enum/payment-status.enum';
import { PrismaService } from 'src/common/prisma/prisma.service';

export interface PaymentExpiredJobData {
    paymentId: number;
    shipmentId: number;
    externalId: string;
}

@Processor('payment-expired-queue')
@Injectable()
export class PaymentExpiredQueueProcessor {
    private readonly logger = new Logger(PaymentExpiredQueueProcessor.name);
    constructor(private readonly prismaService: PrismaService) {}

    @Process('expired-payment')
    async handleExpiredPayment(job: Job<PaymentExpiredJobData>) {
        const { data } = job;
        this.logger.log(
            `Processing expired payment for paymentId: ${data.paymentId}, shipmentId: ${data.shipmentId}`,
        );

        try {
            const payment = await this.prismaService.payment.findUnique({
                where: { id: data.paymentId },
                include: {
                    shipment: {
                        include: {
                            shipmentDetail: {
                                include: {
                                    user: {
                                        select: {
                                            email: true,
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!payment) {
                this.logger.warn(
                    `Payment with id ${data.paymentId} not found.`,
                );
                return;
            }

            if (payment.status !== PaymentStatus.PENDING) {
                this.logger.log(
                    `Payment with id ${data.paymentId} is already processed with status ${payment.status}. Skipping expiration handling.`,
                );
                return;
            }

            await this.prismaService.$transaction(async (tx) => {
                await tx.payment.update({
                    where: { id: data.paymentId },
                    data: { status: PaymentStatus.EXPIRED },
                });

                await tx.shipment.update({
                    where: { id: data.shipmentId },
                    data: { paymentStatus: PaymentStatus.EXPIRED },
                });

                await tx.shipmentHistory.create({
                    data: {
                        shipmentId: data.shipmentId,
                        status: PaymentStatus.EXPIRED,
                        description: 'Payment expired. Shipment cancelled.',
                    },
                });
            });

            this.logger.log(
                `Successfully processed expired payment for paymentId: ${data.paymentId}, shipmentId: ${data.shipmentId}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to process expired payment for paymentId: ${data.paymentId}, shipmentId: ${data.shipmentId}`,
                error,
            );
            throw error;
        }
    }
}
