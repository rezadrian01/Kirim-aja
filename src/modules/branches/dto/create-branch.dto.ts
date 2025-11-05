import { z, ZodObject } from 'zod';

const createBranchSchema = z.object({
    name: z
        .string({
            required_error: 'Branch name is required',
            invalid_type_error: 'Branch name must be a string',
        })
        .min(1, 'Branch name cannot be empty'),
    address: z
        .string({
            required_error: 'Address is required',
            invalid_type_error: 'Address must be a string',
        })
        .min(1, 'Address cannot be empty'),
    phone_number: z
        .string({
            required_error: 'Phone number is required',
            invalid_type_error: 'Phone number must be a string',
        })
        .min(10, 'Phone number must be at least 10 digits long'),
});

export class CreateBranchDto {
    static schema: ZodObject<any> = createBranchSchema;
    constructor(
        public name: string,
        public address: string,
        public phone_number: string,
    ) {}
}
