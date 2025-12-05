import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormioModule } from '@formio/angular';
import { SurveysServiceService } from '../surveys.service';
import { Survey, SurveyVersion, SurveyStatus, UpdateSurveySchema } from '../models';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-survey-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, FormioModule, RouterModule],
  templateUrl: './survey-builder.component.html',
  styleUrls: ['./survey-builder.component.css']
})
export class SurveyBuilderComponent implements OnInit {
  survey: Survey | null = null;
  loading = false;
  error: string | null = null;
  surveyId: number | null = null;
  versionId: number | null = null;
  selectedVersion: SurveyVersion | null = null;
  formSchema: any = null;
  changeNotes = '';
  saving = false;
  readonly draftStatus = SurveyStatus.Draft;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveysService: SurveysServiceService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const surveyIdParam = this.route.snapshot.paramMap.get('surveyId');
    const versionIdParam = this.route.snapshot.paramMap.get('versionId');
    
    this.surveyId = surveyIdParam ? +surveyIdParam : null;
    this.versionId = versionIdParam ? +versionIdParam : null;
    
    if (this.surveyId && this.versionId) {
      this.loadSurvey(this.surveyId);
    } else {
      this.error = 'No survey or version ID provided';
    }
  }

  loadSurvey(id: number): void {
    this.loading = true;
    this.error = null;
    
    this.surveysService.getSurvey(id).subscribe({
      next: (data: Survey) => {
        this.survey = data;
        // Find the specific version
        // TODO: add a webapi to get the specific verfsion directly?
        this.selectedVersion = data.surveyVersions.find(v => v.surveyVersionId === this.versionId) || null;
        
        if (this.selectedVersion) {
          this.changeNotes = this.selectedVersion.changeNotes ?? '';
          try {
            const parsedSchema = JSON.parse(this.selectedVersion.surveySchemaJson);
            if (!parsedSchema.display) {
              parsedSchema.display = 'wizard';
            }
            this.formSchema = parsedSchema;
          } catch (e) {
            console.error('Error parsing schema JSON:', e);
            this.error = 'Failed to parse form schema';
          }
        } else {
          this.error = 'Version not found';
        }
        
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load survey';
        this.loading = false;
        console.error('Error loading survey:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/surveys', this.surveyId]);
  }

  // TODO look in to this and what its doing
  onFormChange(event: any): void {
    console.log('Form changed:', event);
    // Validate for duplicate keys
    if (event.form && event.form.components) {
      const keys = event.form.components.map((c: any) => c.key);
      const duplicates = keys.filter((key: string, index: number) => keys.indexOf(key) !== index);
      if (duplicates.length > 0) {
        console.warn('Duplicate keys found:', duplicates);
      }
    }
    // if (event?.form) {
    //   this.formSchema = event.form;
    // }
  }

  saveSchema(): void {
    if (!this.surveyId || !this.versionId || !this.selectedVersion) {
      this.error = 'Missing survey or version context.';
      return;
    }

    if (this.selectedVersion.statusId !== SurveyStatus.Draft) {
      this.error = 'Only draft versions can be edited.';
      return;
    }

    if (!this.formSchema) {
      this.error = 'Please build the form before saving.';
      return;
    }

    this.saving = true;
    this.error = null;

    // Taking a clone here is a precaution to avoid unintended mutations
    const schemaClone = JSON.parse(JSON.stringify(this.formSchema));

    const payload: UpdateSurveySchema = {
      surveySchemaJson: JSON.stringify(schemaClone),
      changeNotes: this.changeNotes?.trim() ? this.changeNotes.trim() : null,
    };

    this.surveysService
      .updateSurveySchema(this.surveyId, this.versionId, payload)
      .subscribe({
        next: () => {
          this.saving = false;
          this.changeNotes = '';
          this.loadSurvey(this.surveyId!);
          this.router.navigate(['/surveys', this.surveyId]);
        },
        error: (err: any) => {
          this.saving = false;
          this.error = 'Failed to save survey schema.';
          console.error('Error saving survey schema:', err);
        },
      });
  }

  onJsonLinkClick(event: Event): void {
    event.preventDefault();
    if (!this.formSchema) {
      this.toastService.showWarning('No form schema to copy yet.');
      return;
    }

    const json = JSON.stringify(this.formSchema, null, 2);

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(json)
        .then(() => this.toastService.showSuccess('Form schema copied to clipboard.'))
        .catch(() => this.toastService.showError('Unable to copy form schema.'));
      return;
    }

    this.toastService.showError('Clipboard API not available.');
  }

  onDisplayModeChange(event: Event): void {
    if (!this.formSchema) {
      return;
    }

    // need to do this to force the wizard / form to show
    const value = (event.target as HTMLSelectElement).value;
    const clonedSchema = JSON.parse(JSON.stringify(this.formSchema));
    clonedSchema.display = value;

    this.formSchema = clonedSchema;
  }

  isReadonly(): boolean {
    return this.selectedVersion?.statusId !== SurveyStatus.Draft;
  }
}
