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

    interface IResponse {
        state : string
    }

    interface IAccessTokenResponse extends IResponse{
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
        }

        //  Private variables

        private _pendingRequests : { [ state : string ] : IRequestDetails } = {};

        //  Public Functions

        authorise( requestDetails : IRequestDetails )
        {
            const state : string = this.generateState();
            this._pendingRequests[ state ] = requestDetails;

            ( <any>window ).handleAccessTokenResult = ( result : IAccessTokenResponse ) => this.handleAccessTokenResult( result );
            ( <any>window ).handleAccessTokenDenied = ( result : any ) => this.handleAccessTokenDenied( result );

            var url : string = requestDetails.requestUrl;
            url += "&client_id=" + requestDetails.client_id;
            url += "&redirect_uri=" + requestDetails.redirect_uri;
            url += "&state=" + state;

            console.log( "Making request to " + requestDetails.requestUrl + " (" + state + ")" );

            this._window.open( url, "_blank", "width=500,height=600" );
        }

        //  Private Functions

        private handleAccessTokenResult( results : IAccessTokenResponse ) : void {
            console.log( "access token result received for " + results.state );

            const request : IRequestDetails = this._pendingRequests[ results.state ];

            var url : string = request.validationUrl;
            url += "?access_token=" + results.access_token;

            this._http.get<ITokenValidationResult>( url ).then(
                ( result ) => this.handleValidToken( result, results.state ),
                ( error ) => this.handleTokenInvalid( error, results.state )
            );
        }

        //TODO: pass this back to controller so we can inform user
        private handleAccessTokenDenied( error : IResponse ) : void
        {
            const request : IRequestDetails = this.cleaUpStateAndGetRequest( error.state );

            console.log( "access token result denied" );
        }

        private handleValidToken( result : IHttpPromiseCallbackArg<ITokenValidationResult>, state : string ) : void {
            console.log( "token valid ");

            const request : IRequestDetails = this.cleaUpStateAndGetRequest( state );
        }

        private handleTokenInvalid( error : IHttpPromiseCallback<any>, state : string ) : void {
            console.log( "token not valid" );

            const request : IRequestDetails = this.cleaUpStateAndGetRequest( state );
        }

        private cleaUpStateAndGetRequest( state : string ) : IRequestDetails
        {
            const request : IRequestDetails = this._pendingRequests[ state ];
            delete this._pendingRequests[ state ];

            return request;
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

        private generateState() : string
        {
            var state : string = OAuthService.randomString(16);

            while( this._pendingRequests[ state ] !== undefined )
            {
                state = OAuthService.randomString(16)
            }

            return state;
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
