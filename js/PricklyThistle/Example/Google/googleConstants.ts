/**
 * Created by Giles on 19/12/2015.
 */

module PricklyThistle.Example.Google {

    import IRequestDetails = PricklyThistle.Auth.IRequestDetails;

    //setup your own project and get your own client id here: https://console.developers.google.com/apis/credentials
    const clientId : string = "100493946887-nfu7hc90q38idromd545iegsf0jq7upa.apps.googleusercontent.com";
    const requestUrl : string = "https://accounts.google.com/o/oauth2/v2/auth?response_type=token&scope=https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
    const redirectUrl : string = "http://localhost:63342/Typescript-OAuth-SPA/index.html";
    const tokenValidationUrl : string = "https://www.googleapis.com/oauth2/v3/tokeninfo";

    export var authDetails : IRequestDetails = {
        client_id: clientId,
        redirect_uri: redirectUrl,
        requestUrl: requestUrl,
        validationUrl: tokenValidationUrl
    }

}