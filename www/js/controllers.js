
angular.module('app.controllers', [])

  /*
  .controller('main', function ($scope, localStorageService) {

  })
  */

  .controller('menuCtrl', function ($scope, $state, $ionicPopup, logged_user, localStorageService) {

    $scope.logout = function () {


       var confirmPopup = $ionicPopup.confirm({
         title: 'Logout',
         template: 'Are you sure you want to logout from the App?',
         //cancelText: 'Cancel',
         okText: 'Logout',
         okType: 'button-assertive'
       });

       confirmPopup.then(function(res) {
         if(res) {
           logged_user.setUser({});
           $state.go('login');

         }
       });

    }
  })

.controller('myHomeCtrl', function($scope, $state, $cordovaToast, localStorageService, appMode, logged_user) {

  $scope.logout = function() {
   alert("in doLogoutAction");
    $state.go('login');
  };


  $scope.$on('$ionicView.enter', function () {

    $scope.user = logged_user.getUser();
    appMode.setMode('default');

    tasks = localStorageService.get('chosen_tasks');
    participants = localStorageService.get('chosen_participants');

  });

  $scope.goToCalendar = function() {

    //If there are tasks and participants assigned, proceed to calendar
    if (tasks.length == 0){

      console.log("There aren't any tasks assigned to your home!");
      $scope.showToast(
        "There aren't any tasks assigned to your home!",
        'short', 'bottom');

    }else if (participants.length == 0){

      console.log("There aren't any participants assigned to your home!");
      $scope.showToast(
        "There aren't any participants assigned to your home!",
        'short', 'bottom');

    }else if(!is_calendar_feasible()){

      console.log("There's at least one task that nobody want to do... maybe take it out?");
      $scope.showToast(
        "There's at least one task that nobody want to do... maybe take it out?",
        'short', 'bottom');

    }else{
      $state.go('menu.calendar');
    }
  }

  /*
  * Checks if the calendar is feasible. Will return false if:
  * Everybody has forbidden this task
  * It reorders the tasks by the number of participants that has forbidden them,
  * to help making a more fair assignment in calendarCtrl.
  */
  function is_calendar_feasible(){

    /*Create a new variable for the task object, called forbidden_by, that stores
    *the number of participants that has forbidden this task
    */
    for (var i = 0; i < tasks.length; i++){

      tasks[i].forbidden_by = 0;
    }

    //Checking every task looking for participants that can do it
    var feasible = true;
    for (var i = 0; ( (i < tasks.length) && (feasible) ); i++){

      var available_participant = false;
      for (var j = 0; j < participants.length; j++){

        var forbidden_tasks = participants[j].forbidden_tasks;

        var found = false;
        for (var k = 0; ( (k < forbidden_tasks.length) && (!found) ); k++){

          if (forbidden_tasks[k].id == tasks[i].id){

            found = true;
            tasks[i].forbidden_by++;

            console.log(tasks[i]);
          }
        }

        if (found == false){
          available_participant = true;
        }
      }

      if (available_participant == false){
        feasible = false;
      }
    }


    //Now we reorder the tasks: first the ones that are more forbidden
    order_tasks_byForbidden();

    //debug
    /*
    for (var i = 0; i < tasks.length; i++){

      console.log(tasks[i].name + ' has been forbidden by: ' + tasks[i].forbidden_by);
    }
    */
    //debug

    localStorageService.set('chosen_tasks', tasks);

    return feasible;
  }

  //Sorts the tasks from + to - tasks that have forbidden them
  function order_tasks_byForbidden(){

    // Pila que guarda las dos posiciones que limitan el grupo de números a ordenar: [pos inicial, pos final], ambos inclusive
    var stack = [[]];

		stack.push([0, (tasks.length - 1) ]);

		while (stack.length > 1) {
			stack = quicksort_tasks_byForbidden(stack);
		}
  }

  /**
	 * Método que ordena el grupo de números que le indique el primer elemento de la pila,
	 * lo borra y genera otros elementos si es necesario
   * (adaptación para tasks.forbidden_by, de mayor a menor)
	 */
	function quicksort_tasks_byForbidden(stack) {

		// pivote, puntero A, puntero B
		var pivot_pos, pivot, puntA, puntB;

		limits = stack.pop();

		pivot_pos = limits[0];
		pivot = tasks[pivot_pos];
		puntB = limits[1];
		puntA = pivot_pos;

		punt = "B";

		while (puntA != puntB) {

			if (punt == "B") {
				if (tasks[puntB].forbidden_by >= pivot.forbidden_by) {

					tasks[pivot_pos] = tasks[puntB];
					pivot_pos = puntB;
					tasks[puntB] = pivot;

					puntA++;
					punt = "A";
				} else {
					puntB--;
				}

			} else if (punt == "A") {
				if (tasks[puntA].forbidden_by <= pivot.forbidden_by) {

					tasks[pivot_pos] = tasks[puntA];
					pivot_pos = puntA;
					tasks[puntA] = pivot;

					puntB--;
					punt = "B";
				} else {
					puntA++;
				}
			}
		}

		// puntA = puntB a estas alturas
		tasks[puntA] = pivot;

		if ( !(limits[0] >= (puntA - 1)) ) {
			stack.push([ limits[0], (puntA - 1) ]);
		}

		if ( !(limits[1] <= (puntA + 1)) ) {
			stack.push([ (puntA + 1), limits[1] ]);
		}

		return stack;
	}

  $scope.showToast = function(message, duration, location) {
        $cordovaToast.show(message, duration, location).then(function(success) {
            console.log("The toast was shown");
        }, function (error) {
            console.log("The toast was not shown due to " + error);
        });
    }

})

