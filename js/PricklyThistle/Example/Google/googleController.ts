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
            if( this._googleService.hasToken() )
            {
                this.handleAuthorisation();
            }
        }

        //  Properties

        private _message : string;

        get message() : string {
            return this._message;
        }

        showTokenInfo: boolean;

        private _tokenInfoOutput : string;

        get tokenInfoOutput() : string {
            return this._tokenInfoOutput;
        }

        private _signInEnabled : boolean = true;

        get signInEnabled() : boolean {
            return this._signInEnabled;
        }

        private _profilePicUrl : string;

        get profilePicUrl() : string {
            return this._profilePicUrl;
        }

        private _name : string;

        get name() : string {
            return this._name;
        }

        private _email : string;

        get email() : string {
            return this._email;
        }

        //  Public Functions

        authenticate() : void
        {
            this._signInEnabled = false;

            this._googleService.authorise().subscribe(
                () => this.handleAuthorisation(),
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

            this._name = result.data.given_name + " " + result.data.family_name;
            this._email = result.data.email;

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

        private handleAuthorisation() : void {
            this._signInEnabled = true;
            this._message = undefined;

            this.getTokenInfo();
            this.getUserInfo();
        }

        private handleError( fault : string ) : void {
            this._signInEnabled = true;
            this._message = fault;

            this._tokenInfoOutput = null;
            this.showTokenInfo = false;

            this._profilePicUrl = null;
            this._name = null;
            this._email = null;
        }

    }
}