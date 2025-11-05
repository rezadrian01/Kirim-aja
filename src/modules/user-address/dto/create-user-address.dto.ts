import { z, ZodObject } from 'zod';

const createUserAddressSchema = z.object({
    address: z
        .string({
            required_error: 'Address is required',
            invalid_type_error: 'Address must be a string',
        })
        .min(1, 'Address cannot be empty'),
    tag: z
        .string({
            required_error: 'Tag is required',
            invalid_type_error: 'Tag must be a string',
        })
        .min(1, 'Tag cannot be empty'),
    label: z
        .string({
            required_error: 'Label is required',
            invalid_type_error: 'Label must be a string',
        })
        .min(1, 'Label cannot be empty'),
    photo: z.string().optional().nullable(),
});

export class CreateUserAddressDto {
    static schema: ZodObject<any> = createUserAddressSchema;
    constructor(
        public address: string,
        public tag: string,
        public label: string,
        public photo: string | null,
    ) {}
}
