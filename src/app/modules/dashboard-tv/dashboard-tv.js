(function() {
  'use strict';

  angular.module('singApp.dashboard-tv')
     .controller('ResultatsController', ResultatsController)
     .directive('snGridDemo', snGridDemo);

  ResultatsController.$inject = ['$scope', '$rootScope', 'NgTableParams', '$interval', 'ngAudio', '$http', 'API_SERVER', '$window'];
  function ResultatsController ($scope, $rootScope, NgTableParams, $interval, ngAudio, $http, API_SERVER, $window) {

    var TAB_SIZE_EMPLOYES_COURANT = 10;
    var TAB_SIZE_EMPLOYE_PRECEDENT = 5;  

    //$scope.bingoSound = ngAudio.load("assets/sounds/bingo.mp3");
    //$scope.looserSound = ngAudio.load("assets/sounds/looser.mp3");

    $scope.data = {};
    $scope.data.employeMoisCourant = 'Commerciaux';
    $scope.data.tabCommerciaux = [];
    $scope.data.tabProspecteurs = [];

    $scope.nbPagesCommerciauxCourant = 0;
    $scope.nbPagesProspecteursCourant = 0;

    $scope.getLatestResultats = function() {

    $http.get(API_SERVER + '/resultats-tv').then(
         function(response){
          $scope.data.commerciaux = Array.prototype.slice.call(response.data.resultatsCommerciaux).reverse();
          $scope.data.prospecteurs = Array.prototype.slice.call(response.data.resultatsProspecteurs).reverse();
          $scope.data.commerciauxPrecedent = Array.prototype.slice.call(response.data.resultatsCommerciauxPrecedent).reverse();
          $scope.data.prospecteursPrecedent = Array.prototype.slice.call(response.data.resultatsProspecteursPrecedent).reverse();
          $scope.data.meilleurCommercial = response.data.resultatsCommerciauxPrecedent[response.data.resultatsCommerciauxPrecedent.length - 1];
          $scope.data.meilleurProspecteur = response.data.resultatsProspecteursPrecedent[response.data.resultatsProspecteursPrecedent.length - 1];
          $scope.data.caEnCours = response.data.caEnCours;
          $scope.data.caPrecedent = response.data.caPrecedent;


          for (var i = 0; i < $scope.data.commerciaux.length; i++) {
            $scope.data.commerciaux[i].index = i + 1;
          }
          for (var i = 0; i < $scope.data.prospecteurs.length; i++) {
            $scope.data.prospecteurs[i].index = i + 1;
          }          

$scope.tableEmployesCourants = new NgTableParams({page: 1, count: TAB_SIZE_EMPLOYES_COURANT}, 
                                {counts: [], 
                                  total: TAB_SIZE_EMPLOYES_COURANT, 
                                  getData: function(params) {
                                    return $scope.data.commerciaux.slice((params.page() - 1) * params.count(), params.page() * params.count());
                                  }
                                });





$scope.tableEmployePrecedents = new NgTableParams({page: 1, count: TAB_SIZE_EMPLOYE_PRECEDENT}, 
                                {counts: [], 
                                  total: TAB_SIZE_EMPLOYE_PRECEDENT, 
                                  getData: function(params) {
                                    return $scope.data.commerciauxPrecedent.slice(0, TAB_SIZE_EMPLOYE_PRECEDENT);
                                  }
                                });
         }, 
         function(response){
           // failure call back
          console.log('Erreur chargement résultats TV');
          console.log(response);
         }
    );      

    };

    $scope.getLatestResultats();

//Gestion tableau du mois courant

var pageCommerciaux = 1;
var pageProspecteurs = 1;
function feedTableCommerciaux() {
  $interval.cancel(stopFeeding);

  $scope.data.employeMoisCourant = 'Commerciaux';
  var value = $scope.tableEmployesCourants.page() * TAB_SIZE_EMPLOYES_COURANT;
  if (value < $scope.data.commerciaux.length) {
    pageCommerciaux++;
    $scope.tableEmployesCourants = new NgTableParams({page: pageCommerciaux, count: TAB_SIZE_EMPLOYES_COURANT}, 
                                    {counts: [], 
                                      total: TAB_SIZE_EMPLOYES_COURANT, 
                                      getData: function(params) {
                                        return $scope.data.commerciaux.slice((params.page() - 1) * params.count(), params.page() * params.count());
                                      }
                                    });  

    stopFeeding = $interval(feedTableCommerciaux, 4000);       
  } else {
    pageCommerciaux = 1;
    $scope.data.employeMoisCourant = 'Prospecteurs';
    $scope.tableEmployesCourants = new NgTableParams({page: 1, count: TAB_SIZE_EMPLOYES_COURANT}, 
                                    {counts: [], 
                                      total: TAB_SIZE_EMPLOYES_COURANT, 
                                      getData: function(params) {
                                        return $scope.data.prospecteurs.slice((params.page() - 1) * params.count(), params.page() * params.count());
                                      }
                                    }); 
    stopFeeding = $interval(feedTableProspecteurs, 4000);         
  }  
}

var stopFeeding = $interval(feedTableCommerciaux, 4000);

function feedTableProspecteurs() {
  $interval.cancel(stopFeeding);

          $scope.data.employeMoisCourant = 'Prospecteurs';
          if ($scope.tableEmployesCourants.page() * TAB_SIZE_EMPLOYES_COURANT < $scope.data.prospecteurs.length) {
            pageProspecteurs++;
            $scope.tableEmployesCourants = new NgTableParams({page: pageProspecteurs, count: TAB_SIZE_EMPLOYES_COURANT}, 
                                            {counts: [], 
                                              total: TAB_SIZE_EMPLOYES_COURANT, 
                                              getData: function(params) {
                                                return $scope.data.prospecteurs.slice((params.page() - 1) * params.count(), params.page() * params.count());
                                              }
                                            }); 
            stopFeeding = $interval(feedTableProspecteurs, 4000);  
          } else {
            pageProspecteurs = 1;
            $scope.data.employeMoisCourant = 'Commerciaux';            
            $scope.tableEmployesCourants = new NgTableParams({page: 1, count: TAB_SIZE_EMPLOYES_COURANT}, 
                                            {counts: [], 
                                              total: TAB_SIZE_EMPLOYES_COURANT, 
                                              getData: function(params) {
                                                return $scope.data.commerciaux.slice((params.page() - 1) * params.count(), params.page() * params.count());
                                              }
                                            });

            stopFeeding = $interval(feedTableCommerciaux, 4000); 
          }
}

//Gestion tableaux du mois précédent
    var precedent = 0;
    function feedTablePrecedents() {
        $interval.cancel(stopFeedingPrecedents);
        if (precedent == 0) {
          $scope.data.employeMoisPrecedent = 'Commerciaux';
          $scope.tableEmployePrecedents = new NgTableParams({page: 1, count: TAB_SIZE_EMPLOYE_PRECEDENT}, 
                                          {counts: [], 
                                            total: TAB_SIZE_EMPLOYE_PRECEDENT, 
                                            getData: function(params) {
                                              return $scope.data.commerciauxPrecedent.slice(0, TAB_SIZE_EMPLOYE_PRECEDENT);
                                            }
                                          });
          precedent++;
        } else {
          $scope.data.employeMoisPrecedent = 'Prospecteurs';
          $scope.tableEmployePrecedents = new NgTableParams({page: 1, count: TAB_SIZE_EMPLOYE_PRECEDENT}, 
                                {counts: [], 
                                  total: TAB_SIZE_EMPLOYE_PRECEDENT, 
                                  getData: function(params) {
                                    return $scope.data.prospecteursPrecedent.slice(0, TAB_SIZE_EMPLOYE_PRECEDENT);
                                  }
                                });
          precedent--;
        }
        
        stopFeedingPrecedents = $interval(feedTablePrecedents, 3000);
    }

    var stopFeedingPrecedents = $interval(feedTablePrecedents, 3000);


  // Initialize Firebase FCM
  var configFirebase = {
    apiKey: "AIzaSyBvbsOVdvHBz9cNXLUkMzFa4lLMpMp9bwA",
    authDomain: "enelia-tableau-de-bord.firebaseapp.com",
    databaseURL: "https://enelia-tableau-de-bord.firebaseio.com",
    projectId: "enelia-tableau-de-bord",
    storageBucket: "enelia-tableau-de-bord.appspot.com",
    messagingSenderId: "8208623009"
  };
  if ($rootScope.isFirebaseInitialized == undefined) {
    firebase.initializeApp(configFirebase);
    $rootScope.isFirebaseInitialized = true;
  }
  
  const messaging = firebase.messaging();
  console.log(messaging);
  messaging.requestPermission().then(function() {
    console.log('Notification permission granted.');
    // TODO(developer): Retrieve an Instance ID token for use with FCM.
    messaging.getToken().then(function(currentToken) {
      if (currentToken) {
        //Store the token in localStore and DB if the user profile is loaded
        $window.localStorage.setItem('fcm_token', currentToken);

        if ($rootScope.currentUser != undefined){
          $http.post(API_SERVER + '/register-token', {id: $rootScope.currentUser.id, username: $rootScope.currentUser.username, token: currentToken}).then(
             function(response){
              console.log(currentToken);
             }, 
             function(response){
               console.log('Erreur lors l\'enregistrement du token en base de données');
             }
          );
        }      
      } else {
        // Show permission request.
        console.log('No Instance ID token available. Request permission to generate one.');
        // Show permission UI.
        /*updateUIForPushPermissionRequired();
        setTokenSentToServer(false);*/
      }
    }).catch(function(err) {
      console.log('An error occurred while retrieving token. ', err);
      //showToken('Error retrieving Instance ID token. ', err);
      //setTokenSentToServer(false);
    });
  }).catch(function(err) {
    console.log('Unable to get permission to notify.', err);
  });

   
   // Handle incoming messages. Called when:
  // - a message is received while the app has focus
  // - the user clicks on an app notification created by a sevice worker
  //   `messaging.setBackgroundMessageHandler` handler.
  messaging.onMessage(function(payload) {
    console.log("Message received. ", payload);

      var imageUrl = '';
      var imageWidth = 620;
      var imageHeight = 330;
      if (payload.data.type == 'vente') {
        $scope.bingoSound = ngAudio.load("assets/sounds/bingo.mp3");
        $scope.bingoSound.play();
        imageUrl = '/assets/notifications/bingo.gif';
      } else if (payload.data.type == 'annulation') {
        $scope.looserSound = ngAudio.load("assets/sounds/looser.mp3");
        $scope.looserSound.play();
        imageUrl = '/assets/notifications/chevre.gif';
      } else {
        $scope.bingoSound = ngAudio.load("assets/sounds/bingo.mp3");
        $scope.bingoSound.play();
        imageUrl = '/assets/notifications/bingo.gif';
      }
      swal({
        title: payload.data.titre,
        text: payload.data.commentaires,
        html: $('<div>')
          .addClass('some-class'),
        animation: false,
        customClass: 'animated tada',
        imageUrl: imageUrl,
        imageWidth: imageWidth,
        imageHeight: imageHeight,
        imageAlt: 'Notification',    
      });

    


      setTimeout(function() {
        swal.close();
        $scope.getLatestResultats();
      }, 20000);


    });

  }

  snGridDemo.$inject = ['jQuery'];
  function snGridDemo(jQuery){
    return {
      link: function(){
        function render(){
          var $widgets = jQuery('.widget'),
            $newsWidget = jQuery('#news-widget'),
            $sharesWidget = jQuery('#shares-widget'),
            $autoloadWidget = jQuery('#autoload-widget');

          /**
           * turn off .content-wrap transforms & disable sorting when widget fullscreened
           */
          $widgets.on('fullscreen.widgster', function(){
            jQuery('.content-wrap').css({
              '-webkit-transform': 'none',
              '-ms-transform': 'none',
              transform: 'none',
              'margin': 0,
              'z-index': 2
            });
            //prevent widget from dragging when fullscreened
            jQuery('.widget-container').sortable( 'option', 'disabled', true );
          }).on('restore.widgster closed.widgster', function(){
            jQuery('.content-wrap').css({
              '-webkit-transform': '',
              '-ms-transform': '',
              transform: '',
              margin: '',
              'z-index': ''
            });
            jQuery('body').css({
              'overflow-y': 'scroll'
            });
            //allow dragging back
            jQuery('.widget-container').sortable( 'option', 'disabled', false );
          });

          /**
           * Make refresh button spin when loading
           */
          $newsWidget.on('load.widgster', function(){
            jQuery(this).find('[data-widgster="load"] > i').addClass('fa-spin')
          }).on('loaded.widgster', function(){
            jQuery(this).find('[data-widgster="load"] > i').removeClass('fa-spin')
          });

          /**
           * Custom close prompt for news widget
           */
          $newsWidget.widgster({
            showLoader: false,
            closePrompt: function(callback){
              jQuery('#news-close-modal').modal('show');
              jQuery('#news-widget-remove').on('click', function(){
                jQuery('#news-close-modal').on('hidden.bs.modal', callback).modal('hide');
              });
            }
          });

          /**
           * Use custom loader template
           */
          $sharesWidget.widgster({
            loaderTemplate: '<div class="loader animated fadeIn">' +
            '   <span class="spinner"><i class="fa fa-spinner fa-spin"></i></span>' +
            '</div>'
          });

          /**
           * Make hidden spinner appear & spin when loading
           */
          $autoloadWidget.on('load.widgster', function(){
            jQuery(this).find('.fa-spinner').addClass('fa-spin in');
          }).on('loaded.widgster', function(){
            jQuery(this).find('.fa-spinner').removeClass('fa-spin in')
          }).on('load.widgster fullscreen.widgster restore.widgster', function(){
            jQuery(this).find('.dropdown.open > .dropdown-toggle').dropdown('toggle');
          });

          /**
           * Init all other widgets with default settings & settings retrieved from data-* attributes
           */
          $widgets.widgster();

          /**
           * Init tooltips for all widget controls on page
           */
          jQuery('.widget-controls > a').tooltip({placement: 'bottom'});
        }

        render();
      }
    }

  };


})();
