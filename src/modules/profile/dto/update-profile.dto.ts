import { z, ZodObject } from 'zod';

const updateProfileSchema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
            invalid_type_error: 'Name must be a string',
        })
        .optional(),
    email: z
        .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
        .email('Invalid email format')
        .optional(),
    phone_number: z
        .string({
            required_error: 'Phone number is required',
            invalid_type_error: 'Phone number must be a string',
        })
        .optional(),
    password: z
        .string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        })
        .min(8, 'Password must be at least 8 characters long')
        .optional(),
    avatar: z
        .string({
            required_error: 'Avatar is required',
            invalid_type_error: 'Avatar must be a string',
        })
        .optional()
        .nullable(),
});

export class UpdateProfileDto {
    static schema: ZodObject<any> = updateProfileSchema;
    constructor(
        public readonly name?: string,
        public readonly email?: string,
        public readonly phone_number?: string,
        public readonly password?: string,
        public readonly avatar?: string | null,
    ) {}
}
