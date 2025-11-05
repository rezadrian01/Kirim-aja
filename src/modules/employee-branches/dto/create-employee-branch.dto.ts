import { z, ZodObject } from 'zod';

const createEmployeeBranchSchema = z.object({
    name: z
        .string({
            required_error: 'Name is required',
            invalid_type_error: 'Name must be a string',
        })
        .min(1, 'Name cannot be empty'),
    email: z
        .string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        })
        .email({
            message: 'Invalid email format',
        }),
    phone_number: z
        .string({
            required_error: 'Phone number is required',
            invalid_type_error: 'Phone number must be a string',
        })
        .min(10, 'Phone number must be at least 10 digits'),
    branch_id: z
        .number({
            required_error: 'Branch ID is required',
            invalid_type_error: 'Branch ID must be a number',
        })
        .int({
            message: 'Branch ID must be an integer',
        }),
    type: z
        .string({
            required_error: 'Type is required',
            invalid_type_error: 'Type must be a string',
        })
        .min(1, 'Type cannot be empty'),
    role_id: z
        .number({
            required_error: 'Role ID is required',
            invalid_type_error: 'Role ID must be a number',
        })
        .int({
            message: 'Role ID must be an integer',
        }),
    password: z
        .string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        })
        .min(8, 'Password must be at least 8 characters long'),
    avatar: z.string().optional().nullable(),
});

export class CreateEmployeeBranchDto {
    static schema: ZodObject<any> = createEmployeeBranchSchema;
    constructor(
        public readonly name: string,
        public readonly email: string,
        public readonly phone_number: string,
        public readonly branch_id: number,
        public readonly type: string,
        public readonly role_id: number,
        public readonly password: string,
        public readonly avatar?: string | null,
    ) {}
}