.controller('loginCtrl', function($scope, $state, $cordovaToast, $http, localStorageService, logged_user) {

  $scope.$on('$ionicView.enter', function () {

    $scope.user = {name: '', password: ''};
    $scope.user.name = '';
    $scope.user.password = '';

    $scope.data= {url: localStorageService.get('url')};
  });

  $scope.login = function() {

    var action = '/users/login/';

    localStorageService.set('url', $scope.data.url);
    post_to_DB($http, $scope.data.url, action, $scope.user, $scope.on_login_success);
  }

  $scope.on_login_success = function(response){

    if (response.length === 0){

      console.log('Error login! The name and/or the password are incorrect');
      $scope.showToast('Error login! The name and/or the password are incorrect', 'short', 'bottom');

    }else{
      logged_user.setUser(response[0]);

      console.log('Logged successfully!');
      $scope.showToast('Logged successfully!', 'short', 'bottom');

      $state.go('menu.myHome');
    }
  }

  $scope.showToast = function(message, duration, location) {
      $cordovaToast.show(message, duration, location).then(function(success) {
          console.log("The toast was shown");
      }, function (error) {
          console.log("The toast was not shown due to " + error);
      });
  }
})

.controller('newAccountCtrl', function($scope, $state, $http, $cordovaToast, logged_user, localStorageService) {

  $scope.$on('$ionicView.enter', function () {

    $scope.new_user = {name: '', password: '', admin: false, participant: 0};
    $scope.new_user.name = '';
    $scope.new_user.password = '';
    $scope.re_password = '';

    url = localStorageService.get('url');
  });

  $scope.createAccount = function() {

    var participant = {
        name: $scope.new_user.name,
        forbidden_tasks: [],
        available_schedule: [
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true}
        ]
    };

    var action = "/participants/create";
    post_to_DB($http, url, action, participant, $scope.on_participant_create_success);

  }

  $scope.on_participant_create_success= function(response){

    var chosen_participants = localStorageService.get('chosen_participants');

    chosen_participants.push(response);
    localStorageService.set( 'chosen_participants',  chosen_participants);

    console.log('A new participant for your user has been created successfully!');
    $scope.showToast('A new participant for your user has been created successfully!', 'short', 'bottom');

    $scope.new_user.participant = response.id;
    console.log($scope.new_user);

    var action = "/users/create";
    post_to_DB($http, url, action, $scope.new_user,$scope.on_user_create_success);
  }

  $scope.on_user_create_success= function(response){

    console.log(response);

    //login
    logged_user.setUser(response);

    console.log('Your new account has been created successfully!');
    $scope.showToast('Your new account has been created successfully!', 'short', 'bottom');

    $state.go('menu.myHome');
  }

  $scope.showToast = function(message, duration, location) {
      $cordovaToast.show(message, duration, location).then(function(success) {
          console.log("The toast was shown");
      }, function (error) {
          console.log("The toast was not shown due to " + error);
      });
  }

})

/*
.controller('splashScreenCtrl', function($scope) {

})
*/

