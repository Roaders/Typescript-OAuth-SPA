/**
 * Created by Giles Roadnight on 19/12/2015.
 */

/// <reference path="../../../typings/rx/rx.d.ts" />

module PricklyThistle.Auth {

    import IHttpPromiseCallback = angular.IHttpPromiseCallback;
    import IHttpPromiseCallbackArg = angular.IHttpPromiseCallbackArg;

    export interface IRequestDetails {
        client_id : string,
        redirect_uri : string,
        requestUrl : string,
        validationUrl : string
    }

    interface IPendingRequest {
        originalRequest : IRequestDetails,
        observable : Rx.Subject<string>,
        access_token ?: string
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

    export interface IOAuthService {
        authorise( requestDetails : IRequestDetails ) : Rx.Observable<string>;
    }

    export class OAuthService implements IOAuthService{

        static $inject = [ "$http", "$window", "$timeout" ];

        static instanceCount : number = 5;

        constructor(
            private _http : ng.IHttpService,
            private _window : ng.IWindowService,
            private _timeout : ng.ITimeoutService
        ) {

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

        private _pendingRequests : { [ state : string ] : IPendingRequest } = {};

        //  Public Functions

        authorise( requestDetails : IRequestDetails ) : Rx.Observable<string>
        {
            const state : string = this.generateState();

            ( <any>window ).handleAccessTokenResult = ( result : IAccessTokenResponse ) => this.handleAccessTokenResult( result );
            ( <any>window ).handleAccessTokenDenied = ( result : any ) => this.handleAccessTokenDenied( result );

            var url : string = requestDetails.requestUrl;
            url += "&client_id=" + requestDetails.client_id;
            url += "&redirect_uri=" + requestDetails.redirect_uri;
            url += "&state=" + state;

            console.log( "Making request to " + requestDetails.requestUrl + " (" + state + ")" );

            this._window.open( url, "_blank", "width=500,height=600" );

            const observable : Rx.Subject<string> = new Rx.Subject<string>();

            this._pendingRequests[ state ] = { observable: observable, originalRequest: requestDetails };

            return observable;
        }

        //  Private Functions

        private handleAccessTokenResult( accessTokenResult : IAccessTokenResponse ) : void {
            console.log( "access token result received for " + accessTokenResult.state );

            const request : IPendingRequest = this._pendingRequests[ accessTokenResult.state ];
            request.access_token = accessTokenResult.access_token;

            var url : string = request.originalRequest.validationUrl;
            url += "?access_token=" + accessTokenResult.access_token;

            this._http.get<ITokenValidationResult>( url ).then(
                ( validationResult ) => this.handleValidToken( validationResult, accessTokenResult.state ),
                ( error ) => this.handleTokenInvalid( error, accessTokenResult.state )
            );
        }

        private handleAccessTokenDenied( error : IResponse ) : void
        {
            const request : IPendingRequest = this.cleaUpStateAndGetRequest( error.state );

            console.log( "access token result denied" );

            this._timeout( () => OAuthService.returnError( request, "access token denied" ), 0 );
        }

        private handleValidToken( result : IHttpPromiseCallbackArg<ITokenValidationResult>, state : string ) : void {
            console.log( "token valid ");

            const request : IPendingRequest = this.cleaUpStateAndGetRequest( state );

            if( result.data.aud == request.originalRequest.client_id )
            {
                this._timeout( () => OAuthService.returnSuccess( request, request.access_token ), 0 );
            }
            else
            {
                console.log( "Returned aud: " + result.data.aud + " does not equal expected client id: " + request.originalRequest.client_id );

                this._timeout( () => OAuthService.returnError( request, "returned audience does not match client id" ), 0 );
            }
        }

        private handleTokenInvalid( error : IHttpPromiseCallback<any>, state : string ) : void {
            console.log( "token not valid" );

            const request : IPendingRequest = this.cleaUpStateAndGetRequest( state );

            this._timeout( () => OAuthService.returnError( request, "token not valid" ), 0 );
        }

        private static returnSuccess( request : IPendingRequest, result : string ) : void {

            request.observable.onNext( result );
            request.observable.onCompleted();
        }

        private static returnError( request : IPendingRequest, error : string ) : void {

            request.observable.onError( error );
            request.observable.onCompleted();
        }

        private cleaUpStateAndGetRequest( state : string ) : IPendingRequest
        {
            const request : IPendingRequest = this._pendingRequests[ state ];
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
