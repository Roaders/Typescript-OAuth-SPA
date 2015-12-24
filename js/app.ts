/// <reference path="PricklyThistle/Auth/oAuthService.ts" />
/// <reference path="PricklyThistle/Example/Google/googleController.ts" />
/// <reference path="PricklyThistle/Example/Google/googleService.ts" />
/// <reference path="../typings/tsd.d.ts" />

import GoogleController = PricklyThistle.Example.Google.GoogleController;
import OAuthService = PricklyThistle.Auth.OAuthService;
import IInjectorService = ng.auto.IInjectorService;
import GoogleService = PricklyThistle.Example.Google.GoogleService;

const module : ng.IModule = angular.module( 'oAuthClient', [ 'ngCookies' ] );

module.factory( "OAuthService", ( $injector : IInjectorService ) => { return $injector.instantiate( OAuthService ) })
    .factory( "googleService", ( $injector : IInjectorService ) => { return $injector.instantiate( GoogleService ) });

module.controller( "googleController", GoogleController );