.controller('availableScheduleCtrl', function($scope, $state, $cordovaToast, appMode, participantDraft) {

  $scope.available_schedule = [{}];

  $scope.$on('$ionicView.enter', function () {
    $scope.loadAvailableSchedule();
  });

  $scope.loadAvailableSchedule = function() {

    $scope.available_schedule = participantDraft.getParticipant().available_schedule;
    //console.log($scope.available_schedule);
  }

  $scope.applyChanges = function () {

    if (are_all_unchecked()){

      console.log("This participant is busy at all times of the week! Check at least one time of the week");

      $scope.showToast(
        'This participant is busy at all times of the week! Check at least one time of the week',
        'short', 'bottom');

    }else{

      //Update the participant draft
      $scope.participant = participantDraft.getParticipant();
      $scope.participant.available_schedule = $scope.available_schedule;
      participantDraft.setParticipant($scope.participant);

      $state.go('menu.newParticipant');
    }
  }

  checked_all = true;

  $scope.check_all = function () {

    if (checked_all){

      $scope.available_schedule = [
          {morning: false, afternoon: false},
          {morning: false, afternoon: false},
          {morning: false, afternoon: false},
          {morning: false, afternoon: false},
          {morning: false, afternoon: false},
          {morning: false, afternoon: false},
          {morning: false, afternoon: false}
      ]

      checked_all = false;

    }else{

      $scope.available_schedule = [
          {morning: true, afternoon: true},
          {morning: true, afternoon: true},
          {morning: true, afternoon: true},
          {morning: true, afternoon: true},
          {morning: true, afternoon: true},
          {morning: true, afternoon: true},
          {morning: true, afternoon: true}
      ]

      checked_all = true;
    }
  }

  // If none checkbox is checked, returns true
  function are_all_unchecked(){

    var unchecked = true;

    for(var i = 0; ( (i < $scope.available_schedule.length) && (unchecked) ); i++){

      if ($scope.available_schedule[i]['morning'] || $scope.available_schedule[i]['afternoon']){
        unchecked = false;
      }
    }
    return unchecked;
  }

  $scope.showToast = function(message, duration, location) {
        $cordovaToast.show(message, duration, location).then(function(success) {
            console.log("The toast was shown");
        }, function (error) {
            console.log("The toast was not shown due to " + error);
        });
    }

})

