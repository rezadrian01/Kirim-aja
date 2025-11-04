import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEYS = 'permissions';

export const RequirePermissions = (...permissions: string[]) => {
    return SetMetadata(PERMISSION_KEYS, permissions);
};

export const RequireAnyPermission = (...permissions: string[]) => {
    return SetMetadata(PERMISSION_KEYS, { type: 'any', permissions });
};

export const RequireAllPermissions = (...permissions: string[]) => {
    return SetMetadata(PERMISSION_KEYS, { type: 'all', permissions });
};
