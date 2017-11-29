(function() {
  'use strict';

  angular.module('singApp.gestion-employes')
    .controller('GestionEmployesController', GestionEmployesController)
  ;

  GestionEmployesController.$inject = ['$scope', '$rootScope', '$http', 'OAuth', '$state', 'API_SERVER'];
  function GestionEmployesController ($scope, $rootScope, $http, OAuth, $state, API_SERVER) {

    if (!OAuth.isAuthenticated()) {
      $state.go('login');
    }  

    if ($rootScope.users == undefined) {
      $http.get(API_SERVER + '/employes').then(
         function(response){
          $rootScope.users = response.data;
          $scope.items = response.data;
         }, 
         function(response){
           console.log('Erreur lors du chargement de la liste des employés');
         }
      );
    } else {
      $scope.items = $rootScope.users; 
    }

    $scope.activeGroup = 'all';

    $scope.order = 'asc';

    $scope.$watch('activeGroup', function(newVal, oldVal){
      if (newVal === oldVal) return;
      $scope.$grid.shuffle( 'shuffle', newVal );
    });

    $scope.$watch('order', function(newVal, oldVal){
      if (newVal === oldVal) return;
      $scope.$grid.shuffle('sort', {
        reverse: newVal === 'desc',
        by: function($el) {
          return $el.data('title').toLowerCase();
        }
      });
    })
  }

})();