.controller('calendarCtrl', function($scope, $state, $cordovaToast, localStorageService) {

  $scope.$on('$ionicView.enter', function () {

    $scope.participants = [];

    $scope.tasks_calendar = [
      {morning: [], afternoon: []},
      {morning: [], afternoon: []},
      {morning: [], afternoon: []},
      {morning: [], afternoon: []},
      {morning: [], afternoon: []},
      {morning: [], afternoon: []},
      {morning: [], afternoon: []}
    ];

    tasks = localStorageService.get('chosen_tasks');

    participants = localStorageService.get('chosen_participants');

    //We add the array assigned tasks to each participant
    for (var i = 0; i < participants.length; i++){

      participants[i].assigned_tasks = [
        {morning :[], afternoon :[]},
        {morning :[], afternoon :[]},
        {morning :[], afternoon :[]},
        {morning :[], afternoon :[]},
        {morning :[], afternoon :[]},
        {morning :[], afternoon :[]},
        {morning :[], afternoon :[]}
      ];
      participants[i].dif_points = 0;
    }

    //Tasks assigning
    feasible = assign_tasks_frequency_twice_day();
    if (feasible){

      feasible = assign_tasks_frequency_once_day();

      if (feasible){

        feasible = assign_tasks_frequency_once_week();
      }else{

        console.log('It seems there was an error with the calendar generator...');
        $scope.showToast('It seems there was an error with the calendar generator...', 'short', 'bottom');
      }
    }else{
      console.log('It seems there was an error with the calendar generator...');
      $scope.showToast('It seems there was an error with the calendar generator...', 'short', 'bottom');
    }

    if (!feasible){

      console.log('It seems there was an error with the calendar generator...');
      $scope.showToast('It seems there was an error with the calendar generator...', 'short', 'bottom');
    }else{

      generate_calendar($scope);
    }

  });

  function generate_calendar($scope){

    // Insert the data that is going to be shown to string and put it on tasks_calendar
    for (var i = 0; i < $scope.tasks_calendar.length; i++){
      for (var j = 0; (j < participants.length); j++){

        if (participants[j].assigned_tasks[i]['morning'].length > 0){

          var participant_session = {name: participants[j].name, assigned_tasks: ''};

          var separator = '';
          for (var k = 0; (k < participants[j].assigned_tasks[i]['morning'].length); k++){

            participant_session.assigned_tasks += separator + participants[j].assigned_tasks[i]['morning'][k].name;
            separator = ', ';
          }

          $scope.tasks_calendar[i]['morning'].push( participant_session );
        }

        if (participants[j].assigned_tasks[i]['afternoon'].length > 0){
          var participant_session = {name: participants[j].name, assigned_tasks: ''};

          var separator = '';
          for (var k = 0; (k < participants[j].assigned_tasks[i]['afternoon'].length); k++){

            participant_session.assigned_tasks += separator +  participants[j].assigned_tasks[i]['afternoon'][k].name;
            separator = ', ';
          }

          $scope.tasks_calendar[i]['afternoon'].push( participant_session );
        }
      }
    }

    for (var i = 0; (i < participants.length); i++){

      console.log( participants[i].name + ': ' + participants[i].dif_points + ' dif_points.');

    }

    $scope.participants = participants;
  }

  function assign_tasks_frequency_twice_day(){

    feasible = true;
    for (var i = 0; ( (i < tasks.length) && feasible ); i++){

      if (tasks[i].frequency == 'Twice a day'){

        sessions_needed = [
              {morning: true, afternoon: true},
              {morning: true, afternoon: true},
              {morning: true, afternoon: true},
              {morning: true, afternoon: true},
              {morning: true, afternoon: true},
              {morning: true, afternoon: true},
              {morning: true, afternoon: true}
          ]

        var new_session_assigned = true;
        while (new_session_assigned){

          new_session_assigned = false;
          //quicksort of participants by dif_points
          order_participants_byDifficulty();

          for (var j = 0; ((j < participants.length) && !new_session_assigned); j++){

            if (!is_forbidden_task(i, j)){

              var available_schedule = participants[j].available_schedule;
              for (var k = 0; ((k < available_schedule.length) && !new_session_assigned ); k++){

                to_afternoon = check_morning_afternoon_tasks(j, k);
                if ( (sessions_needed[k]['morning']) && (available_schedule[k]['morning']) && !to_afternoon){

                  assign_task_to_participant(i, j, k, 'morning');
                  sessions_needed[k]['morning'] = false;
                  new_session_assigned = true;

                }else if ( (sessions_needed[k]['afternoon']) && (available_schedule[k]['afternoon']) ){

                  assign_task_to_participant(i, j, k, 'afternoon');
                  sessions_needed[k]['afternoon'] = false;
                  new_session_assigned = true;
                }
              }
            }
          }
        }

        //Comprobamos que se hayan asignado todas las sesiones
        for (var j = 0; ( (j <sessions_needed.length) && feasible ); j++){

          if ( (sessions_needed[j]['morning']) || (sessions_needed[j]['afternoon']) ){
            feasible = false;
          }
        }
      }
    }
    return feasible;
  }

  function assign_tasks_frequency_once_day(){

    feasible = true;

    //For every week day, we try to assign all the tasks
    for (var w = 0; ( ( w < 7 ) && feasible ); w++){

      for (var i = 0;  i < tasks.length ; i++){

        if (tasks[i].frequency == 'Once a day'){

            //quicksort of participants by dif_points
            order_participants_byDifficulty();

            var new_session_assigned = false;

            for (var j = 0; ( (j < participants.length) && !new_session_assigned ); j++){

              if (!is_forbidden_task(i, j)){

                var available_schedule = participants[j].available_schedule;

                  to_afternoon = check_morning_afternoon_tasks(j, w);
                  if ( (available_schedule[w]['morning']) && !to_afternoon ){

                    assign_task_to_participant(i, j, w, 'morning');
                    new_session_assigned = true;

                  }else if (available_schedule[w]['afternoon'] ){

                    assign_task_to_participant(i, j, w, 'afternoon');
                    //sessions_needed[k] = false;
                    new_session_assigned = true;
                  }

              }
            }


          //Comprobamos que se haya asignado la sesion
          if ( new_session_assigned === false ){
            feasible = false;
          }

        }
      }

    }
    return feasible;
  }

  function assign_tasks_frequency_once_week(){

    feasible = true;
    for (var i = 0; ( ( i < tasks.length ) && feasible ); i++){

      if (tasks[i].frequency == 'Once a week'){

        session_needed = true;

        var new_session_assigned = true;
        while (new_session_assigned){

          new_session_assigned = false;
          //quicksort of participants by dif_points
          order_participants_byDifficulty();

          for (var j = 0; ( (j < participants.length) && session_needed && !new_session_assigned ); j++){

            if (!is_forbidden_task(i, j)){

              var available_schedule = participants[j].available_schedule;
              for (var k = 0; ((k < available_schedule.length) && !new_session_assigned); k++){

                to_afternoon = check_morning_afternoon_tasks(j, k);
                if (available_schedule[k]['morning'] && !to_afternoon){

                  assign_task_to_participant(i, j, k, 'morning');
                  session_needed = false;
                  new_session_assigned = true;

                }else if (available_schedule[k]['afternoon']){

                  assign_task_to_participant(i, j, k, 'afternoon');
                  session_needed = false;
                  new_session_assigned = true;
                }
              }
            }
          }
        }

        if (session_needed){
          feasible = false;
        }
      }
    }
    return feasible;
  }

  //Checks if the current participant has the current task as forbidden
  function is_forbidden_task(i, j){

    forbidden_task = false;
    for (var k = 0; ( k < participants[j].forbidden_tasks.length); k++){

      if (participants[j].forbidden_tasks[k].id == tasks[i].id){
        forbidden_task = true;
      }
    }
    return forbidden_task;
  }

  //Checks if there are less tasks assigned to the afternoon, and if it's available
  function check_morning_afternoon_tasks(j, k){

    to_afternoon = false;

    morning_tasks = participants[j].assigned_tasks[k]['morning'].length;
    afternoon_tasks = participants[j].assigned_tasks[k]['afternoon'].length;

    if ((afternoon_tasks < morning_tasks) && (participants[j].available_schedule[k]['afternoon'])){
      to_afternoon = true;
    }

    return to_afternoon;
  }

  //Assigns a tasks to a participant
  function assign_task_to_participant(i, j, k, l){

    participants[j].dif_points += parseInt(tasks[i].difficulty);
    participants[j].assigned_tasks[k][l].push(tasks[i]);
  }

  //Sorts the participants from - to + dif_points
  function order_participants_byDifficulty(stack){

    // Pila que guarda las dos posiciones que limitan el grupo de números a ordenar: [pos inicial, pos final], ambos inclusive
    var stack = [[]];

		stack.push([0, (participants.length - 1) ]);

		while (stack.length > 1) {
			stack = quicksort_participants_byDifficulty(stack);
		}
  }

  /**
	 * Método que ordena el grupo de números que le indique el primer elemento de la pila,
	 * lo borra y genera otros elementos si es necesario
   * (adaptación para participants.dif_points, de menor a mayor)
	 */
	function quicksort_participants_byDifficulty(stack) {

		// pivote, puntero A, puntero B
		var pivot_pos, pivot, puntA, puntB;

		limits = stack.pop();

		pivot_pos = limits[0];
		pivot = participants[pivot_pos];
		puntB = limits[1];
		puntA = pivot_pos;

		punt = "B";

		while (puntA != puntB) {

			if (punt == "B") {
				if (participants[puntB].dif_points <= pivot.dif_points) {
      //if (participants[puntB].dif_points < pivot.dif_points) {

					participants[pivot_pos] = participants[puntB];
					pivot_pos = puntB;
					participants[puntB] = pivot;

					puntA++;
					punt = "A";
				} else {
					puntB--;
				}

			} else if (punt == "A") {
				if (participants[puntA].dif_points >= pivot.dif_points) {
        //if (participants[puntA].dif_points > pivot.dif_points) {

					participants[pivot_pos] = participants[puntA];
					pivot_pos = puntA;
					participants[puntA] = pivot;

					puntB--;
					punt = "B";
				} else {
					puntA++;
				}
			}
		}

		// puntA = puntB a estas alturas
		participants[puntA] = pivot;

		if ( !(limits[0] >= (puntA - 1)) ) {
			stack.push([ limits[0], (puntA - 1) ]);
		}

		if ( !(limits[1] <= (puntA + 1)) ) {
			stack.push([ (puntA + 1), limits[1] ]);
		}

		return stack;
	}

  $scope.showToast = function(message, duration, location) {
        $cordovaToast.show(message, duration, location).then(function(success) {
            console.log("The toast was shown");
        }, function (error) {
            console.log("The toast was not shown due to " + error);
        });
    }

})

