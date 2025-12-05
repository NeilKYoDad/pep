import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EntraRolesService } from '../../unused/entra-roles.service';
import { AuthService } from '../../auth.service';
import { protectedResources } from '../../auth-config';

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

interface ApiResponse {
  userName: string;
  data: WeatherForecast[];
}

@Component({
  selector: 'app-webapi-test',
  imports: [CommonModule, RouterModule],
  templateUrl: './webapi-test.component.html',
  styleUrl: './webapi-test.component.css'
})
export class WebapiTestComponent implements OnInit, OnDestroy {
  weatherForecasts: WeatherForecast[] = [];
  userName = '';
  apiCallError: string | null = null;
  roles: string[] = [];
  // Known roles to show even when the user doesn't have them yet. New backend roles will be merged.
  knownRoles: string[] = ['Viewer', 'Editor', 'Admin'];

  // Map role values to router paths (adjust if your routes are different)
  roleRouteMap: Record<string, string> = {
    'Viewer': '/viewer',
    'Editor': '/editor',
    'Admin': '/admin'
  };

  getRoleRoute(role: string): string | null {
    return this.roleRouteMap[role] ?? null;
  }
  private readonly _destroying$ = new Subject<void>();

  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private rolesService = inject(EntraRolesService);

  ngOnInit(): void {
    console.log('WebAPI Test component initialized');
    // Subscribe to AuthService's activeAccount$ for logging/debugging
    this.authService.activeAccount$
      .pipe(takeUntil(this._destroying$))
      .subscribe(account => {
        console.log('WebAPI Test - active account changed:', account?.username);
      });

    // Primary source for roles: RolesService (fetched from backend on sign-in)
    this.rolesService.roles$
      .pipe(takeUntil(this._destroying$))
      .subscribe(roles => {
        this.roles = roles || [];
        console.log('WebAPI Test - RolesService updated roles:', roles);
      });
  }

  get displayRoles(): string[] {
    const union = [...this.knownRoles, ...(this.roles || [])];
    // remove duplicates while preserving order
    return Array.from(new Set(union));
  }

  private callWebApi(url: string): void {
    console.log('Calling API with URL:', url);
    this.apiCallError = null; // Clear previous errors
    this.weatherForecasts = []; // Clear previous data
    this.userName = ''; // Clear previous username

    this.http.get<ApiResponse>(url)
      .subscribe({
        next: (response) => {
          console.log('API call successful, received response:', response);
            this.weatherForecasts = response.data;
            this.userName = response.userName;
            console.log('Weather Forecast Data:', response.data);
            console.log('User Name:', response.userName);
        },
        error: (err) => {
          console.error('API Call Error details:', err);
          this.apiCallError = 'Error calling API: ' + (err.message || err.statusText || 'Unknown error');
          console.error('API Call Error:', err);
        }
      });
  }

  callWebApiNoRole(): void {
    const url = protectedResources.api.endpoint + '/weatherforecast';
    console.log('callWebApiNoRole clicked, calling:', url);
    this.callWebApi(url);
  }

  callWebApiViewer(): void {
    const viewerUrl = protectedResources.api.endpoint + '/weatherforecast/viewer';
    console.log('callWebApiViewer clicked, calling:', viewerUrl);
    this.callWebApi(viewerUrl);
  }

  callWebApiEditor(): void {
    const editorUrl = protectedResources.api.endpoint + '/weatherforecast/editor';
    console.log('callWebApiEditor clicked, calling:', editorUrl);
    this.callWebApi(editorUrl);
  }

  callWebApiAdmin(): void {
    const adminUrl = protectedResources.api.endpoint + '/weatherforecast/admin';
    console.log('callWebApiAdmin clicked, calling:', adminUrl);
    this.callWebApi(adminUrl);
  }

  callWebApiError(): void {
    const errorUrl = protectedResources.api.endpoint + '/weatherforecast/error';
    console.log('callWebApiError clicked, calling:', errorUrl);
    this.callWebApi(errorUrl);
  }

  ngOnDestroy(): void {
    // Signal completion for any subscriptions using takeUntil(this._destroying$)
    this._destroying$.next();
    this._destroying$.complete();
  }

}
