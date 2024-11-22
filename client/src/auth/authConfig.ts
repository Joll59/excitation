import { LogLevel } from '@azure/msal-browser';

export const msalConfig = {
    auth: {
        clientId: process.env.REACT_APP_AZURE_CLIENT_ID || '',
        authority: process.env.REACT_APP_AZURE_AUTHORITY || '',
        redirectUri: process.env.REACT_APP_REDIRECT_URI || '',
        clientSecret: process.env.MICROSOFT_PROVIDER_AUTHENTICATION_SECRET || '',
    },

    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {
        loggerOptions: {
            loggerCallback: (level: any, message: any, containsPii: any) => {
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
                    default:
                        return;
                }
            },
        },
    },
};


export const loginRequest = {
    scopes: [],
};