.controller('manageParticipantsCtrl', function($scope, $state, $http, participantDraft, appMode, logged_user, localStorageService) {

  $scope.chosen_participants = [];
  $scope.participants = [];

  $scope.$on('$ionicView.enter', function () {

    $scope.user = logged_user.getUser();

    //Gets tasks from the API
    var action = "/participants/read";

    url = localStorageService.get('url');

    $http.get('http://' + url + action)
      .success(function(response) {

         $scope.participants = response;
         $scope.loadChosenParticipantsList();
      });

  });

  /* Loads the chosen participants for the home
  */
  $scope.loadChosenParticipantsList = function() {

    if (localStorageService.get('chosen_participants')){

      $scope.chosen_participants = localStorageService.get('chosen_participants');

      // Erase from the list all the participants already chosen
      for (var i = 0; i < $scope.chosen_participants.length; i++){
        for (var j = 0; j < $scope.participants.length; j++){
          if ($scope.chosen_participants[i].id == $scope.participants[j].id){

            $scope.participants = removeByAttr($scope.participants, 'id', $scope.chosen_participants[i].id);
          }
        }
      }

      $scope.participants_select = {index: 0};
    }
  }

  $scope.addChosenParticipant = function () {

    var new_chosen_participant = $scope.participants[$scope.participants_select.index];
    $scope.chosen_participants.push( new_chosen_participant );
    $scope.participants_select = {};
    $scope.participants_select.index = 0;
    $scope.participants = removeByAttr($scope.participants, 'id', new_chosen_participant.id);
    $scope.updateStorageChosenParticipants();
    $scope.loadChosenParticipantsList();
  }

  $scope.removeChosenParticipant = function(chosen_participant) {

      for(i = 0; i < $scope.chosen_participants.length; i++) {

        if($scope.chosen_participants[i] == chosen_participant){
          $scope.chosen_participants.splice(i, 1);
          $scope.updateStorageChosenParticipants();
          $scope.participants.push(chosen_participant);
          $scope.participants_select = {};
          $scope.participants_select.index = 0;
        }
      }
    }

    /* Edits the task*/
    $scope.editParticipant = function (chosen_participant) {

      participantDraft.setParticipant(chosen_participant);
      appMode.setMode('participantEdit');
      $state.go('menu.newParticipant');
    }

  $scope.updateStorageChosenParticipants = function () {

    localStorageService.set( 'chosen_participants', $scope.chosen_participants );
  }

})

