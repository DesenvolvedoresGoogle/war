'use strict';

var mongoose = require('mongoose');
var GamesController = require('./app/controllers/games.js');
var io = require('socket.io').listen(3000, '0.0.0.0');
var State = require('./app/models/state');

mongoose.connect('mongodb://localhost/hackathon-war-dev');

var Shared = {
  waiting: {},
  games: [],
  playing: {},
  index: 0
};

io.set('log level', 1);
io.on('connection', function(socket){
  socket.emit('games', Object.keys(Shared.waiting));

  function update() {
    socket.broadcast.emit('games', Object.keys(Shared.waiting));
  }

  socket.on('new-game', function (player) {
    if (player) {
      Shared.waiting[player] = socket;
      socket.player = player;
      update();
    }
  });

  socket.on('disconnect', function () {
    if (socket.player) {
      if (Shared.waiting[socket.player]) {
        delete Shared.waiting[socket.player];
      } else if (Shared.playing[socket.player]) {
        var gameId = Shared.playing[socket.player].gameId;
        var game = Shared.games[gameId];

        Object.keys(game.players).filter(function (p) {
          return p !== socket.player;
        }).forEach(function (username) {
          Shared.playing[username].emit('win-wo');
        });
        
        Object.keys(game.players).forEach(function (p) {
          delete Shared.playing[p];
        });

        delete Shared.games[gameId];
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

        Shared.playing[username] = Shared.waiting[username] || socket;
        Shared.playing[username].player = username;
        delete Shared.waiting[username];

        obj[username] = player;

        return obj;
      }, {});

      var game = {
        id: Shared.games.length,
        players: players
      };

      Shared.games.push(game);

      Object.keys(game.players).forEach(function (username) {
        Shared.playing[username].gameId = game.id;
        Shared.playing[username].emit('created-game', game);
      });

      next(game.id);
    });
  });

  socket.on('add-marker', function (marker) {
    var game = Shared.games[marker.gameId];
    for (var username in game.players) {
      Shared.playing[username].emit('add-marker', marker);
    }
  });

  socket.on('remove-markers', function (target) {
    var game = Shared.games[target.gameId];
    for (var username in game.players) {
      Shared.playing[username].emit('remove-markers', target);
    }
  });

  socket.on('change-state-owner', function (data) {
    var game = Shared.games[data.gameId];
    for (var username in game.players) {
      Shared.playing[username].emit('remove-markers', data);
    }
  });

  function next(gameId) {
    var username = Object.keys(Shared.games[gameId].players)[Shared.index];
    Shared.index = Shared.index++ % 2;
    Shared.playing[username].emit('play');
  }
  socket.on('next', next);
});
