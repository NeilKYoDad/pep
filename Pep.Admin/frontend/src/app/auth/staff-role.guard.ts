import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take, filter, catchError, timeout } from 'rxjs/operators';
import { StaffMemberAccess } from './staff-member-access.service';
import { ToastService } from '../shared/toast.service';
import { of } from 'rxjs';

export function StaffRoleGuard(requiredRoles: Array<keyof StaffMemberAccess>): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const toastService = inject(ToastService);

    // Check if any of the requiredRoles matches a StaffMemberAccess boolean and is true
    return authService.staffAccess$.pipe(
       // this skips access checks until we have a non-null value, to prevent race conditions
       // TODO: consider an APP_INITIALIZER to load user data before the app starts
      filter(access => !!access),
      timeout(3000), // 3 seconds until we need the access value from the server
      take(1),
      map(access => {
        // Handle an array of required roles - will user need at least one of them
        if (requiredRoles.some(role => typeof access[role] === 'boolean' && access[role] === true)) {
          return true;
        }
        toastService.showError(
          `Access denied. You need one of the following roles to access this page: ${requiredRoles.join(', ')}`
        );
        return false;
      }),
      catchError(() => {
        toastService.showError('Access denied. StaffMemberAccess could not be loaded.');
        return of(false);
      })
    );
  };
}