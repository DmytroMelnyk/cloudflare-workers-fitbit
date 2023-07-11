import { ApiScope } from "./ApiScope";
import { OAuth2Token } from "./OAuth2Token";


export class FitbitApiAuthorizer {
    constructor(private clientId: string, private clientSecret: string) {
    }

    // https://dev.fitbit.com/build/reference/web-api/authorization/authorize/
    getLoginUrl(returnUrl: string, ...scopes: ApiScope[]): string {
        return 'https://www.fitbit.com/oauth2/authorize?' +
            `response_type=code&client_id=${this.clientId}&scope=${encodeURIComponent(scopes.join(" "))}&` +
            `redirect_uri=${encodeURIComponent(returnUrl)}`;
    }


    // https://dev.fitbit.com/build/reference/web-api/authorization/oauth2-token/
    requestOAuth2Token(code: string, returnUrl: string): Promise<OAuth2Token> {
        return this.getOAuth2Token(new URLSearchParams({
            "code": `${code}`,
            "grant_type": "authorization_code",
            "redirect_uri": returnUrl,
            "client_id": this.clientId
        }));
    }

    // https://dev.fitbit.com/build/reference/web-api/authorization/refresh-token/
    extendAccessToken(refreshToken: string): Promise<OAuth2Token> {
        return this.getOAuth2Token(new URLSearchParams({
            "refresh_token": `${refreshToken}`,
            "grant_type": "refresh_token",
            "client_id": this.clientId
        }));
    }

    private async getOAuth2Token(requestBody: URLSearchParams): Promise<OAuth2Token> {
        const response = await fetch("https://api.fitbit.com/oauth2/token", {
            method: "POST",
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
            },
            body: requestBody
        });

        const body = await response.text();
        return JSON.parse(body);
    }
}
