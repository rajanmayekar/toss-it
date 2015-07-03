angular.module('tossIt')
	.directive('tossMultiplayerOwner', function ($timeout) {
		return {
			restrict : 'E',
			replace: true,
			templateUrl : 'templates/toss-multiplayer-directive.html',
			link : function (scope, element) {
				var gameDetails,
					selectedToss,
					chooseToss = false,
					flip = ['heads', 'tails'],
					imageEle = element.find('.image'),
					flipButton = element.find('.button-flip'),
					tossHeading = element.find('.toss-heading'),
					tossBtnWrapper = element.find('.button-toss-wrapper'),

					resetGame = function () {
						selectedToss = false;
						tossBtnWrapper.find('.button-toss').removeClass('active');

						// scope.tossHeading = 'HEADS OR TAILS?';
						// scope.tossHeadingInfo = '';
					},

					selectRandom = function () {
						return flip[Math.floor(Math.random()*flip.length)];
					};

				scope.tossHeading = 'Set your nicename';

				scope.startToss = function () {
					resetGame();

					flipButton.hide();
					tossBtnWrapper.show().addClass('toss-active');
					imageEle.addClass('animated flip');

					scope.$emit('tossTossed');
				}

				scope.stopToss = function (toss, tossLuck, result) {
					scope.tossHeading = 'It\'s a ' + tossLuck.toUpperCase();
					imageEle.removeClass('animated').removeClass('flip');
					tossBtnWrapper.find('.button-toss-' + toss).addClass('active');

					if (!result) {
						scope.tossHeadingInfo = 'Sorry! you lost the toss.';
					} else {
						scope.tossHeadingInfo = 'Hurray! You won the toss.';
					}

					if (selectedToss && toss === 'heads') {
						scope.headsUser = 'You';
						scope.tailsUser = gameDetails.participant;
					} else {
						scope.tailsUser = 'You';
						scope.headsUser = gameDetails.participant;
					}

					$timeout(function () {
						flipButton.find('.button-text').text('TRY AGAIN');
						flipButton.show();
					}, 2000);
				}

				scope.setToss = function (toss) {
					if (!selectedToss) {
						selectedToss = toss;
						tossBtnWrapper.show().removeClass('toss-active');
						
						scope.$emit('tossDone', toss);
						/*
						$timeout(function () {
							scope.stopToss();
						}, 1000);
						*/
					}
				}

				scope.setupNickName = function () {
					if (!scope.game.nicename) {
            			return alert("Please specify your nicename");
        			}

        			element.find('.toss-nickname').hide();
					scope.setup();
				}

				scope.$on('gameCreated', function (topic, gameInfo) {
					gameDetails = gameInfo;
					scope.tossHeading = 'Excellent! Share following url';
					scope.tossHeadingInfo = 'http://localhost/join/' + gameDetails.gameId;
				});

				scope.$on('statTossSelection', function (topic, gameInfo) {
					gameDetails = gameInfo;
					scope.tossHeading = 'TOSS STARTED';
					scope.tossHeadingInfo = 'Waiting for ' + gameInfo.participant + ' to choose a coin ...';
				});

				scope.$on('askForToss', function (topic, gameInfo) {
					console.log('askForToss', gameInfo);
					scope.tossHeading = 'Toss a coin';
					scope.tossHeadingInfo = gameInfo.participant + ' will choose a toss.';
					flipButton.show();

					resetGame();
				});

				scope.$on('showTossResult', function (topic, toss, tossLuck, result) {
					scope.stopToss(toss, tossLuck, result);
				});
			}
		};

	});