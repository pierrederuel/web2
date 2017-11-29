(function() {
  'use strict';

  var module = angular.module('singApp.gestion-employes', [
    'ui.router',
    'singApp.components.gallery'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.gestion-employes', {
        url: '/gestion/employes',
        templateUrl: 'app/modules/gestion-employes/gestion-employes.html',
        controller: 'GestionEmployesController'
      })
  }
})();
