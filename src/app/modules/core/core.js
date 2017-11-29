(function() {
  'use strict';

  angular
    .module('singApp.core')
    .controller('App', AppController)
    .factory('jQuery', jQueryService)
    .factory('$exceptionHandler', exceptionHandler)
    .constant('API_SERVER', 'https://api-enelia.ddns.net')
    .constant('UPLOAD_SERVER', 'https://enelia.ddns.net')
    .constant('AUTH_SERVER', 'https://api-enelia.ddns.net')
    .constant('ID_CLIENT', 'eneliaWeb')
  ;

  AppController.$inject = ['config', '$scope', '$localStorage', '$state', '$rootScope', '$window', '$http', 'OAuth', 'API_SERVER', 'OAuthToken'];
  function AppController(config, $scope, $localStorage, $state, $rootScope, $window, $http, OAuth, API_SERVER, OAuthToken) {
    /*jshint validthis: true */
    var vm = this;

    vm.title = config.appTitle;

    $scope.app = config;
    $scope.$state = $state;

    if (angular.isDefined($localStorage.state)){
      $scope.app.state = $localStorage.state;
    } else {
      $localStorage.state = $scope.app.state;
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
    } 

    $scope.logout = function(argument) {
      OAuthToken.removeToken();
      console.log('passe');
      $state.go('login');
    }
   
  }

  jQueryService.$inject = ['$window'];

  function jQueryService($window) {
    return $window.jQuery; // assumes jQuery has already been loaded on the page
  }

  exceptionHandler.$inject = ['$log', '$window', '$injector'];
  function exceptionHandler($log, $window, $injector) {
    return function (exception, cause) {
      var errors = $window.JSON.parse($window.localStorage.getItem('sing-2-angular-errors')) || {};
      errors[new Date().getTime()] = arguments;
      $window.localStorage.setItem('sing-2-angular-errors', $window.JSON.stringify(errors));
      if ($injector.get('config').debug) {
        $log.error.apply($log, arguments);
        $window.alert('check errors');
      }
    };
  }
})();
