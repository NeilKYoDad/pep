import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Survey,
  SurveySummaryListItem,
  CreateSurvey,
  CreateSurveyResponse,
  UpdateSurvey,
  AddNewSurveyVersion,
  AddNewSurveyVersionResponse,
  UpdateSurveySchema
} from './models';
import { PublishedSurveySchemaResponse } from '../submissions/models';

@Injectable({ providedIn: 'root' })
export class SurveysServiceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseApiUrl}/survey`;

  getAll(): Observable<SurveySummaryListItem[]> {
    let params = new HttpParams();

    return this.http.get<SurveySummaryListItem[]>(this.baseUrl, { params });
  }

  getSurvey(id: number): Observable<Survey> {
    return this.http.get<Survey>(`${this.baseUrl}/${id}`);
  }

  createSurvey(dto: CreateSurvey): Observable<CreateSurveyResponse> {
    return this.http.post<CreateSurveyResponse>(`${this.baseUrl}/create`, dto);
  }

  updateSurvey(surveyId: number, dto: UpdateSurvey): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${surveyId}/update`, dto);
  }

  addNewSurveyVersion(surveyId: number, dto: AddNewSurveyVersion): Observable<AddNewSurveyVersionResponse> {
    return this.http.post<AddNewSurveyVersionResponse>(`${this.baseUrl}/${surveyId}/version/create`, dto);
  }

  updateSurveySchema(surveyId: number, versionId: number, dto: UpdateSurveySchema): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${surveyId}/versions/${versionId}`, dto);
  }

  approveSurveyVersion(surveyId: number, versionId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${surveyId}/versions/${versionId}/approve`, {});
  }

  publishSurveyVersion(surveyId: number, versionId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${surveyId}/versions/${versionId}/publish`, {});
  }
  
  retireSurveyVersion(surveyId: number, versionId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${surveyId}/versions/${versionId}/retire`, {});
  }

  getPublishedSurveySchema(guid: string): Observable<PublishedSurveySchemaResponse> {
    return this.http.get<PublishedSurveySchemaResponse>(`${this.baseUrl}/published/${guid}`);
  }
}
