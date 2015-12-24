/// <reference path="../../Auth/oAuthService.ts" />
/// <reference path="googleConstants.ts" />

module PricklyThistle.Example.Google {

    import IOAuthService = PricklyThistle.Auth.IOAuthService;
    import ITokenInfo = PricklyThistle.Auth.ITokenInfo;
    import IHttpPromiseCallbackArg = angular.IHttpPromiseCallbackArg;

    export class GoogleController {

        static $inject = [ "googleService" ];

        //  Constructor

        constructor( private _googleService : IGoogleService ) {
        }

        //  Properties

        private _message : string = "Awaiting authorisation";

        get message() : string {
            return this._message;
        }

        private _tokenInfoOutput : string;

        get tokenInfoOutput() : string {
            return this._tokenInfoOutput;
        }

        private _userInfoOutput : string;

        get userInfoOutput() : string {
            return this._userInfoOutput;
        }

        private _signInEnabled : boolean = true;

        get signInEnabled() : boolean {
            return this._signInEnabled;
        }

        private _profilePicUrl : string;

        get profilePicUrl() : string {
            return this._profilePicUrl;
        }

        //  Public Functions

        authenticate() : void
        {
            this._signInEnabled = false;

            this._googleService.authorise().subscribe(
                ( result : string ) => this.handleAuthorisation( result ),
                ( fault : string ) => this.handleError( fault )
            );
        }

        getTokenInfo() : void {
            this._googleService.tokenInfo().then(
                ( result ) => { this.handleTokenInfo( result ) },
                ( fault : string ) => this.handleError( fault )
            )
        }

        getUserInfo() : void {
            this._googleService.userInfo().then(
                ( result ) => { this.handleUserInfo( result ) },
                ( fault : string ) => this.handleError( fault )
            )
        }

        //  Private Functions

        private handleUserInfo( result : IHttpPromiseCallbackArg<IUserInfo> ) : void {
            console.log( "User info received at " + new Date() );

            this._userInfoOutput = "name: " + result.data.given_name + " " + result.data.family_name + "\n";
            this._userInfoOutput += "email: " + result.data.email + "\n";
            this._userInfoOutput += "updated at: " + new Date();

            this._profilePicUrl = result.data.picture;
        }

        private handleTokenInfo( result : IHttpPromiseCallbackArg<ITokenInfo> ) : void {
            console.log( "token info received at " + new Date() );

            this._tokenInfoOutput = "aud: " + result.data.aud + "\n";
            this._tokenInfoOutput += "access_type: " + result.data.access_type + "\n";
            this._tokenInfoOutput += "expires_in: " + result.data.expires_in + "\n";
            this._tokenInfoOutput += "scope: " + result.data.scope + "\n";
            this._tokenInfoOutput += "updated at: " + new Date();
        }

        private handleAuthorisation( result : string ) : void {
            this._signInEnabled = true;
            this._message = undefined;

            this.getTokenInfo();
            this.getUserInfo();
        }

        private handleError( fault : string ) : void {
            this._signInEnabled = true;
            this._message = fault;

            this._userInfoOutput = null;
            this._tokenInfoOutput = null;
            this._profilePicUrl = null;
        }

    }
}