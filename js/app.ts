/// <reference path="PricklyThistle/Auth/oAuthService.ts" />
/// <reference path="PricklyThistle/Example/exampleController.ts" />
/// <reference path="../typings/tsd.d.ts" />

import ExampleController = PricklyThistle.Example.ExampleController;
import OAuthService = PricklyThistle.Auth.OAuthService;
import IInjectorService = ng.auto.IInjectorService;

const module : ng.IModule = angular.module( 'oAuthClient', [] );

module.factory( "OAuthService", ( $injector : IInjectorService ) => { return $injector.instantiate( OAuthService ) });

module.controller( "exampleController", ExampleController );