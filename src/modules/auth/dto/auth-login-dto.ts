import { z, ZodObject } from 'zod';

const authLoginSchema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
        .email('Invalid email format'),
    password: z
        .string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        })
        .min(8, 'Password must be at least 8 characters long')
        .max(100, 'Password must be at most 100 characters long'),
});

export class AuthLoginDto {
    static schema: ZodObject<any> = authLoginSchema;
    constructor(
        public readonly email: string,
        public readonly password: string,
    ) {}
}
