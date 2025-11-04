import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEYS } from '../decorators/permission.decorator';
import { PermissionsService } from 'src/modules/permissions/permissions.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private permissionService: PermissionsService,
        private reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride(
            PERMISSION_KEYS,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        if (
            typeof requiredPermissions === 'object' &&
            requiredPermissions.type
        ) {
            const { type, permissions } = requiredPermissions;
            let hasPermission = false;
            if (type === 'any') {
                hasPermission =
                    await this.permissionService.userHasAnyPermission(
                        user.id,
                        permissions,
                    );
            } else if (type === 'all') {
                hasPermission =
                    await this.permissionService.userHasAllPermissions(
                        user.id,
                        permissions,
                    );
            }

            if (!hasPermission) {
                throw new ForbiddenException(
                    `Access denied. Required permissions: ${permissions.join(', ')}`,
                );
            }
        } else {
            const permissions = Array.isArray(requiredPermissions)
                ? requiredPermissions
                : [requiredPermissions];

            const hasPermission =
                await this.permissionService.userHasAllPermissions(
                    user.id,
                    permissions,
                );

            if (!hasPermission) {
                throw new ForbiddenException(
                    `Access denied. Required permissions: ${permissions.join(', ')}`,
                );
            }
        }
        return true;
    }
}
