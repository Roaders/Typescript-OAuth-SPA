/**
 * Created by Giles on 19/12/2015.
 */

module PricklyThistle.Auth {

    export interface IRequestDetails {
        client_id : string,
        requestUrl : string,
        redirect_uri : string
    }

    export class OAuthService {

        static $inject = [ "$http", "$window" ];

        constructor( private _http : ng.IHttpService, private _window : ng.IWindowService ) {
            if( _window.location.hash && _window.parent )
            {
                ( <any>_window.opener ).handleAccessTokenResult( _window.location.hash );

                _window.close();
            }
        }

        //  Public Functions

        authorise( requestDetails : IRequestDetails )
        {
            ( <any>window ).handleAccessTokenResult = this.handleAccessTokenResult;

            var url : string = requestDetails.requestUrl;
            url += "&client_id=" + requestDetails.client_id;
            url += "&redirect_uri=" + requestDetails.redirect_uri;

            console.log( "Making request to " + requestDetails.requestUrl );

            this._window.open( url, "_blank", "width=500,height=800" );
        }

        //  Private Functions

        private handleAccessTokenResult( hash : string ) : void {
            alert( "accesstoken: " + hash )
        }
    }
}