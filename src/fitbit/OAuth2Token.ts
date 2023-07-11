// https://dev.fitbit.com/build/reference/web-api/authorization/oauth2-token/#Response
export interface OAuth2Token {
    //The updated active access token.
    access_token: string;
    //The time the access token expires in seconds.
    expires_in: number;
    //The updated active refresh token.
    refresh_token: string;
    //Supported: Bearer
    token_type: string;
    //The Fitbit user ID associated with the access token and refresh token
    user_id: string;
}
