import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-admin',
  template: `
    <h2>Admin Page</h2>
    <p>This page is for users with the 'Admin' role.</p>
    @if (roles.length > 0) {
      <strong>Your roles:</strong>
      <ul>
        @for (role of roles; track role) {
          <li>{{ role }}</li>
        }
      </ul>
    }
    @if (roles.length === 0) {
      <em>No roles found in your token.</em>
    }
  `
})
export class AdminComponent {
  roles: string[] = [];
  constructor(private authService: AuthService) {
    this.authService.activeAccount$.subscribe(account => {
      this.roles = account?.idTokenClaims?.roles || [];
    });
  }
}
