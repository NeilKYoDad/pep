import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../shared/toast.service';

@Injectable()
export class AuthErrorInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private toastService = inject(ToastService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.router.navigate(['/access-denied'], { queryParams: { reason: 'unauthenticated' } });
        } else if (err.status === 403) {
          this.router.navigate(['/access-denied']);
        } else if (err.status === 400 && err.error?.errors) {
          // Handle FluentValidation errors
          const validationErrors = err.error.errors;
          const errorMessages: string[] = [];
          for (const field in validationErrors) {
            if (validationErrors.hasOwnProperty(field)) {
              errorMessages.push(...validationErrors[field]);
            }
          }
          const errorMessage = errorMessages.join(' ');
          this.toastService.showError(errorMessage);
        } else {
          const errorMessage = err.error?.message || (typeof err.error === 'string' ? err.error : err.message) || 'An unexpected error occurred. Please try again.';
          this.toastService.showError(errorMessage);
        }
        return throwError(() => err);
      })
    );
  }
}
