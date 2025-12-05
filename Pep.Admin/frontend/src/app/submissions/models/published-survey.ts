export interface PublishedSurveySchemaResponse {
  publishedUrlGuid: string;
  surveyCode: string;
  surveyName: string;
  description: string | null;
  surveySchemaJson: string;
  publishedAt: string | null;
}
