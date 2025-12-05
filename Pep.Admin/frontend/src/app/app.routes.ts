import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { FailedComponent } from './failed/failed.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { AccessDeniedComponent } from './auth/access-denied/access-denied.component';
import { StaffRoleGuard } from './auth/staff-role.guard';
import { SurveyListComponent } from './surveys/survey-list/survey-list.component';
import { SurveyComponent } from './surveys/survey/survey.component';

// Test components for auth with PEP user and roles table
import { AuthTestComponent } from './auth/test/auth-test/auth-test.component';
import { AuthTestIsAdministratorComponent } from './auth/test/auth-test/auth-test-is-creator.component';
import { SurveyBuilderComponent } from './surveys/survey-builder/survey-builder.component';
import { SubmissionComponent } from './submissions/submission/submission.component';

export const routes: Routes = [
  {
    path: 'surveys',
    component: SurveyListComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'surveys/:id',
    component: SurveyComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'surveys/:surveyId/version/:versionId/builder',
    component: SurveyBuilderComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'submissions/:publishedSurveyGuid',
    canActivate: [MsalGuard],
    component: SubmissionComponent,
  },
  // {
  //   path: 'metrics',
  //   component: MyMetricsComponent,
  //   canActivate: [MsalGuard, StaffRoleGuard(['isAdministrator'])],
  // },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'manage-users',
    component: ManageUsersComponent,
    canActivate: [MsalGuard],
  },
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'login-failed',
    component: FailedComponent,
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent,
  },
  /* Routes to test auth with the PEP user and roles table */
  {
    path: 'auth-test',
    component: AuthTestComponent,
    canActivate: [MsalGuard],
  },
  {
    path: 'is-administrator',
    component: AuthTestIsAdministratorComponent,
    canActivate: [MsalGuard, StaffRoleGuard(['isAdministrator'])],
  }
];


