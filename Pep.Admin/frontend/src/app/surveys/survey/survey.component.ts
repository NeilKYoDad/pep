import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SurveysServiceService } from '../surveys.service';
import { Survey, SurveyVersion, AddNewSurveyVersion, SurveyStatus } from '../models';
import { LoadingComponent } from 'src/app/shared/loading/loading.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [CommonModule, LoadingComponent, RouterModule],
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent implements OnInit {
  survey: Survey | null = null;
  isLoading = false;
  error: string | null = null;
  surveyId: number | null = null;
  addingVersion = false;
  publishedSurveyUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveysService: SurveysServiceService
  ) {}

  ngOnInit(): void {
    const surveyIdParam = this.route.snapshot.paramMap.get('id');
    this.surveyId = surveyIdParam ? +surveyIdParam : null;
    
    if (this.surveyId) {
      this.loadSurvey(this.surveyId);
    } else {
      this.error = 'No survey ID provided';
    }
  }

  loadSurvey(id: number): void {
    this.isLoading = true;
    this.error = null;
    
    this.surveysService.getSurvey(id).subscribe({
      next: (data: Survey) => {
        this.survey = data;
        this.isLoading = false;
        this.updatePublishedSurveyUrl();
      },
      error: (err: any) => {
        this.error = 'Failed to load survey';
        this.isLoading = false;
        this.publishedSurveyUrl = null;
        console.error('Error loading survey:', err);
      }
    });
  }

  // put in the breadcrumb
  goBack(): void {
    this.router.navigate(['/surveys']);
  }

  openSurveyBuilder(versionId: number): void {
    this.router.navigate(['/surveys', this.surveyId, 'version', versionId, 'builder']);
  }

  publishVersion(version: SurveyVersion): void {
    if (!this.surveyId || !version?.surveyVersionId) {
      return;
    }

    this.surveysService.publishSurveyVersion(this.surveyId, version.surveyVersionId).subscribe({
      next: () => {
        // reload
        this.loadSurvey(this.surveyId!);
      },
      error: (err: any) => {
        console.error('Error publishing survey version:', err);
        //this.error = 'Failed to publish survey version. Please try again.';
      }
    });
  }

  approveVersion(version: SurveyVersion): void {
    if (!this.surveyId || !version?.surveyVersionId) {
      return;
    }

    this.surveysService.approveSurveyVersion(this.surveyId, version.surveyVersionId).subscribe({
      next: () => {
        this.loadSurvey(this.surveyId!);
      },
      error: (err: any) => {
        console.error('Error approving survey version:', err);
      }
    });
  }

  retireVersion(version: SurveyVersion): void {
    if (!this.surveyId || !version?.surveyVersionId) {
      return;
    }

    this.surveysService.retireSurveyVersion(this.surveyId, version.surveyVersionId).subscribe({
      next: () => {
        this.loadSurvey(this.surveyId!);
      },
      error: (err: any) => {
        console.error('Error retiring survey version:', err);
      }
    });
  }

  private updatePublishedSurveyUrl(): void {
    if (!this.survey) {
      this.publishedSurveyUrl = null;
      return;
    }

    const hasPublishedVersion = (this.survey.surveyVersions ?? []).some(
      (version) => version.statusId === SurveyStatus.Published
    );

    this.publishedSurveyUrl = hasPublishedVersion
      ? `${environment.baseApiUrl}/public/surveys/${this.survey.publishedUrlGuid}`
      : null;
  }

  addSurveyVersion(): void {
    if (!this.surveyId) {
      return;
    }

    this.error = null;
    this.addingVersion = true;

    const payload: AddNewSurveyVersion = {
      surveySchemaJson: JSON.stringify({ components: [] }), // TODO - empty schema, uipdat eto copy the schema from the current version if needed
      changeNotes: 'New version created from survey detail'
    };

    this.surveysService.addNewSurveyVersion(this.surveyId, payload).subscribe({
      next: () => {
        this.addingVersion = false;
        this.loadSurvey(this.surveyId!);
      },
      error: (err: any) => {
        console.error('Error adding survey version:', err);
        this.error = 'Failed to add new survey version. Please try again.';
        this.addingVersion = false;
      }
    });
  }
}
