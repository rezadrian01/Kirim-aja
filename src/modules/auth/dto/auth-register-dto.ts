import { z, ZodObject } from 'zod';

const authRegisterSchema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
            invalid_type_error: 'Name must be a string',
        })
        .min(1, 'Name is required'),
    email: z
        .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
        .email('Invalid email format'),
    phone_number: z
        .string({
            required_error: 'Phone number is required',
            invalid_type_error: 'Phone number must be a string',
        })
        .min(10, 'Phone number must be at least 10 characters long'),
    password: z
        .string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        })
        .min(8, 'Password must be at least 8 characters long')
        .max(100, 'Password must be at most 100 characters long'),
});

export class AuthRegisterDto {
    static schema: ZodObject<any> = authRegisterSchema;
    constructor(
        public readonly name: string,
        public readonly email: string,
        public readonly phone_number: string,
        public readonly password: string,
    ) {}
}
