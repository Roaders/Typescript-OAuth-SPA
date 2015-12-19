/// <reference path="../Auth/oAuthService.ts" />

module PricklyThistle.Example {

    import OAuthService = PricklyThistle.Auth.OAuthService;

    export class ExampleController {

        constructor( OAuthService : OAuthService ) {
            alert( "Example Controller constructor" );
        }

        message : String = "Hello World from controller";

    }
}