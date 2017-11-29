(function() {
    'use strict';

    angular.module('singApp', [
        'singApp.core',
        'singApp.login',
        'singApp.error',
        'singApp.profile',
        'singApp.dashboard-tv',
        'singApp.gestion-employes'

    ])
    .run(function($rootScope, OAuth, $state, $http, API_SERVER) {

    $rootScope.$on('oauth:success', function(event, rejection) {
      console.log('LOGIN => SUCCESS');

      $http.get(API_SERVER + '/me').then(
         function(response){
          $rootScope.currentUser = response.data;
         }, 
         function(response){
           console.log('Erreur lors du profil');
         }
      );

      $state.go('app.dashboard-tv');
    });

    $rootScope.$on('oauth:error', function(event, rejection) {
      // Ignore `invalid_grant` error - should be catched on `LoginController`.
      if ('invalid_grant' === rejection.data.error) {
        $state.go('login');
        return;
      }

      // Refresh token when a `invalid_token` error occurs.
      if ('invalid_token' === rejection.data.error) {
        return OAuth.getRefreshToken();
      }

      if ('unauthorized' === rejection.data.error) {
        $state.go('login');
      }

      // Redirect to `/login` with the `error_reason`.
      //return $window.location.href = '/login?error_reason=' + rejection.data.error;
    });    
  });
})();
