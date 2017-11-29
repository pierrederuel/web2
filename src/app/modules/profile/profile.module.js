(function() {
  'use strict';

  var module = angular.module('singApp.profile', [
    'ui.router',
    'singApp.components.dropzone',
    'chart.js'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.profile', {
        url: '/profile/:userType/:userId',
        templateUrl: 'app/modules/profile/profile.html',
        controller: 'ProfileController'
      })
  }
})();
