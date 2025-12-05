import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  header: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();  // app comonpontent subscribes to this to show toasts

  constructor() { }

  showError(message: string, header = 'Error') {
    this.addToast({ header, message, type: 'error' });
  }

  showSuccess(message: string, header = 'Success') {
    this.addToast({ header, message, type: 'success' });
  }

  showInfo(message: string, header = 'Info') {
    this.addToast({ header, message, type: 'info' });
  }

  showWarning(message: string, header = 'Warning') {
    this.addToast({ header, message, type: 'warning' });
  }

  private addToast(toast: Toast) {
    this.toastsSubject.next([toast]);
    setTimeout(() => this.removeToast(toast), 3000);
  }

  removeToast(toast: Toast) {
    this.toastsSubject.next([]);
  }
}
