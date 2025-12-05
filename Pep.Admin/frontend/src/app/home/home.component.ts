import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';
import { AuthService, UserProfile } from '../auth/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userPrincipalName: string | null = null;

  private readonly _destroying$ = new Subject<void>();
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.profile$
      .pipe(takeUntil(this._destroying$))
      .subscribe((profile: UserProfile | null) => {
        this.userPrincipalName = profile?.userPrincipalName || null;
      });
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}