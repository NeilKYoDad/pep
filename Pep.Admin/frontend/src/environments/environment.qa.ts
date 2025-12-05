export const environment = {
  production: false,
  msalConfig: {
    auth: {
      clientId: '10c76cc1-3374-4139-a8dd-aaf5691f3ff1',  // Application (client) ID of the front end app in Azure
      authority: 'https://login.microsoftonline.com/ddc77078-e803-4eeb-80ca-dd03ba7459c4',  // The GUID is the tenant ID of the front end app in Azure
    },
  },
  baseApiUrl: 'https://pepadmin-api-qa.mft.nhs.uk', // Base URL for all backend API endpoints
  graphApiConfig: {
    scopes: ['user.read'],
    uri: 'https://graph.microsoft.com/v1.0/me',
  },
  webApiConfig: {
    scopes: ['api://54650cf2-525a-44b9-a166-6b6c4b92e660/access_as_user'] // The scope you exposed for your C# Web API
  },
};
