import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { takeUntil } from 'rxjs/operators';
import { StaffMemberAccessService } from '../../auth/staff-member-access.service';
import { Subject } from 'rxjs';

interface SidebarLink {
  label: string;
  path: string | any[];
  icon?: string;
  exact?: boolean;
  canShow: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  private readonly _destroying$ = new Subject<void>();
  links: SidebarLink[] = [];

  constructor(private rbac: StaffMemberAccessService, private authService: AuthService) {
    // Subscribe to staffAccess$ for roles from the pep db
    this.authService.staffAccess$
      .pipe(takeUntil(this._destroying$))
      .subscribe(access => {
        if (!access) {
          this.links = [
          // TODO - this is a bit of hack to show something when signed out, so the user can click it and then sign in
          { label: 'Surveys', path: '/surveys', icon: 'bi-ui-checks', exact: false, canShow: true },          ];
          return;
        }
        this.links = [
          { label: 'Surveys', path: '/surveys', icon: 'bi-ui-checks', exact: false, canShow: true }
          // { label: 'My Metrics', path: '/metrics', icon: 'bi-graph-up', exact: false, canShow: this.rbac.hasRole(access, 'isDataProvider') },
          // { label: 'Manage Targets', path: '/targets', icon: 'bi-bullseye', exact: false, canShow: this.rbac.hasRole(access, 'isTargetSetter') },
          // { label: 'Manage Metrics', path: '/manage-metrics', icon: 'bi-bar-chart', exact: false, canShow: this.rbac.hasRole(access, 'isCreator') }
          // { label: 'Manage Users', path: '/manage-users', icon: 'bi-people', exact: false, canShow: this.rbac.hasRole(access, 'isCreator') },
        ];
      });
  }
}
