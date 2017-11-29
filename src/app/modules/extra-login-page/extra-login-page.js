(function() {
  'use strict';

  angular.module('singApp.login')
    .controller('LoginController', LoginController)
  ;

  LoginController.$inject = ['$scope', '$window', '$rootScope', '$state', 'OAuth', '$http', 'API_SERVER'];
  function LoginController ($scope, $window, $rootScope, $state, OAuth, $http, API_SERVER) {

    if (OAuth.isAuthenticated()) {
      $http.get(API_SERVER + '/me').then(
         function(response){
          $rootScope.currentUser = response.data;

          var fcmToken = $window.localStorage.getItem('fcm_token');

          if (fcmToken != undefined && fcmToken != '') {
            $http.post(API_SERVER + '/register-token', {id: $rootScope.currentUser.id, username: $rootScope.currentUser.username, token: fcmToken}).then(
               function(response){
                console.log(response.data);
               }, 
               function(response){
                 console.log('Erreur lors l\'enregistrement du token en base de données');
               }
            );            
          }

          $state.go('app.dashboard-tv');
         }, 
         function(response){
           console.log('Erreur lors du profil');
         }
      );      
    }    

    $scope.user = {};
    $scope.user.username = '';
    $scope.user.password = '';

  	$scope.login = function() {

      OAuth.getAccessToken($scope.user, {});

    };

  }

 
})();
