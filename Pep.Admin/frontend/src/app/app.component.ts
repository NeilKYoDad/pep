import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { Subject } from 'rxjs';
import { SidebarComponent } from './nav/sidebar/sidebar.component';
import { NavbarComponent } from './nav/navbar/navbar.component';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService, Toast } from './shared/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    NavbarComponent,
    NgbToastModule
  ]
})

export class AppComponent implements OnInit, OnDestroy {
  title = 'PEP Dashboard';
  isIframe = false;
  toast: Toast | null = null;
  private readonly _destroying$ = new Subject<void>();
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    console.log('--- AppComponent ngOnInit called ---');

    this.isIframe = window !== window.parent && !window.opener;

    this.toastService.toasts$.subscribe(toasts => {
      this.toast = toasts[0] || null;
    });
  }

  loginPopup(): void {
    this.authService.loginPopup();
  }

  loginRedirect(): void {
    this.authService.loginRedirect();
  }

  logout(): void {
    this.authService.logoutPopup();
  }

  logoutRedirect(): void {
    this.authService.logoutRedirect();
  }

  removeToast(): void {
    this.toastService.removeToast(this.toast!);
  }

  getToastClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-success text-white';
      case 'error': return 'bg-danger text-white';
      case 'warning': return 'bg-warning';
      case 'info': return 'bg-info text-white';
      default: return '';
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}