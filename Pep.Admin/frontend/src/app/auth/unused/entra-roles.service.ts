import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// A service for getting roles from the Entra webapi but we don't use Entra roles in this app

interface RolesResponse {
    userName?: string;
    roles?: string[];
}

@Injectable({ providedIn: 'root' })
export class EntraRolesService {
    private _roles$ = new BehaviorSubject<string[] | null>(null);
    public roles$ = this._roles$.asObservable();

    private http = inject(HttpClient);
    constructor() { }

    loadRoles(): Observable<RolesResponse> {
        const envAny = environment as any;
        const url = `${envAny.baseApiUrl}/roles`;
        return this.http.get<RolesResponse>(url).pipe(
            tap(res => this._roles$.next(res?.roles ?? [])),
            catchError(() => {
                // Consider an error as a loaded state with no roles
                this._roles$.next([]);
                return of({ roles: [] } as RolesResponse);
            })
        );
    }

    clear(): void {
        // Reset to null to indicate not loaded/no active account
        this._roles$.next(null);
    }

    get currentRoles(): string[] {
        return this._roles$.value ?? [];
    }

    isInRole(role: string): boolean {
        return Array.isArray(this._roles$.value) && this._roles$.value.includes(role);
    }
}
