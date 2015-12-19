/**
 * Created by Giles on 19/12/2015.
 */

module PricklyThistle.Auth {

    export class OAuthService {

        static $inject = [ "$http" ];

        constructor( private _http : ng.IHttpService ) {
            alert( "Hello World from service" );
        }
    }
}