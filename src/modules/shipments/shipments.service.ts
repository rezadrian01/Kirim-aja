import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { OpenCageService } from 'src/common/opencage/opencage.service';
import { QueueService } from 'src/common/queue/queue.service';
import { Shipment } from '@prisma/client';
import { XenditService } from 'src/common/xendit/xendit.service';
import { getDistance } from 'geolib';
import { PaymentStatus } from 'src/common/enum/payment-status.enum';

@Injectable()
export class ShipmentsService {
    constructor(
        private prismaService: PrismaService,
        private opencageService: OpenCageService,
        private queueService: QueueService,
        private xenditService: XenditService,
    ) {}

    private calculateShipmentCost(
        distance: number,
        weight: number,
        delivery_type: string,
    ): {
        totalPrice: number;
        basePrice: number;
        wightPrice: number;
        distancePrice: number;
    } {
        const baseRates = {
            same_day: 15000,
            next_day: 10000,
            regular: 5000,
        };

        const weighRates = {
            same_day: 1000,
            next_day: 800,
            regular: 500,
        };

        const distanceTierRates = {
            same_day: {
                tier1: 8000, // 0-50 km
                tier2: 12000, // 51-100 km
                tier3: 15000, // 100+ km (per 100 km)
            },
            next_day: {
                tier1: 6000,
                tier2: 9000,
                tier3: 12000,
            },
            regular: {
                tier1: 4000,
                tier2: 6000,
                tier3: 8000,
            },
        };

        const basePrice: number = (baseRates[delivery_type] ||
            baseRates.regular) as number;
        const weightRate = (weighRates[delivery_type] ||
            weighRates.regular) as number;
        const distanceRate = (distanceTierRates[delivery_type] ||
            distanceTierRates.regular) as {
            tier1: number;
            tier2: number;
            tier3: number;
        };

        const weightKg = Math.ceil(weight / 1000);
        const weightPrice = weightKg * weightRate;

        let distancePrice = 0;
        if (distance <= 50) {
            distancePrice = distanceRate.tier1;
        } else if (distance <= 100) {
            distancePrice = distanceRate.tier1 + distanceRate.tier2;
        } else {
            const extraDistance = Math.ceil((distance - 100) / 100);
            distancePrice =
                distanceRate.tier3 + extraDistance * distanceRate.tier3;
        }

        const totalPrice = basePrice + weightPrice + distancePrice;

        const minimumPrice = 5000;

        return {
            totalPrice: Math.max(totalPrice, minimumPrice),
            basePrice,
            wightPrice: weightPrice,
            distancePrice,
        };
    }
    async create(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
        const { lat, lng } = await this.opencageService.geocode(
            createShipmentDto.destination_address,
        );

        const userAddress = await this.prismaService.userAddress.findFirst({
            where: {
                id: createShipmentDto.pickup_address_id,
            },
            include: {
                user: {
                    omit: {
                        password: true,
                    },
                },
            },
        });

        if (!userAddress || !userAddress.latitude || !userAddress.longitude) {
            throw new NotFoundException(
                'Invalid pickup address or destination address',
            );
        }

        const distance = getDistance(
            {
                latitude: userAddress.latitude,
                longitude: userAddress.longitude,
            },
            {
                latitude: lat,
                longitude: lng,
            },
        );

        const distanceInKm = Math.ceil(distance / 1000);

        const shipmentCost = this.calculateShipmentCost(
            distanceInKm,
            createShipmentDto.weight,
            createShipmentDto.delivery_type,
        );

        const shipment = await this.prismaService.$transaction(
            async (prisma) => {
                const newShipment = await prisma.shipment.create({
                    data: {
                        paymentStatus: PaymentStatus.PENDING,
                        distance: distanceInKm,
                        price: shipmentCost.totalPrice,
                    },
                });
                await prisma.shipmentDetail.create({
                    data: {
                        shipmentId: newShipment.id,
                        pickupAddressId: createShipmentDto.pickup_address_id,
                        destinationAddress:
                            createShipmentDto.destination_address,
                        recepientName: createShipmentDto.recipient_name,
                        recepientPhone: createShipmentDto.recipient_phone,
                        weight: createShipmentDto.weight,
                        packageType: createShipmentDto.package_type,
                        deliveryType: createShipmentDto.delivery_type,
                        destinationLatitude: lat,
                        destinationLongitude: lng,
                        basePrice: shipmentCost.basePrice,
                        weightPrice: shipmentCost.wightPrice,
                        distancePrice: shipmentCost.distancePrice,
                        userId: userAddress.userId,
                    },
                });

                return newShipment;
            },
        );

        const invoice = await this.xenditService.createInvoice({
            externalId: `INV-${Date.now()}-${shipment.id}` as string,
            amount: shipmentCost.totalPrice as number,
            payerEmail: userAddress.user.email as string,
            description:
                `Payment for shipment #${shipment.id} from ${userAddress.address} to ${createShipmentDto.destination_address}` as string,
            successRedirectUrl:
                `${process.env.FRONTEND_URL || ''}/send-package/detail/${shipment.id}` as string,
            invoiceDuration: 86400 as number,
        });

        const payment = await this.prismaService.$transaction(
            async (prisma) => {
                const createdPayment = await prisma.payment.create({
                    data: {
                        shipmentId: shipment.id,
                        externalId: invoice.externalId as string,
                        invoiceId: invoice.id as string,
                        status: invoice.status as PaymentStatus,
                        invoiceUrl: invoice.invoice_url as string,
                        expiryDate: invoice.expiryDate as Date,
                    },
                });
                await prisma.shipmentHistory.create({
                    data: {
                        shipmentId: shipment.id,
                        status: PaymentStatus.PENDING,
                        description: `Shipment created with total price Rp ${shipmentCost.totalPrice}`,
                    },
                });
                return createdPayment;
            },
        );
        try {
            await this.queueService.addEmailJob({
                type: 'payment-notification',
                to: userAddress.user.email,
                shipmentId: shipment.id,
                amount: shipmentCost.totalPrice,
                paymentUrl: invoice.invoiceUrl as string,
                expiryDate: invoice.expiryDate as Date,
            });
        } catch (error) {
            console.error(
                'Failed to add payment notification email to queue',
                error,
            );
        }

        try {
            await this.queueService.addPaymentExpiredJob(
                {
                    paymentId: payment.id,
                    shipmentId: shipment.id,
                    externalId: payment.externalId!,
                },
                invoice.expiryDate as Date,
            );
        } catch (error) {
            console.error('Failed to add payment expired job to queue', error);
        }

        return shipment;
    }

    findAll() {
        return `This action returns all shipments`;
    }

    findOne(id: number) {
        return `This action returns a #${id} shipment`;
    }

    update(id: number, updateShipmentDto: UpdateShipmentDto) {
        return `This action updates a #${id} shipment`;
    }

    remove(id: number) {
        return `This action removes a #${id} shipment`;
    }
}
