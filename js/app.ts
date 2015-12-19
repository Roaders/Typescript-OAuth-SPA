/// <reference path="PricklyThistle/Auth/oAuthService.ts" />
/// <reference path="PricklyThistle/Example/exampleController.ts" />
/// <reference path="../typings/tsd.d.ts" />

import OAuthService = PricklyThistle.Auth.OAuthService;
import ExampleController = PricklyThistle.Example.ExampleController;

const module : ng.IModule = angular.module( 'oAuthClient', [] );

module.factory( "OAuthService", OAuthService);

module.controller( "exampleController", ExampleController );