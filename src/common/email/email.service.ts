import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as fs from 'fs';

export class EmailService {
    private transporter: nodemailer.Transporter;
    private templatesPath: string;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        this.templatesPath = path.join('./src/common/email/templates');
    }

    private loadTemplate(templateName: string): string {
        const templatePath = path.join(
            this.templatesPath,
            `${templateName}.hbs`,
        );
        return fs.readFileSync(templatePath, 'utf-8');
    }

    private compileTemplate(templateName: string, data: any): string {
        const templateSource = this.loadTemplate(templateName);
        const template = handlebars.compile(templateSource);
        return template(data);
    }

    async testingEmail(to: string): Promise<void> {
        const templateData = {
            title: 'Test Email',
            message: 'This is a test email sent from the EmailService.',
        };
        const mailOptions = {
            from: process.env.SMTP_EMAIL_SENDER,
            to,
            subject: 'Test Email from NestJS',
            html: this.compileTemplate('test-email', templateData),
        };
        await this.transporter.sendMail(mailOptions);
    }

    async sendEmailPaymentNotification(
        to: string,
        paymentUrl: string,
        shipmentId: number,
        amount: number,
        expiryDate: Date,
    ) {
        const templateData = {
            shipmentId,
            amount: amount.toLocaleString('id-ID'),
            paymentUrl,
            expiryDate: expiryDate.toDateString(),
        };
        const mailOptions = {
            from: process.env.SMTP_EMAIL_SENDER,
            to,
            subject: 'Payment Notification',
            html: this.compileTemplate('payment-notification', templateData),
        };
        await this.transporter.sendMail(mailOptions);
    }
}
