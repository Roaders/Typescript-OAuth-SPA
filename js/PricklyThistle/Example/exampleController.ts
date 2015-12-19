/// <reference path="../Auth/oAuthService.ts" />
/// <reference path="googleConstants.ts" />

module PricklyThistle.Example {

    import OAuthService = PricklyThistle.Auth.OAuthService;

    export class ExampleController {

        static $inject = [ "OAuthService" ];

        //  Constructor

        constructor( private _oAuthService : OAuthService ) {
        }

        //  Public Functions

        authenticate() : void
        {
            this._oAuthService.authorise( Example.googleAuthDetails );
        }

    }
}