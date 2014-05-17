'use strict';

var mongoose = require('mongoose');
var GamesController = require('./app/controllers/games.js');
var io = require('socket.io').listen(3000, '0.0.0.0');
var State = require('./app/models/state');

mongoose.connect('mongodb://localhost/hackathon-war-dev');

var waiting = {};
var games = [];
var playing = {};
var index = 0;

io.set('log level', 1);
io.on('connection', function(socket){
  socket.emit('games', Object.keys(waiting));

  function update() {
    socket.broadcast.emit('games', Object.keys(waiting));
  }

  socket.on('new-game', function (player) {
    if (player) {
      waiting[player] = socket;
      socket.player = player;
      update();
    }
  });

  socket.on('disconnect', function () {
    if (socket.player) {
      if (waiting[socket.player]) {
        delete waiting[socket.player];
      } else if (playing[socket.player]) {
        var gameId = playing[socket.player].gameId;
        var game = games[gameId];

        Object.keys(game.players).filter(function (p) {
          return p !== socket.player;
        }).forEach(function (username) {
          playing[username].emit('win-wo');
        });
        
        Object.keys(game.players).forEach(function (p) {
          delete playing[p];
        });

        delete games[gameId];
      }
      update();
    }
  });

  socket.on('join-game', function (players) {
    State.allRandom(function (states) {
      players = players.reduce(function (obj, username) {
        var player = {
          username: username,
          states: states.splice(0, 13),
        };

        playing[username] = waiting[username] || socket;
        playing[username].player = username;
        delete waiting[username];

        obj[username] = player;

        return obj;
      }, {});

      var game = {
        id: games.length,
        players: players
      };

      games.push(game);

      Object.keys(game.players).forEach(function (username) {
        playing[username].gameId = game.id;
        playing[username].emit('created-game', game);
      });

      next(game.id);
    });
  });

  socket.on('add-marker', function (marker) {
    var game = games[marker.gameId];
    for (var username in game.players) {
      playing[username].emit('add-marker', marker);
    }
  });

  socket.on('remove-markers', function (target) {
    var game = games[target.gameId];
    for (var username in game.players) {
      playing[username].emit('remove-markers', target);
    }
  });

  socket.on('change-state-owner', function (data) {
    var game = games[data.gameId];
    for (var username in game.players) {
      playing[username].emit('remove-markers', data);
    }
  });

  function next(gameId) {
    var username = Object.keys(games[gameId].players)[index++ % 2];
    playing[username].emit('play');
  }
  socket.on('next', next);
});
