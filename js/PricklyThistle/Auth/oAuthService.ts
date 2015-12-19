/**
 * Created by Giles on 19/12/2015.
 */

module PricklyThistle.Auth {

    export class OAuthService {

        constructor( private $http: ng.IHttpService ) {
            alert( "Hello World from service" );
        }

    }
}