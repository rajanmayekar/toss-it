var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

server.listen(3002, function () {
  console.log('Started service at ', 3002);
});

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});


var activeGameDetails = {},
	flip = ['heads', 'tails'],
	selectRandom = function () {
		return flip[Math.floor(Math.random()*flip.length)];
	},
	isValidGame = function (socket) {
		if (!socket || !socket.gameId || !socket.niceName) {
			return false;
		}

		if (!activeGameDetails[socket.gameId]) {
			return false;
		}

		return true;
	},

	logMessage = function (message, type) {
		console.log(type || 'status',  ': ' + message);
	};


io.sockets.on('connection', function (socket) {
	logMessage('New connection.');

	// when the client emits 'adduser', this listens and executes
	socket.on('checkGameS', function(gameId) {
		if (!gameId || !activeGameDetails[gameId]) {
			socket.emit('serverErrorC', 'Invalid game');
			// TODO
			logMessage('checkGameS: Invalid game', 'error');
			return;
		}


		socket.emit('checkGameC', activeGameDetails);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('createGameS', function(niceName, gameId) {
		if (!niceName || !gameId) {
			socket.emit('serverErrorC', 'Invalid game or nicename');
			// TODO
			logMessage('createGameS: Invalid game or nicename', 'error');
			return;
		}

		console.log("createGameS gameID", gameId);
		console.log("createGameS nicname", niceName);

		if (!activeGameDetails[gameId]) {
			activeGameDetails[gameId] = {
				users : []
			};
		}

		if (activeGameDetails[gameId].users.indexOf(niceName) === -1) {
			activeGameDetails[gameId].users.push(niceName);
			activeGameDetails[gameId].author = niceName;
		} else {
			// @TODO : Send error.
			logMessage('createGameS: User ' + niceName + ' already in game ' + gameId, 'error');
			return;
		}

		socket.isAuthor = true;
		socket.niceName = niceName;
		socket.gameId = gameId;

		socket.join(gameId);

		socket.emit('gameConnectedC', gameId, activeGameDetails[gameId].author);
		logMessage('Game created ID: ' + gameId + ' Nicename: ' + niceName);
	});

	socket.on('joinGameS', function (niceName, gameId) {
		if (!niceName || !gameId) {
			socket.emit('serverErrorC', 'Invalid game or nicename');
			// TODO
			logMessage('Invalid game or nicename', 'error');
			return;
		}

		if (!activeGameDetails[gameId]) {
			// @TODO : Send error.
			logMessage('joinGameS: Game not found in activeGameDetails ' + gameId, 'error');
			return;
		}

		console.log("joinGameS gameID", gameId);
		console.log("joinGameS nicname", niceName);
		if (activeGameDetails[gameId].users.indexOf(niceName) === -1) {
			activeGameDetails[gameId].users.push(niceName);
		} else {
			// @TODO : Send error.
			logMessage('joinGameS: User ' + niceName + ' already in game ' + gameId, 'error');
			return;
		}

		socket.isAuthor = false;
		socket.niceName = niceName;
		socket.gameId = gameId;

		socket.join(gameId);

		socket.emit('gameConnectedC', gameId, activeGameDetails[gameId].author);

		io.sockets.in(gameId).emit('joinedGameC', niceName);
		logMessage('Joined game ID: ' + gameId + ' Nicename: ' + niceName);
	});

	socket.on('tossStartedS', function() {
		if (!isValidGame(socket)) {
			socket.emit('serverErrorC', 'Invalid game or nicename');
			// TODO

			logMessage('tossStartedS: Invalid game', 'error');
			return;
		};

		io.sockets.in(socket.gameId).emit('tossStartedC', socket.niceName);
		logMessage('Toss stared game ID: ' + socket.gameId + ' Nicename: ' + socket.niceName);
	});

	socket.on('tossSelectedS', function(toss) {
		if (!isValidGame(socket)) {
			socket.emit('serverErrorC', 'Invalid game or nicename');
			// TODO

			logMessage('tossSelectedS: Invalid game', 'error');
			return;
		};

		var tossLuck = selectRandom(),
			userLost,
			userWon;

		if (tossLuck !== toss) {
			userLost = socket.niceName;
			userWon = activeGameDetails[socket.gameId].author;
		} else {
			userLost = activeGameDetails[socket.gameId].author;
			userWon = socket.niceName;
		}

		io.sockets.in(socket.gameId).emit('tossSelectedC', toss, tossLuck, userLost, userWon);
		logMessage('Toss selected game ID: ' + socket.gameId + ' Nicename: ' + socket.niceName + ' Toss: ' + toss);
	});

	socket.on('disconnect', function() {
		var leaveGame = function () {
			socket.leave(socket.gameId);

			if (isValidGame(socket) &&
				activeGameDetails[socket.gameId].users &&
				activeGameDetails[socket.gameId].users.indexOf(socket.niceName) !== -1) {
				activeGameDetails[socket.gameId].users.splice(activeGameDetails[socket.gameId].users, 1);
			}
		};

		if (isValidGame(socket)) {
			leaveGame();

			if (socket.isAuthor) {
				delete activeGameDetails[socket.gameId];

				io.sockets.in(socket.gameId).emit('authorDisconnectedC', socket.niceName);
			} else {
				io.sockets.in(socket.gameId).emit('participantDisconnectedC', socket.niceName);
			}
		} else if (socket.gameId) {
			leaveGame();
		}

		logMessage('Dissconnected game ID: ' + (socket.gameId || null) + ' Nicename: ' + (socket.niceName || null));
	});
});
