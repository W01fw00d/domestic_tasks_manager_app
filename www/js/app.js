// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'ngCordova', 'app.controllers', 'app.routes',
'app.services', 'app.directives', 'LocalStorageModule'])

.config(function (localStorageServiceProvider) {
    localStorageServiceProvider
      .setPrefix('tasking')
      /*
      .setStorageType('localStorage')
      .setNotify(true, true)
      */
  })

.run(function($ionicPlatform, $rootScope) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  // checking for errors in state change

$rootScope.$on('$stateChangeError',
  function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch when the $requireUser promise is rejected and redirect to login state
    if (error === 'AUTH_REQUIRED') {
      event.preventDefault();
      console.log("no user");
      $state.go('menu.login');
    }
  });

})
