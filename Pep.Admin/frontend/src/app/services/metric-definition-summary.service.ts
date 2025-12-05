import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MetricDefinitionSummary {
  metricId: number;
  metricCode: string;
  metricName: string;
  metricDescription: string;
  domain: string | null;
  domainSection: string | null;
  isEnabled: boolean;
  isLive: boolean;
  startDate: string;
  endDate: string | null;
  improvementDirection: string;
  dataOwnerName: string;
  dataControllerName: string;
  qaDataLeadName: string;
  qaServiceLeadName: string;
  isManualMetric: boolean;
}

@Injectable({ providedIn: 'root' })
export class MetricDefinitionSummaryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseApiUrl}/metricsdefinitionsummary`;

  getAll(options?: {
    user?: string;
    domainId?: number;
    searchTerm?: string;
  }): Observable<MetricDefinitionSummary[]> {
    let params = new HttpParams();

    if (options?.user) {
      params = params.set('user', options.user);
    }

    if (options?.domainId != null) {
      params = params.set('domainId', options.domainId);
    }

    if (options?.searchTerm) {
      params = params.set('searchTerm', options.searchTerm);
    }

    return this.http.get<MetricDefinitionSummary[]>(this.baseUrl, { params });
  }
}
