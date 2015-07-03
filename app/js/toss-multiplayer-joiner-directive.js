angular.module('tossIt')
	.directive('tossMultiplayerJoiner', function ($timeout) {
		return {
			restrict : 'E',
			replace: true,
			templateUrl : 'templates/toss-multiplayer-directive.html',
			link : function (scope, element) {
				var gameDetails,
					selectedToss,
					chooseToss = true,
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

				scope.$on('gameJoined', function (topic) {
					scope.tossHeading = 'Excellent! ' + gameDetails.author + ' will toss a coin';
					scope.tossHeadingInfo = 'Waiting for coin to toss ...';
				});

				scope.$on('joinStart', function (topic, gameInfo) {
					gameDetails = gameInfo;
					scope.tossHeading = 'Set your nickname';
				});

				scope.$on('statTossSelection', function (topic, gameInfo) {
					gameDetails = gameInfo;

					if (chooseToss) {
						scope.tossHeading = 'HEADS OR TAILS ?';
						scope.tossHeadingInfo = 'Toss started, you have to select.';
						scope.startToss();

					} else {
						scope.tossHeading = 'TOSS STARTED';
						scope.tossHeadingInfo = 'Waiting for ' + gameInfo.participant + ' to choose a coin ...';
					}
				});

				scope.$on('showTossResult', function (topic, toss, tossLuck, result) {
					scope.stopToss(toss, tossLuck, result);
				});
			}
		};

	});