.controller('manageTasksCtrl', function($scope, $state, $cordovaToast, $http, localStorageService, appMode, taskDraft, participantDraft) {

  $scope.$on('$ionicView.enter', function () {

    $scope.tasks = [];
    $scope.chosen_tasks = [];
    $scope.isParticipantDraft = false;
    //$scope.tasks_select = {index: 0};
    //$scope.tasks_select.index = 0;

    $scope.view_title = 'Chosen Tasks';

    //Gets tasks from the API
    var action = "/tasks/read";

    url = localStorageService.get('url');

    $http.get('http://' + url + action)
      .success(function(response) {
         $scope.tasks = response;

         $scope.loadChosenTasksList();
      });

  });

  /* Load the forbidden tasks and shows the apply button if the user is creating a new participant,
  otherwise it loads the chosen tasks for the home and hides that button
  */
  $scope.loadChosenTasksList = function() {

      // If there's a participantDraft
      if (appMode.getMode() == 'participantDraft' || appMode.getMode() == 'participantEdit'){

        $scope.view_title = 'Forbidden tasks';
        //If this boolean is true, it shows the apply changes button
        $scope.isParticipantDraft = true;
        $scope.chosen_tasks = participantDraft.getParticipant().forbidden_tasks;

      }else if (localStorageService.get('chosen_tasks')){

        $scope.chosen_tasks = localStorageService.get('chosen_tasks');
      }

      // Erase from the list all the tasks already chosen
      for (var i = 0; i < $scope.chosen_tasks.length; i++){

        var found_chosen_task = false;

        for (var j = 0; (j < $scope.tasks.length && !found_chosen_task); j++){

          if ($scope.chosen_tasks[i].id == $scope.tasks[j].id){

            $scope.tasks = removeByAttr($scope.tasks, 'id', $scope.chosen_tasks[i].id);
            found_chosen_task = true;
          }
        }

        // If we don't found the chosen task on the DB tasks, erase it.
        if (!found_chosen_task){

          console.log('Erasing: ' + $scope.chosen_tasks[i]);

          $scope.chosen_tasks.splice(i, 1);

          if (appMode.getMode() == 'default'){
            $scope.updateStorageChosenTasks();
          }
        }
      }

      $scope.tasks_select = {index: 0};
  }

  $scope.addChosenTask = function () {

    var new_chosen_task = $scope.tasks[$scope.tasks_select.index];
    $scope.chosen_tasks.push( new_chosen_task );
    $scope.tasks = removeByAttr($scope.tasks, 'id', new_chosen_task.id);
    $scope.tasks_select = {};
    $scope.tasks_select.index = 0;

    if (appMode.getMode() == 'default'){
      $scope.updateStorageChosenTasks();
    }
  }

  $scope.removeChosenTask = function(chosen_task) {

      for(i = 0; i < $scope.chosen_tasks.length; i++) {

        if($scope.chosen_tasks[i] == chosen_task){
          $scope.chosen_tasks.splice(i, 1);

          if (appMode.getMode() == 'default'){
            $scope.updateStorageChosenTasks();
          }

          $scope.tasks.push(chosen_task);
          //We re-assign the first on the list as the default option
          $scope.tasks_select = {};
          $scope.tasks_select.index = 0;
        }
      }

      event.stopPropagation();
  }


  /* Edits the task*/
  $scope.editTask = function (chosen_task) {

    taskDraft.setTask(chosen_task);
    appMode.setMode('taskDraft');
    console.log(appMode.getMode());
    $state.go('menu.newTask');
  }

  $scope.updateStorageChosenTasks = function () {

    localStorageService.set( 'chosen_tasks', $scope.chosen_tasks );
  }

  $scope.applyChanges = function () {

    if ( appMode.getMode() == 'participantDraft' || appMode.getMode() == 'participantEdit' ){

      //Update the participant draft
      $scope.participant = participantDraft.getParticipant();
      $scope.participant.forbidden_tasks = $scope.chosen_tasks;
      participantDraft.setParticipant($scope.participant);

      $state.go('menu.newParticipant');
    }
  }

  $scope.showToast = function(message, duration, location) {
        $cordovaToast.show(message, duration, location).then(function(success) {
            console.log("The toast was shown");
        }, function (error) {
            console.log("The toast was not shown due to " + error);
        });
    }

})

