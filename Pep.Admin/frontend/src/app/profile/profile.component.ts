
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AuthService, UserProfile } from '../auth/auth.service';
import { EntraRolesService } from '../auth/unused/entra-roles.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// ProfileType now comes from AuthService (UserProfile)

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: [],
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: UserProfile | undefined;
  roles: string[] = [];
  private readonly _destroying$ = new Subject<void>();

  private authService = inject(AuthService);

  ngOnInit() {
    this.authService.profile$
      .pipe(takeUntil(this._destroying$))
      .subscribe(p => this.profile = p || undefined);

    // Subscribe to staffAccess$ for roles from the pep db
    this.authService.staffAccess$
      .pipe(takeUntil(this._destroying$))
      .subscribe(access => {
        if (access) {
          // some crazy AI code to convert the role booleans into an array of strings
          this.roles = Object.entries(access)
            .filter(([key, value]) => typeof value === 'boolean' && value === true)
            .map(([key]) => key);
        } else {
          this.roles = [];
        }
      });
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}
