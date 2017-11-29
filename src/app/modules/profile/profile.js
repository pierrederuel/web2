(function() {
  'use strict';

  angular.module('singApp.profile')
    .controller('ProfileController', ProfileController)
  ;

  ProfileController.$inject = ['$scope', '$rootScope', '$stateParams', '$state', '$http', 'API_SERVER', 'UPLOAD_SERVER'];
  function ProfileController ($scope, $rootScope, $stateParams, $state, $http, API_SERVER, UPLOAD_SERVER) {

      $scope.labels = ["Ventes", "Annulation Client", "Assises", "Visite Technique", "Eco Habitant", "Financement"];
      $scope.colors = [ '#00FF00', '#FF0000', '#0000FF', '#F0000F', '#0F0F0F', '#F0F0F0', '#0F00F0'];

      var userType = 'manager';
      function splitRoles(type) {
        for (var i = 0; i < type.split(',').length; i++) {
          if (type.split(',')[i] == 'ROLE_COMMERCIAL') {
            userType = 'commercial';
          } else if (type.split(',')[i] == 'ROLE_PROSPECTEUR') {
            userType = 'prospecteur';
          }
        }
      }
      
      $scope.poste = '';
      if ($stateParams.userType.indexOf('ROLE_MANAGER') !== -1) {
        $scope.poste = 'Manager';
      }
      if ($stateParams.userType.indexOf('ROLE_COMMERCIAL') !== -1) {
        if ($scope.poste != '') {
          $scope.poste = $scope.poste + ', ';
        }
        $scope.poste = $scope.poste + 'Commercial';
      }
      if ($stateParams.userType.indexOf('ROLE_PROSPECTEUR') !== -1) {
        if ($scope.poste != '') {
          $scope.poste = $scope.poste + ', ';
        }  
        $scope.poste = $scope.poste + 'Prospecteur';
      }

      splitRoles($stateParams.userType);

      if (userType != 'manager') {
        $http.get(API_SERVER + '/employe-stats/' + userType + '/' + $stateParams.userId).then(
           function(response){
              $scope.userProfile = response.data; 
           }, 
           function(response){
             console.log('Erreur lors du chargement du profil');
           }
        );         
      }


      $scope.config = {};
      $scope.config.options = {
          url: UPLOAD_SERVER + '/upload.php',
          maxFilesize: 100,
          maxFiles: 1,
          paramName: "file",
          maxThumbnailFilesize: 10,
          parallelUploads: 1,
          autoProcessQueue: true
      };
      $scope.config.eventHandlers = {
          'success': function (file, response) {
            $http.put(API_SERVER + '/update-photo', {id: $scope.userProfile.id, photo: file.xhr.response.substring(9, 49)} ).then(
                 function(response){
                    $state.reload(); 
                 }, 
                 function(response){
                   console.log('Erreur lors du changement de photo');
                 }
              ); 
          }
      };  
  }

})();
