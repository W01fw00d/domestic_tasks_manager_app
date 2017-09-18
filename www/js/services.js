angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('BlankService', [function(){

}])

.service('logged_user', function() {

  var user = {};

  var setUser = function(newUser) {
      user = newUser;
  };

  var getUser = function() {
      return user;
  };

  return {
    setUser: setUser,
    getUser: getUser
  };

})


.service('appMode', function() {

  /*Current mode of the app. Can be:
  - 'taskDraft' (a task is in process of being created)
  - 'taskEdit' (a task is in process of being edited)
  - 'participantDraft' (a participant is in process of being created)
  - 'participantEdit' (a participant is in process of being edited)
  - 'default' (default state)

  */
  var mode = '';

  var setMode = function(newMode) {
      mode = newMode;
  };

  var getMode = function() {
      return mode;
  };

  return {
    setMode: setMode,
    getMode: getMode
  };

})

.service('taskDraft', function() {

  var task = {};

  var setTask = function(newTask) {
      task = newTask;
  };

  var getTask = function() {
      return task;
  };

  return {
    setTask: setTask,
    getTask: getTask
  };

})

.service('participantDraft', function() {

  var participant = {};

  var setParticipant = function(newParticipant) {
      participant = newParticipant;
  };

  var getParticipant = function() {
      return participant;
  };

  return {
    setParticipant: setParticipant,
    getParticipant: getParticipant
  };

})


/*
.service('url', function() {

  var url = "http://192.168.1.107:8000";
  //var url = "http://localhost:8000";

  var setUrl = function(newUrl) {
      url = newUrl;
  };

  var getUrl = function() {
      return url;
  };

  return {
    setUrl: setUrl,
    getUrl: getUrl
  };

});
*/
