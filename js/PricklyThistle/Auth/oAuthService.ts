/**
 * Created by Giles on 19/12/2015.
 */

module PricklyThistle.Auth {

    import IHttpPromiseCallback = angular.IHttpPromiseCallback;
    import IHttpPromiseCallbackArg = angular.IHttpPromiseCallbackArg;

    export interface IRequestDetails {
        client_id : string,
        redirect_uri : string,
        requestUrl : string,
        validationUrl : string
    }

    interface IAccessTokenResponse {
        access_token : string,
        expires_in : string,
        token_type : string
    }

    interface ITokenValidationResult{
        aud : string,
        scope : string,
        expired_in : string,
        access_type : string
    }

    export class OAuthService {

        static $inject = [ "$http", "$window" ];

        static instanceCount : number = 5;

        constructor( private _http : ng.IHttpService, private _window : ng.IWindowService ) {
            if( _window.location.hash && _window.parent )
            {
                const hash : string = _window.location.hash.substr( 1 );
                const result : any = OAuthService.processAccessTokenResult( hash );

                if( result.hasOwnProperty( "access_token" ) )
                {
                    ( <any>_window.opener ).handleAccessTokenResult( result );
                }
                else
                {
                    ( <any>_window.opener ).handleAccessTokenDenied( result );
                }

                _window.close();
            }
            this._serviceId = ++OAuthService.instanceCount;
        }

        //  Private variables

        //Todo - handle mulitple concurrent requests
        private _pendingRequest : IRequestDetails;

        private _serviceId : number;

        //  Public Functions

        authorise( requestDetails : IRequestDetails )
        {
            this._pendingRequest = requestDetails;

            ( <any>window ).handleAccessTokenResult = ( result : IAccessTokenResponse ) => this.handleAccessTokenResult( result );
            ( <any>window ).handleAccessTokenDenied = ( result : any ) => this.handleAccessTokenDenied( result );

            var url : string = requestDetails.requestUrl;
            url += "&client_id=" + requestDetails.client_id;
            url += "&redirect_uri=" + requestDetails.redirect_uri;
            url += "&state=" + OAuthService.randomString();

            console.log( "Making request to " + requestDetails.requestUrl + " (" + this._serviceId + ")" );

            this._window.open( url, "_blank", "width=500,height=600" );
        }

        //  Private Functions

        private handleAccessTokenResult( results : IAccessTokenResponse ) : void {
            console.log( "access token result received (" + this._serviceId + ")" );

            var url : string = this._pendingRequest.validationUrl;
            url += "?access_token=" + results.access_token;

            this._http.get<ITokenValidationResult>( url ).then(
                ( result ) => this.handleValidToken( result ),
                ( error ) => this.handleTokenInvalid( error )
            );
        }

        //TODO: pass this back to controller so we can inform user
        private handleAccessTokenDenied( result : any ) : void
        {
            console.log( "access token result denied" );
        }

        private handleValidToken( result : IHttpPromiseCallbackArg<ITokenValidationResult> ) : void{
            console.log( "token valid ");
        }

        private handleTokenInvalid( error : IHttpPromiseCallback<any> ) : void {
            console.log( "token not valid" );
        }

        private static processAccessTokenResult( hash : string ) : any
        {
            const regex : RegExp = /([^&=]+)=([^&]*)/g;
            const allParameters : any = {};
            var result : RegExpExecArray;

            while( result = regex.exec( hash ) ){
                allParameters[decodeURIComponent(result[1])] = decodeURIComponent(result[2]);
            }

            return allParameters;
        }

        private static randomString( stringLength : number = 8 ) {
            const chars : string = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";

            var randomString : string = '';

            while( randomString.length < stringLength )
            {
                var randomIndex = Math.floor( Math.random() * chars.length );
                randomString += chars.substring(randomIndex,randomIndex+1);
            }

            return randomString;
        }
    }
}
