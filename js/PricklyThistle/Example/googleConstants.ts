/**
 * Created by Giles on 19/12/2015.
 */

module PricklyThistle.Example {

    import IRequestDetails = PricklyThistle.Auth.IRequestDetails;

    //setup your own project and get your own client id here: https://console.developers.google.com/apis/credentials
    const clientId : string = "enterYourOwnClientID";
    const requestUrl : string = "https://accounts.google.com/o/oauth2/v2/auth?response_type=token&scope=profile";
    const redirectUrl : string = "http://localhost:63342/OAuthClient/index.html";

    export var googleAuthDetails : IRequestDetails = {
        client_id : clientId,
        requestUrl : requestUrl,
        redirect_uri : redirectUrl
    }

}