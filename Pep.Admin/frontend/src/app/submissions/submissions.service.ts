import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SubmitSurveyResponse } from './models';

@Injectable({ providedIn: 'root' })
export class SubmissionsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseApiUrl}/submissions`;

  submitSurvey(guid: string, submissionJson: string): Observable<SubmitSurveyResponse> {
    return this.http.post<SubmitSurveyResponse>(`${this.baseUrl}/${guid}/submit`, {
      submission: submissionJson,
    });
  }
}