.controller('newParticipantCtrl', function(
  $scope, $state, $cordovaToast, $http, localStorageService, participantDraft, appMode) {

  $scope.$on('$ionicView.enter', function () {

    url = localStorageService.get('url');

    $scope.appMode = appMode.getMode();
    if ($scope.appMode == 'participantDraft') {

      $scope.view_title = 'New Participant';
      $scope.participant = participantDraft.getParticipant();

    }else if ($scope.appMode == 'participantEdit') {

      $scope.view_title = 'Editing Participant';
      $scope.participant = participantDraft.getParticipant();

    }else{

      $scope.view_title = 'New Participant';

      $scope.participant = {
          name: '',
          forbidden_tasks: [],
          available_schedule: [
              {morning: true, afternoon: true},
              {morning: true, afternoon: true},
              {morning: true, afternoon: true},
              {morning: true, afternoon: true},
              {morning: true, afternoon: true},
              {morning: true, afternoon: true},
              {morning: true, afternoon: true}
          ]
      };
    }
  });

  $scope.goToTasks = function () {

    participantDraft.setParticipant($scope.participant);

    if ($scope.appMode != 'participantEdit'){
      appMode.setMode('participantDraft');
    }
    $state.go('menu.manageTasks');
  }

  $scope.goToSchedule = function () {

    participantDraft.setParticipant($scope.participant);

    if ($scope.appMode != 'participantEdit'){
      appMode.setMode('participantDraft');
    }
    $state.go('menu.availableSchedule');
  }

  $scope.createParticipant = function () {

/*
    $scope.participant = {
        name: '',
        forbidden_tasks: [],
        available_schedule: [
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true}
        ]
    };
*/
      if ($scope.appMode == 'participantEdit'){

        var action = "/participants/edit/" + $scope.participant.id;
        post_to_DB($http, url, action, $scope.participant, on_edit_success);

      }else{

        var action = "/participants/create";
        post_to_DB($http, url, action, $scope.participant, on_create_success);
      }
  }

  var on_create_success= function(response){

    console.log(response);

    var chosen_participants = localStorageService.get('chosen_participants');

    chosen_participants.push(response);
    localStorageService.set( 'chosen_participants',  chosen_participants);

    $scope.participant = {
        name: '',
        forbidden_tasks: [],
        available_schedule: [
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true},
            {morning: true, afternoon: true}
        ]
    };

    console.log('Your new participant has been created successfully!');
    $scope.showToast('Your new participant has been created successfully!', 'short', 'bottom');
  }

  var on_edit_success= function(response){

     participantDraft.setParticipant({});
     var chosen_participants = localStorageService.get('chosen_participants');

     //We update the tasks on chosen_participants too
     var found_participant = false;
     for(var i = 0; ((i < chosen_participants.length) && !found_participant); i++){

       if (response.id == chosen_participants[i].id){

         chosen_participants[i] = response;
         found_participants = true;
       }
     }

     localStorageService.set( 'chosen_participants', chosen_participants );

     console.log('The participant has been edited successfully!');
     $scope.showToast('The participant has been edited successfully!', 'short', 'bottom');

     appMode.setMode('default');
     $state.go('menu.manageParticipants');

  }

   $scope.showToast = function(message, duration, location) {
         $cordovaToast.show(message, duration, location).then(function(success) {
             console.log("The toast was shown");
         }, function (error) {
             console.log("The toast was not shown due to " + error);
         });
     }

})



.controller('newTaskCtrl', function($scope, $state, $cordovaToast, $http, localStorageService, appMode, taskDraft) {

  $scope.frequencies = [
    {name : "Once a week"},
    {name : "Once a day"},
    {name : "Twice a day"}
  ];

  $scope.$on('$ionicView.enter', function () {

    $scope.appMode = appMode.getMode();

    url = localStorageService.get('url');

    if ( $scope.appMode == 'taskDraft'){

      $scope.view_title = 'Edit Task';
      $scope.task = taskDraft.getTask();

      $scope.default_selected = {
          isPresent : true,
          selectedFrequency : {name : $scope.task.frequency} // <-- this is the default item
        };

    }else{

      $scope.view_title = 'New Task';

      //initialize the task scope with empty object
      $scope.task = {};

      $scope.default_selected = {
          isPresent : true,
          selectedFrequency : {name : "Once a day"} // <-- this is the default item
        };

      $scope.task.difficulty = 5;
    }
  });

  $scope.createTask = function () {

      $scope.task.frequency = $scope.default_selected.selectedFrequency.name;

      if ($scope.appMode == 'taskDraft'){

        var action = "/tasks/edit/" + $scope.task.id;
        post_to_DB($http, url, action, $scope.task, on_edit_success);

      }else{
        var action = "/tasks/create";
        post_to_DB($http, url, action, $scope.task, on_create_success);
      }
  }

  var on_create_success= function(response){

    var chosen_tasks = localStorageService.get('chosen_tasks');

    chosen_tasks.push(response);
    localStorageService.set( 'chosen_tasks',  chosen_tasks);

    $scope.tasks = [];
    $scope.task = {};
    $scope.task.difficulty = 5;
    $scope.default_selected = {
        isPresent : true,
        selectedFrequency : {name : "Once a day"} // <-- this is the default item
      };

    console.log('Your new task has been created successfully!');
    $scope.showToast('Your new task has been created successfully!', 'short', 'bottom');
  }

  var on_edit_success= function(response){

     taskDraft.setTask({});
     var chosen_tasks = localStorageService.get('chosen_tasks');

     //We update the tasks on chosen_tasks too
     var found_task = false;
     for(var i = 0; ((i < chosen_tasks.length) && !found_task); i++){

       if (response.id == chosen_tasks[i].id){

         chosen_tasks[i] = response;
         found_task = true;
       }
     }

     localStorageService.set( 'chosen_tasks', chosen_tasks );

     appMode.setMode('default');
     $state.go('menu.manageTasks');

     console.log('The task has been edited successfully!');
     $scope.showToast('The task has been edited successfully!', 'short', 'bottom');
  }

  $scope.showToast = function(message, duration, location) {
        $cordovaToast.show(message, duration, location).then(function(success) {
            console.log("The toast was shown");
        }, function (error) {
            console.log("The toast was not shown due to " + error);
        });
    }

})

