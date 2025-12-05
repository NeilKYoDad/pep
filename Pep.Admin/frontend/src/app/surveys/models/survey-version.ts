export interface SurveyVersion {
  surveyVersionId: number;
  surveyId: number;
  versionNumber: number;
  surveySchemaJson: string;
  statusId: number;
  statusName: string;
  createdAt: string;
  createdBy: number;
  createdByName: string | null;
  createdByEmail: string | null;
  approvedAt: string | null;
  approvedBy: number | null;
  approvedByName: string | null;
  approvedByEmail: string | null;
  publishedAt: string | null;
  publishedBy: number | null;
  publishedByName: string | null;
  publishedByEmail: string | null;
  retiredAt: string | null;
  retiredBy: number | null;
  retiredByName: string | null;
  retiredByEmail: string | null;
  changeNotes: string | null;
  updatedAt: string | null;
  updatedBy: number | null;
  updatedByName: string | null;
  updatedByEmail: string | null;
}
