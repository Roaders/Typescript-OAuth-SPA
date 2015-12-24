
/**
 * Created by Giles on 24/12/2015.
 */

///<reference path="googleController.ts"/>

module PricklyThistle.Example.Google {

    import IOAuthService = PricklyThistle.Auth.IOAuthService;
    import ITokenValidationResult = PricklyThistle.Auth.ITokenInfo;
    import IPromise = Rx.IPromise;

    export interface IUserInfo {
        id: string,
        email: string,
        verified_email: boolean,
        name: string,
        given_name: string,
        family_name: string,
        link: string,
        picture: string,
        gender: string,
        locale: string
    }

    export interface IGoogleService {
        authorise() : Rx.Observable<string>;
        tokenInfo() : IPromise<ITokenValidationResult>;
        userInfo() : IPromise<IUserInfo>
    }

    export class GoogleService implements IGoogleService {

        //  Statics

        static $inject = [ "OAuthService", "$http" ];

        //  Constructor

        constructor( private _authService : IOAuthService, private _http : ng.IHttpService ) {}

        //  Private Variables

        private _accessToken : string;

        //  Public Functions

        authorise(): Rx.Observable<string> {
            return this._authService.authorise( Google.authDetails ).do(
                ( result ) => this.handleAccessTokenResult( result ),
                () => { this._accessToken = null }
            );
        }

        tokenInfo(): IPromise<ITokenValidationResult> {
            var url : string = Google.authDetails.validationUrl;
            url += "?access_token=" + this._accessToken;

            return this._http.get<ITokenValidationResult>( url );
        }

        userInfo() : IPromise<IUserInfo> {
            var url : string = "https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + this._accessToken;

            return this._http.get<IUserInfo>( url );
        }

        private handleAccessTokenResult( accessToken : string ) : void
        {
            this._accessToken = accessToken;
        }
    }

}