import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, map, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface StaffMemberAccess {
  staffId: number;
  staffName: string;
  isAdministrator: boolean;
}

@Injectable({ providedIn: 'root' })
export class StaffMemberAccessService {
  private http = inject(HttpClient);

  loadUser(): Observable<StaffMemberAccess> {
    const envAny = environment as any;
    const url = `${envAny.baseApiUrl}/staffmemberaccess/me`;
    return this.http.get<StaffMemberAccess>(url);
  }

  /**
   * Synchronously checks if the given StaffMemberAccess object has the specified role.
   * Example usage:
   *   hasRole(access, 'isDataProvider')
   */
  hasRole(access: StaffMemberAccess | null | undefined, requiredRole: keyof StaffMemberAccess): boolean {
    if (!access) return false;
    const value = access[requiredRole]; // no idea how keyof works but it does
    return typeof value === 'boolean' && value;
  }
}
