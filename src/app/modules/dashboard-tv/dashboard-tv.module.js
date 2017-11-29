(function() {
  'use strict';

  var module = angular.module('singApp.dashboard-tv', [
    'ui.router',
    'singApp.components.tile',
    'ui.jq',
    'ngTable',
    'ngAudio'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.dashboard-tv', {
        url: '/dashboard-tv',
        templateUrl: 'app/modules/dashboard-tv/dashboard-tv.html',
        controller: 'ResultatsController'
      })
  }
})();
