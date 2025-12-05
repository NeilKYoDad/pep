import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-center align-items-center py-3" *ngIf="isLoading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <span class="ms-2" *ngIf="message">{{ message }}</span>
    </div>
  `,
  styles: [`
    .spinner-border { width: 2rem; height: 2rem; }
  `]
})
export class LoadingComponent {
  @Input() isLoading = false;
  @Input() message = '';
}