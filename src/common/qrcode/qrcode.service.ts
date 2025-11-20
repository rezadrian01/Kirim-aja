import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
    private readonly uploadsPath = 'public/uploads/qrcodes';
    constructor() {
        if (!existsSync(this.uploadsPath)) {
            mkdirSync(this.uploadsPath, { recursive: true });
        }
    }

    async generateQrCode(trackingNumber: string) {
        try {
            const filename = `${trackingNumber}_${Date.now()}.png`;
            const filePath = join(this.uploadsPath, filename);

            await QRCode.toFile(filePath, trackingNumber, {
                errorCorrectionLevel: 'H',
                type: 'png',
            });

            return `uploads/qrcodes/${filename}`;
        } catch (error) {
            console.error('QR Code Generation Error:', error);
            throw new Error(
                `Failed to generate QR code: ${error?.message}, for trackingNumber: ${trackingNumber}`,
            );
        }
    }
}
