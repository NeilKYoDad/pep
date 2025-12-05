import { LogLevel, Configuration, BrowserCacheLocation } from '@azure/msal-browser';
import { environment } from '../../environments/environment'; // Import the environment file

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

export const msalConfig: Configuration = {
  auth: {
    clientId: environment.msalConfig.auth.clientId, // Get Client ID from environment file
    authority: environment.msalConfig.auth.authority, // Get Authority from environment file
    redirectUri: '/',
    postLogoutRedirectUri: '/',
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: isIE, // Set to true for IE 11
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};

// Centralized prompt values for MSAL login
export const PROMPT_VALUE = {
  LOGIN: 'login',                   // Forces the user to enter their credentials on that request, negating single sign-on.
  SELECT_ACCOUNT: 'select_account', // The user is prompted to select an account, seems Microsoft will sometime select the account automatically!
  NONE: 'none',                     // No interactive prompt. Fails if user interaction is required.
  CONSENT: 'consent',               // The user is prompted to consent to the requested scopes.
};

export const PROMPT_MODE = PROMPT_VALUE.LOGIN;

export const protectedResources = {
  graphApi: {
    endpoint: environment.graphApiConfig.uri,
    scopes: environment.graphApiConfig.scopes,
  },
  api: {
    endpoint: environment.baseApiUrl,
    scopes: environment.webApiConfig.scopes,
  }
};
