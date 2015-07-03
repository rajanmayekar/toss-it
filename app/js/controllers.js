angular.module('tossIt')
.controller('AppCtrl', function($scope, $ionicModal, $state, $timeout) {
    // Don't do any thing for now.
})
.controller('CreateCtr', function($scope, $ionicModal, $state, $timeout, SERVER_URL) {
    var socket,

        setupSocket = function () {
            socket = io.connect(SERVER_URL);

            socket.on('connect', function () {
                socket.emit('createGameS', $scope.game.nicename, $scope.game.gameId);
            });

            socket.on('gameConnectedC', function (gameId) {
                $scope.$apply( function() {
                    $scope.game.gameId = gameId;
                    $scope.$broadcast('gameCreated', $scope.game);
                });
            });

            socket.on('joinedGameC', function (niceName) {
                $scope.$apply( function() {
                    $scope.participantStatus = niceName + ' has joined a game.';
                    $scope.game.participant = niceName;

                    $scope.$broadcast('askForToss', $scope.game);
                });
            });

            socket.on('tossStartedC', function (niceName) {
                $scope.$apply( function() {
                   $scope.$broadcast('statTossSelection', $scope.game);
                });
            });

            socket.on('tossSelectedC', function (toss, tossLuck, userLost, userWon) {
                var result = false;
                if (userWon === $scope.game.nicename) {
                    result = true;
                }

                $scope.gameDone = true;
                $scope.$apply( function() {
                   $scope.$broadcast('showTossResult', toss, tossLuck, result);
                });
            });

            socket.on('participantDisconnectedC', function () {
                $scope.$apply( function() {
                    $scope.participantStatus = 'Participant disconnected! please wait to join a game.';
                    $scope.gameActive = false;
                });
            });

        };

    $scope.participantStatus = 'Please set up a toss!';
    $scope.gameActive = true;
    $scope.isAuthor = true;
    $scope.gameDone = false;
    $scope.game = {
        'nicename' : '',
        'joinUrl' : '',
        'gameId' : 1,
        'participant' : ''
    };

    $scope.setup = function () {
        setupSocket();
        $scope.participantStatus = 'Waiting for another articipant to join!';
    };

    $scope.$on('tossTossed', function () {
        console.log("tossTossed");
        socket.emit('tossStartedS');
    });
})

.controller('JoinCtr', function($scope, $ionicModal, $stateParams, SERVER_URL, $timeout) {
    var socket,

        init = function () {
            socket = io.connect(SERVER_URL);;

            socket.on('connect', function () {
                console.log("$stateParams.id)", $stateParams.id);
                socket.emit('checkGameS', $stateParams.id);
            });

            socket.on('checkGameC', function (gameDetails) {
               // socket.emit('checkGameS', $stateParams.id);
               $scope.$apply(function () {
                    $scope.game.gameId = $stateParams.id;
                    $scope.game.author = gameDetails['1'].author;
                    $scope.participantStatus = "You are joing a toss created by " + $scope.game.author;

                    $scope.$broadcast('joinStart', $scope.game);
                });
            });
        },

        setupSocket = function () {
            console.log("$scope.game", $scope.game);
            socket.emit('joinGameS', $scope.game.nicename, $scope.game.gameId);

            socket.on('gameConnectedC', function (gameId) {
                $scope.$apply( function() {
                    $scope.participantStatus = "You have joined a toss created by " + $scope.game.author;
                    $scope.$broadcast('gameJoined');
                });
            });

            socket.on('tossStartedC', function (niceName) {
                $scope.$apply( function() {
                   $scope.$broadcast('statTossSelection', $scope.game);
                });
            });

            socket.on('tossSelectedC', function (toss, tossLuck, userLost, userWon) {
                var result = false;

                if (userWon === $scope.game.nicename) {
                    result = true;
                }

                $scope.gameDone = true;
                $scope.$apply( function() {
                   $scope.$broadcast('showTossResult', toss, tossLuck, result);
                });
            });

            socket.on('authorDisconnectedC', function () {
                $scope.$apply( function() {
                    $scope.participantStatus = "Game author disconnected!";
                    $scope.errorStatus = 'Game author disconnected! please try after some time.';
                    $scope.gameActive = false;
                });
            });
        };

    $scope.participantStatus = "Join a toss!";

    $scope.gameActive = true;
    $scope.gameDone = false;
    $scope.game = {
        'nicename' : '',
        'gameId' : null,
        'author' : ''
    };

    $scope.setup = function () {
        setupSocket();
    };

    $scope.$on('tossDone', function (topic, toss) {
         console.log("tossSelectedSaaaa", toss);
        socket.emit('tossSelectedS', toss);
    })

    init();
});
