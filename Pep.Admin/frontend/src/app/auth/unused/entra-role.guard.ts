import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { EntraRolesService } from './entra-roles.service';
import { filter, map, take } from 'rxjs/operators';

export function EntraRoleGuard(role: string): CanActivateFn {
  return () => {
    const rolesService = inject(EntraRolesService);

    // Wait until roles are loaded (roles !== null), then decide
    // roles are null until they're loaded from the webapi
    return rolesService.roles$.pipe(
      filter((roles): roles is string[] => roles !== null),
      take(1),
      map((roles) => {
        const allowed = Array.isArray(roles) && roles.includes(role);
        if (!allowed) {
          // router.navigate(['/forbidden']);
          // TODO update this
          window.alert('Not authorized to access this page');
        }
        return allowed;
      })
    );
  };
}
 