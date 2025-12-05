import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Staff {
  staffId: number;
  employeeEpicId: string;
  name: string | null;
  email: string | null;
  isDataOwner: string | null;
  isDataController: string | null;
  isDataQA: boolean;
  isDataQALead: boolean;
  aDLogin: string | null;
}

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseApiUrl}/Staff`;

  getAllStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.baseUrl}/getAllStaff`);
  }
}
