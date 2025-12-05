import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-access-denied',
  imports: [CommonModule, RouterModule],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.css'
})
export class AccessDeniedComponent implements OnInit {
  private route = inject(ActivatedRoute);
  isUnauthenticated = false;

  ngOnInit() {
    // Check query parameters to determine the reason for access denied.
    // This only determines the error message, so there's no security implication of getting this from the url
    this.route.queryParams.subscribe(params => {
      this.isUnauthenticated = params['reason'] === 'unauthenticated';
    });
  }
}
