import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { FormioModule } from '@formio/angular';
import { Subscription } from 'rxjs';
import { SubmissionsService } from '../submissions.service';
import { PublishedSurveySchemaResponse } from '../models';
import { SurveysServiceService } from '../../surveys/surveys.service';

@Component({
  selector: 'app-submission',
  standalone: true,
  imports: [CommonModule, RouterModule, FormioModule],
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.css'],
})
export class SubmissionComponent implements OnInit, OnDestroy {
  guid: string | null = null;
  survey?: PublishedSurveySchemaResponse;
  isLoading = true;
  error?: string;
  schemaPretty = '';
  formDefinition: any = null;
  submissionData: any | null = null;  // The form.io submission JSON
  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private submissionsService: SubmissionsService,
    private surveysService: SurveysServiceService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params: ParamMap) => {
      this.guid = params.get('publishedSurveyGuid');
      if (!this.guid) {
        this.error = 'No survey link provided.';
        this.isLoading = false;
        return;
      }
      this.fetchSurvey(this.guid!);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private fetchSurvey(guid: string): void {
    this.isLoading = true;
    this.error = undefined;
    this.surveysService.getPublishedSurveySchema(guid).subscribe({
      next: (survey) => {
        this.survey = survey;
        this.formDefinition = this.tryParseJson(survey.surveySchemaJson);
        this.schemaPretty =
          typeof this.formDefinition === 'string'
            ? this.formDefinition
            : JSON.stringify(this.formDefinition, null, 2);
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Unable to load published survey.';
        this.isLoading = false;
      },
    });
  }

  private tryParseJson(raw: string): any {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }


  onSubmit(formSubmission: any) {
    if (!this.guid) return; // TODO throw an error
    
    var jsonString = JSON.stringify(formSubmission.data);  // TODO what else is in formsubmission?

    this.submissionsService.submitSurvey(this.guid, jsonString).subscribe({
      next: res => {
        //this.formioInstance.formio.emit('submitDone');

        // Navigate to submitted page with submission id
        // this.router.navigate(['/form', this.guid, 'submitted', res.id]);
      },
      error: err => {
        // this.formioInstance.formio.emit('submitError', err);
        console.error(err);
      }
    });
  }  
}
