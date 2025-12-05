export interface SurveySummaryListItem {
  surveyId: number;
  surveyCode: string;
  surveyName: string;
  description: string | null;
  publishedUrlGuid: string;
  createdAt: string;
  createdBy: number;
  createdByName: string | null;
  createdByEmail: string | null;
  updatedAt: string | null;
  updatedBy: number | null;
  updatedByName: string | null;
  updatedByEmail: string | null;
}
