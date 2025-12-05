import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, UserProfile } from '../../auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() title = '';

  loginDisplay = false;
  displayName: string = '';
  userPrincipalName: string = '';
  userInitials: string = '';
  private readonly _destroying$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.activeAccount$
      .pipe(takeUntil(this._destroying$))
      .subscribe(account => {
        this.loginDisplay = account !== null;
      });

    this.authService.profile$
      .pipe(takeUntil(this._destroying$))
      .subscribe((profile: UserProfile | null) => {
        this.userPrincipalName = (profile?.userPrincipalName || '').trim();
        this.displayName = (profile?.displayName || '').trim();
        this.userInitials = this.computeInitials(profile);
      });
  }

  // sidebar toggle logic removed as requested

  private computeInitials(profile: UserProfile | null): string {
    if (!profile) return '';
    const fn = (profile.givenName || '').trim();
    const ln = (profile.surname || '').trim();
    return (fn.charAt(0) + ln.charAt(0)).toUpperCase();
  }

  loginRedirect(): void { this.authService.loginRedirect(); }
  logoutRedirect(): void { this.authService.logoutRedirect(); }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}
