export const environment = {
  production: false,
  msalConfig: {
    auth: {
      clientId: '7f029d94-436e-44d2-af22-2c2f669aa26c',  // Application (client) ID of the front end app in Azure
      authority: 'https://login.microsoftonline.com/ddc77078-e803-4eeb-80ca-dd03ba7459c4',  // The GUID is the tenant ID of the front end app in Azure
    },
  },
  baseApiUrl: 'https://pepadmin-api.mft.nhs.uk', // Base URL for all backend API endpoints
  graphApiConfig: {
    scopes: ['user.read'],
    uri: 'https://graph.microsoft.com/v1.0/me',
  },
  webApiConfig: {
    scopes: ['api://e8bf1123-46f4-438e-b75f-fd28d411fd23/access_as_user'] // The scope you exposed for your C# Web API
  },
};
