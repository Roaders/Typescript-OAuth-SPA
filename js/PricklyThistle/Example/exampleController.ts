/// <reference path="../Auth/oAuthService.ts" />
/// <reference path="googleConstants.ts" />

module PricklyThistle.Example {

    import IOAuthService = PricklyThistle.Auth.IOAuthService;

    export class ExampleController {

        static $inject = [ "OAuthService" ];

        //  Constructor

        constructor( private _oAuthService : IOAuthService ) {
        }

        //  Properties

        private _message : string = "Awaiting authorisation";

        get message() : string {
            return this._message;
        }

        private _signInEnabled : boolean = true;

        get signInEnabled() : boolean {
            return this._signInEnabled;
        }

        //  Public Functions

        authenticate() : void
        {
            this._signInEnabled = false;

            this._oAuthService.authorise( Example.googleAuthDetails ).subscribe(
                ( result : string ) => this.handleAuthorisation( result ),
                ( fault : string ) => this.handleError( fault )
            );
        }

        //  Private Functions

        private handleAuthorisation( result : string ) : void {
            this._signInEnabled = true;
            this._message = result;
        }

        private handleError( fault : string ) : void {
            this._signInEnabled = true;
            this._message = fault;
        }

    }
}