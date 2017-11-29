(function() {
  'use strict';

  var core = angular.module('singApp.core', [
    'singApp.core.utils',
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'ngStorage',
    'angular-oauth2'
  ]);

  core.constant('ID_CLIENT', 'eneliaWeb');
  core.config(appConfig);

  appConfig.$inject = ['$stateProvider', '$urlRouterProvider', 'OAuthProvider', 'OAuthTokenProvider', 'AUTH_SERVER', 'ID_CLIENT'];
  function appConfig($stateProvider, $urlRouterProvider, OAuthProvider, OAuthTokenProvider, AUTH_SERVER, ID_CLIENT) {

    OAuthProvider.configure({
      baseUrl: AUTH_SERVER,
      clientId: ID_CLIENT,
      clientSecret: 'secret',
      grantPath: '/oauth/token',
      revokePath: '/oauth/revoke',
      clientCredentials: 'header'
    });


  OAuthTokenProvider.configure({
    name: 'token',
    options: {
      secure: false
    }
  });




      $stateProvider
          .state('app', {
              url: '/app',
              abstract: true,
              templateUrl: 'app/modules/core/app.html'
          });

      $urlRouterProvider.otherwise(function ($injector) {
          var $state = $injector.get('$state');
          $state.go('login');
      });
  }
})();
