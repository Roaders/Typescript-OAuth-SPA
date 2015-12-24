/**
 * Created by Giles Roadnight on 19/12/2015.
 */

/// <reference path="../../../typings/rx/rx.d.ts" />

module PricklyThistle.Auth {

    import IHttpPromiseCallback = angular.IHttpPromiseCallback;
    import IHttpPromiseCallbackArg = angular.IHttpPromiseCallbackArg;
    import IPromise = angular.IPromise;

    export interface IRequestDetails {
        client_id: string,
        redirect_uri: string,
        requestUrl: string,
        validationUrl: string
    }

    interface IPendingRequest {
        originalRequest : IRequestDetails,
        observable : Rx.Subject<string>,
        access_token ?: string,
        window?: Window
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

        static $inject = [ "$http", "$window", "$rootScope", "$interval" ];

        constructor(
            private _http : ng.IHttpService,
            private _window : ng.IWindowService,
            private _scope : ng.IRootScopeService,
            private _interval : ng.IIntervalService
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

        private _checkWindowClosedIntervalPromise : IPromise<any>;

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

            const popup : Window = this._window.open( url, "_blank", "width=500,height=600" );

            const observable : Rx.Subject<string> = new Rx.Subject<string>();

            this._pendingRequests[ state ] = {
                observable: observable,
                originalRequest: requestDetails,
                window: popup
            };

            if( !this._checkWindowClosedIntervalPromise )
            {
                this._checkWindowClosedIntervalPromise = this._interval( () => this.checkWindows(), 500 );
            }

            return observable;
        }

        //  Private Functions

        private checkWindows() : void {
            var windowsOpen: boolean;

            for( var state in this._pendingRequests ) {
                if( this._pendingRequests.hasOwnProperty( state ) ){
                    const request: IPendingRequest = this._pendingRequests[ state ];

                    if( request.window )
                    {
                        if( request.window.closed )
                        {
                            this.sendErrorResult( state, "user closed authorisation window" );
                        }
                        else
                        {
                            windowsOpen = true;
                        }
                    }
                }
            }

            if( !windowsOpen )
            {
                this._interval.cancel( this._checkWindowClosedIntervalPromise );
                this._checkWindowClosedIntervalPromise = null;
            }
        }

        private handleAccessTokenResult( accessTokenResult : IAccessTokenResponse ) : void {
            console.log( "access token result received for " + accessTokenResult.state );

            const request : IPendingRequest = this._pendingRequests[ accessTokenResult.state ];
            request.access_token = accessTokenResult.access_token;
            request.window = null;

            var url : string = request.originalRequest.validationUrl;
            url += "?access_token=" + accessTokenResult.access_token;

            this._http.get<ITokenValidationResult>( url ).then(
                ( validationResult ) => this.handleValidToken( validationResult, accessTokenResult.state ),
                ( error ) => this.handleTokenInvalid( error, accessTokenResult.state )
            );
        }

        private handleAccessTokenDenied( error : IResponse ) : void
        {
            this.sendErrorResult( error.state, "access token permission denied" );
        }

        private sendErrorResult( state: string, message: string ) : void {
            const request : IPendingRequest = this.cleaUpStateAndGetRequest( state );

            console.log( message );

            if( !this._scope.$$phase )
            {
                this._scope.$apply( () => {
                    request.observable.onError( message );
                    request.observable.onCompleted();
                } );

            }
            else
            {
                request.observable.onError( message );
                request.observable.onCompleted();
            }
        }

        private handleValidToken( result : IHttpPromiseCallbackArg<ITokenValidationResult>, state : string ) : void {
            console.log( "token valid ");

            const request : IPendingRequest = this.cleaUpStateAndGetRequest( state );

            if( result.data.aud == request.originalRequest.client_id )
            {
                request.observable.onNext( request.access_token );
            }
            else
            {
                console.log( "Returned aud: " + result.data.aud + " does not equal expected client id: " + request.originalRequest.client_id );
                request.observable.onError( "returned audience does not match client id" );
            }

            request.observable.onCompleted();
        }

        private handleTokenInvalid( error : IHttpPromiseCallback<any>, state : string ) : void {
            console.log( "token not valid" );

            const request : IPendingRequest = this.cleaUpStateAndGetRequest( state );

            request.observable.onError( "token not valid" );
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
