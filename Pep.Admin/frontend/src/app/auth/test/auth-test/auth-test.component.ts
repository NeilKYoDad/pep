import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthTestService } from './auth-test.service';
import { StaffMemberAccess } from '../../staff-member-access.service';
import { inject } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-auth-test',
  templateUrl: './auth-test.component.html',
  styleUrls: ['./auth-test.component.css'],
  imports: [CommonModule, JsonPipe, RouterModule]
})
export class AuthTestComponent {
  public authService = inject(AuthService);
  public staffAccess$ = this.authService.staffAccess$;
  staffAccess: StaffMemberAccess | null = null

  constructor(private authTestService: AuthTestService) {}

  ngOnInit(): void {
      this.staffAccess$.subscribe(access => {
        this.staffAccess = access;
    });
  }

  result: string | StaffMemberAccess | null = null;
  error: string | null = null;

  call(endpoint: string) {
    this.result = null;
    this.error = null;
    let obs: any;
    switch (endpoint) {
      case 'me':
        obs = this.authTestService.getMyAccess();
        break;
      case 'noauthneeded':
        obs = this.authTestService.noAuthNeeded();
        break;
      case ' administrator':
        obs = this.authTestService.isAdministator();
        break;
      case 'madeuprolenotindatabase':
        obs = this.authTestService.madeUpRoleNotInDatabase();
        break;
      default:
        this.error = 'Unknown endpoint';
        return;
    }
    obs.subscribe({
      next: (res: any) => {
        this.result = res;
        this.error = null;
      },
      error: (err: any) => {
        this.result = null;
        if (err?.error) {
          this.error = typeof err.error === 'string' ? err.error : JSON.stringify(err.error, null, 2);
        } else if (err?.message) {
          this.error = err.message;
        } else {
          this.error = 'Unknown error';
        }
      }
    });
  }
}
