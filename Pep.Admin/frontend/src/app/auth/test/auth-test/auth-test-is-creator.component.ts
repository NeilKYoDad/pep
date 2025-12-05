import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-test-is-administator',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `<h2>IsAdministrator guard allowed</h2>`
})
export class AuthTestIsAdministratorComponent {}