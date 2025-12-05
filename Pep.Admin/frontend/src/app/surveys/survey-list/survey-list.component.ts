import { Component, Directive, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SurveysServiceService } from '../surveys.service';
import { SurveySummaryListItem, CreateSurvey } from '../models';
import { LoadingComponent } from 'src/app/shared/loading/loading.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

export type SortColumn = 'surveyName' | 'description' | 'createdAt' | 'updatedAt'| '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = { asc: 'desc', desc: '', '': 'asc' };

const compare = (v1: string | number, v2: string | number) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
  standalone: true,
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class NgbdSortableHeader {
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortable, direction: this.direction });
  }
}

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingComponent, NgbPaginationModule, NgbdSortableHeader],
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.css']
})
export class SurveyListComponent implements OnInit {
  surveys: SurveySummaryListItem[] = [];
  private originalSurveys: SurveySummaryListItem[] = [];
  isLoading = false;
  error: string | null = null;
  showCreateModal = false;
  creating = false;
  validationError: string | null = null;
  
  @ViewChildren(NgbdSortableHeader) headers!: QueryList<NgbdSortableHeader>;
  page = 1;
  pageSize = 15;
  nameFilter = '';
  domainFilter = '';
  metricTypeFilter: 'all' | 'manual' | 'automated' = 'all';
  get collectionSize(): number { return this.filteredSurveys.length; }

  // Fixed column widths based on content
  nameColumnWidth = 'auto';
  descriptionColumnWidth = '150px';
  createdColumnWidth = '150px';
  updatedColumnWidth = '150px';

  newSurvey: CreateSurvey = {
    surveyName: '',
    description: '',
    surveySchemaJson: JSON.stringify({ components: [] })
  };

  constructor(
    private surveysService: SurveysServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys(): void {
    this.isLoading = true;
    this.error = null;
    
    this.surveysService.getAll().subscribe({
      next: (data: SurveySummaryListItem[]) => {
        this.surveys = data;
        this.originalSurveys = [...data];
        this.calculateColumnWidths();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load surveys';
        this.isLoading = false;
        console.error('Error loading surveys:', err);
      }
    });
  }

  trackById(index: number, s: SurveySummaryListItem): number {
    return s.surveyId;
  }

  private calculateColumnWidths(): void {
    if (this.originalSurveys.length === 0) return;

    // Calculate approximate character width (using 8px per character as estimate)
    const charWidth = 8;
    const padding = 32; // Account for cell padding

    // Find longest name
    const maxNameLength = Math.max(
      ...this.originalSurveys.map(s => s.surveyName?.length || 0),
      'Name'.length
    );
    this.nameColumnWidth = `${Math.min(maxNameLength * charWidth + padding, 450)}px`;
  }

  viewSurvey(s: SurveySummaryListItem): void {
    this.router.navigate(['/surveys', s.surveyId]);
  }

  get filteredSurveys(): SurveySummaryListItem[] {
    /*
    return this.surveys.filter(s => {
      const matchesName = !this.nameFilter || 
        m.metricName.toLowerCase().includes(this.nameFilter.toLowerCase()) ||
        m.metricCode.toLowerCase().includes(this.nameFilter.toLowerCase());
      const matchesDomain = !this.domainFilter || m.domain === this.domainFilter;
      const matchesType = this.metricTypeFilter === 'all' ? true :
                          this.metricTypeFilter === 'manual' ? m.isManualMetric : !m.isManualMetric;
      return matchesName && matchesDomain && matchesType;
    });*/
    return this.surveys;
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.validationError = null;
    this.newSurvey = {
      surveyName: '',
      description: '',
      surveySchemaJson: JSON.stringify({ components: [] })
    };
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  createSurvey(): void {
    if (!this.newSurvey.surveyName.trim() || !this.newSurvey.description?.trim()) {
      this.validationError = 'Please fill in all required fields.';
      return;
    }

    this.creating = true;
    this.error = null;
    this.validationError = null;

    this.surveysService.createSurvey(this.newSurvey).subscribe({
      next: (response) => {
        this.creating = false;
        this.showCreateModal = false;
        // Navigate to the new survey's form builder
        // this.router.navigate(['/surveys', response.surveyId, 'versions', response.versionId, 'builder']);
        this.router.navigate(['/surveys', response.surveyId]);
      },
      error: (err: any) => {
        this.error = 'Failed to create survey';
        this.creating = false;
        console.error('Error creating survey:', err);
      }
    });
  }

  onSort(event: SortEvent | Event) {
    if (!event || typeof event !== 'object' || !('column' in event) || !('direction' in event)) {
      return;
    }
    const { column, direction } = event as SortEvent;
    // resetting other headers
    for (const header of this.headers) {
      if (header.sortable !== column) {
        header.direction = '';
      }
    }

    // no sorting so show original metrics and reset to first page
    if (direction === '' || column === '') {
      this.surveys = [...this.originalSurveys];
      this.page = 1;
      return;
    }

    // AI added this to make the items comparable
    const sortKey = column as keyof SurveySummaryListItem;
    const toComparable = (survey: SurveySummaryListItem): string | number => {
      const value = survey[sortKey];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'boolean') {
        return value ? 1 : 0;
      }
      if (typeof value === 'string') {
        return value.trim().toLowerCase();
      }
      return value;
    };

    // do the sorting
    const sorted = [...this.originalSurveys].sort((a, b) => {
      const res = compare(toComparable(a), toComparable(b));
      return direction === 'asc' ? res : -res;
    });
    this.surveys = sorted;
    this.page = 1; // reset to page 1
  }

  get pagedSurveys(): SurveySummaryListItem[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredSurveys.slice(start, start + this.pageSize);
  }

  get pageInfo(): string {
    if (this.collectionSize === 0) {
      return '0 of 0';
    }

    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.collectionSize);
    return `${start}-${end} of ${this.collectionSize}`;
  }
}