.controller('myAccountCtrl', function($scope, $state, $ionicPopup, $timeout, $http, $cordovaToast, logged_user, localStorageService ) {

  $scope.$on('$ionicView.enter', function () {

    $scope.user = logged_user.getUser();
    $scope.data = {url: localStorageService.get('url'), password_old : '', password_new : ''}

  });

  $scope.showConfirm = function() {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Deleting all the data',
     template: 'Are you sure you want to delete all participants and tasks from the external Database?',
     //cancelText: 'Cancel',
     okText: 'Delete all',
     okType: 'button-assertive'
   });

   confirmPopup.then(function(res) {
     if(res) {
       console.log('');
       $scope.clearAllData();

     }
   });
  };

  // Clear all the data stored in the localStorageService
  $scope.clearAllData = function () {

    var action = "/delete-users-participants-tasks"

    $http({
             method  : 'POST',
             url     : ('http://' + $scope.data.url + action),
             headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
          }).
          success(function(response){
            console.log('All the records on the Database have been erased!');
            $scope.showToast('All the records on the Database have been erased!', 'short', 'bottom');

          }).
          error(function(response){
             console.log(response);
             alert("Error: DB couldn't be erased");
    });

    localStorageService.clearAll();
    logged_user.setUser({});
    localStorageService.set('chosen_tasks', []);
    localStorageService.set('chosen_participants', []);

    $state.go('login');
  }

  $scope.applyChanges = function () {

    //console.log($scope.data.url + ' ?= ' + url.getUrl());
    //console.log($scope.data.password_old + ' ?= ' + $scope.data.password_new);

    if ($scope.data.url != localStorageService.get('url')){

      localStorageService.set('url', $scope.data.url);
      console.log('Url updated!');
      $scope.showToast('Url updated!', 'short', 'bottom');

    }

    if (($scope.data.password_old != '') && ($scope.data.password_new != '')){

      if ($scope.data.password_old != $scope.data.password_new){

        var action = '/users/edit/' + $scope.user.id;

        var user_aux = $scope.user;
        user_aux.password = $scope.data.password_new;

        post_to_DB($http, $scope.data.url, action, user_aux, $scope.on_edit_success);

      }else{

        console.log("Old password and new password are the same");
        $scope.showToast("Old password and new password are the same", 'short', 'bottom');
      }
    }

  }

  $scope.on_edit_success = function() {

    console.log("Password changed!");
    $scope.showToast("Password changed!", 'short', 'bottom');
  }

  $scope.showToast = function(message, duration, location) {
    $cordovaToast.show(message, duration, location).then(function(success) {
        console.log("The toast was shown");
    }, function (error) {
        console.log("The toast was not shown due to " + error);
    });
  }

})

//Removes a item with a atribute 'attr' with a 'value' in an array 'arr'
var removeByAttr = function(arr, attr, value){
  var i = arr.length;
  while(i--){
     if( arr[i]
         && arr[i].hasOwnProperty(attr)
         && (arguments.length > 2 && arr[i][attr] === value ) ){

         arr.splice(i,1);
     }
  }
  return arr;
}

function post_to_DB($http, url, action, params, success){

  //console.log(decodeURIComponent(jQuery.param(params)));

  $http({
           method  : 'POST',
           url     : ('http://' + url + action),
           data    : jQuery.param(/*http_params*/params),  // pass in data as strings
           headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
        }).
        success(function(response){

          success(response);

        }).
        error(function(response){
           console.log(response);
           alert('Error while connecting to Database. Try again in a few seconds.');
  });
}

//Not working
/*
function softkeyboard_addapter(){

  window.addEventListener('native.keyboardshow', function(){
      //document.getElementById("wolf-img").classList.add('keyboard-open');
      //document.getElementById("wolf-img").classList.add('wolf-hide');
      document.getElementById("wolf-img").style.display = "none";
      console.log('keyboard appears!!');
    });

  window.addEventListener('native.keyboardhide', function(){
      //document.getElementById("wolf-img").classList.add('keyboard-open');
      //document.getElementById("wolf-img").classList.remove('wolf-hide');
      document.getElementById("wolf-img").style.display = "block";
      console.log('keyboard disappears!!');
    });
}
*/
