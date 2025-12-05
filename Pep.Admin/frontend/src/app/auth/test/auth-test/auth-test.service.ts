import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StaffMemberAccess, StaffMemberAccessService } from '../../staff-member-access.service'; // Adjust if you have a separate model file
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthTestService {
  private readonly baseUrl = `${environment.baseApiUrl}/authtest`;

  constructor(private http: HttpClient, private staffAccessService: StaffMemberAccessService) {}

  /** Gets the current user's access info */
  getMyAccess(): Observable<StaffMemberAccess> {
    return this.staffAccessService.loadUser();
  }

  /** No auth needed endpoint */
  noAuthNeeded(): Observable<string> {
    return this.http.get(`${this.baseUrl}/noauthneeded`, { responseType: 'text' });
  }

  isAdministator(): Observable<string> {
    return this.http.get(`${this.baseUrl}/IsAdministrator`, { responseType: 'text' });
  }

  madeUpRoleNotInDatabase(): Observable<string> {
    return this.http.get(`${this.baseUrl}/madeuprolenotindatabase`, { responseType: 'text' });
  }
}
