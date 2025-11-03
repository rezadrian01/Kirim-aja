import { z, ZodObject } from 'zod';

const updateRoleSchema = z.object({
    permission_ids: z
        .array(
            z.number({
                required_error: 'Each permission ID is required',
                invalid_type_error: 'Each permission ID must be a number',
            }),
        )
        .nonempty({
            message:
                'permission_ids array must contain at least one permission ID',
        }),
});

export class UpdateRoleDto {
    static schema: ZodObject<any> = updateRoleSchema;
    constructor(public permission_ids: number[]) {}
}
