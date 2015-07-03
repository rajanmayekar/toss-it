angular.module('tossIt')
	.directive('toss', function ($timeout) {
		return {
			restrict : 'E',
			replace: true,
			templateUrl : 'templates/toss-directive.html',
			link : function (scope, element) {
				var selectedToss,
					flip = ['heads', 'tails'],
					imageEle = element.find('.image'),
					flipButton = element.find('.button-flip'),
					tossHeading = element.find('.toss-heading'),
					tossHeadingInfo = element.find('.toss-heading-info'),
					tossBtnWrapper = element.find('.button-toss-wrapper'),

					resetGame = function () {
						selectedToss = false;
						tossBtnWrapper.find('.button-toss').removeClass('active');

						tossHeading.text('HEADS OR TAILS?');
						tossHeadingInfo.text('');
					},

					selectRandom = function () {
						return flip[Math.floor(Math.random()*flip.length)];
					};

				scope.startToss = function () {
					resetGame();

					flipButton.hide();
					tossBtnWrapper.show().addClass('toss-active');
					imageEle.addClass('animated flip');

				}

				scope.stopToss = function () {
					var side = selectRandom();

					tossHeading.text('It\'s a ' + side.toUpperCase());
					imageEle.removeClass('animated').removeClass('flip');

					if (side !== selectedToss) {
						tossHeadingInfo.text('Sorry! you lost the toss.');
					} else {
						tossHeadingInfo.text('Hurray! You won the toss.');
					}


					$timeout(function () {
						flipButton.find('.button-text').text('TRY AGAIN');
						flipButton.show();
					}, 2000);
				}

				scope.setToss = function (toss) {
					if (!selectedToss) {
						selectedToss = toss;
						tossBtnWrapper.find('.button-toss-' + toss).addClass('active');
						tossBtnWrapper.show().removeClass('toss-active');

						

						$timeout(function () {
							scope.stopToss();
						}, 1000);	
					}
				}
			}
		};

	});