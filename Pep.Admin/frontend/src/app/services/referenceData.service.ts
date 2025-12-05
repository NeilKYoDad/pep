import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ImprovementDirection {
  improvementDirectionDescription: string;
}

@Injectable({ providedIn: 'root' })
export class ImprovementDirectionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseApiUrl}/ReferenceData`;

  getAllImprovementDirection(): Observable<ImprovementDirection[]> {
    return this.http.get<ImprovementDirection[]>(`${this.baseUrl}/getAllImprovementDirection`);
  }
}
