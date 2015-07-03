angular.module('tossIt', ['ionic', 'tossIt.config'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    abstract: true,
    templateUrl: "templates/home.html",
    controller: 'AppCtrl'
  })
  .state('default', {
    url: "/default",
    templateUrl: "templates/default.html"
  })
  .state('create', {
    url: "/create",
    templateUrl: "templates/create.html",
    controller: 'CreateCtr'
  })
  .state('join', {
    url: "/join/:id",
    templateUrl: "templates/join.html",
    controller: 'JoinCtr'
  });

  $urlRouterProvider.otherwise('/default');
});
