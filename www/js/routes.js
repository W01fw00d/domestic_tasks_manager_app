angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'
    })

    .state('newAccount', {
      url: '/new_account',
      templateUrl: 'templates/newAccount.html',
      controller: 'newAccountCtrl'
    })

    //The Ionic Splash Screen by default is being used
/*
    .state('splashScreen', {
      url: '/splash',
      templateUrl: 'templates/splashScreen.html',
      controller: 'splashScreenCtrl'
    })
*/




  .state('menu', {
    url: '/side-menu21',
    templateUrl: 'templates/menu.html',
    controller: 'menuCtrl',
    abstract:true
  })

  .state('menu.myHome', {
    url: '/home',
  /*
  resolve: {
    "currentUser": function($meteor) {
      return $meteor.requireUser();
    }
  },
  */
    views: {
    'side-menu21': {
      templateUrl: 'templates/myHome.html',
      controller: 'myHomeCtrl'

    }
  }
})


  .state('menu.availableSchedule', {
    url: '/schedule',
    views: {
      'side-menu21': {
        templateUrl: 'templates/availableSchedule.html',
        controller: 'availableScheduleCtrl'
      }
    }
  })

  .state('menu.calendar', {
    url: '/calendar',
    views: {
      'side-menu21': {
        templateUrl: 'templates/calendar.html',
        controller: 'calendarCtrl'
      }
    }
  })

  .state('menu.manageParticipants', {
    url: '/manage_participants',
    views: {
      'side-menu21': {
        templateUrl: 'templates/manageParticipants.html',
        controller: 'manageParticipantsCtrl'
      }
    }
  })

  .state('menu.manageTasks', {
    url: '/manage_tasks',
    views: {
      'side-menu21': {
        templateUrl: 'templates/manageTasks.html',
        controller: 'manageTasksCtrl'
      }
    }
  })

  .state('menu.newParticipant', {
    url: '/new_participant',
    views: {
      'side-menu21': {
        templateUrl: 'templates/newParticipant.html',
        controller: 'newParticipantCtrl'
      }
    }
  })

  .state('menu.myAccount', {
    url: '/account',
    views: {
      'side-menu21': {
        templateUrl: 'templates/myAccount.html',
        controller: 'myAccountCtrl'
      }
    }
  })

  .state('menu.newTask', {
    url: '/new_task',
    views: {
      'side-menu21': {
        templateUrl: 'templates/newTask.html',
        controller: 'newTaskCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/login')



});
