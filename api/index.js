'use strict';

var mongoose = require('mongoose');
var GamesController = require('./app/controllers/games.js');
var io = require('socket.io').listen(3000, '0.0.0.0');
var State = require('./app/models/state');

mongoose.connect('mongodb://localhost/hackathon-war-dev');

var waiting = {};
var games = [];
var playing = {};

io.on('connection', function(socket){
  socket.emit('games', Object.keys(waiting));

  socket.on('new-game', function (player) {
    if (player) {
      waiting[player] = socket;
      socket.emit('games', Object.keys(waiting));
      socket.broadcast.emit('games', Object.keys(waiting));
    }
  });

  socket.on('join-game', function (players) {
    State.allRandom(function (states) {
      players = players.map(function (username) {
        var player = {
          username: username,
          states: states.splice(0, 13),
        };

        playing[username] = waiting[username] || socket;
        delete waiting[player];

        return player;
      });

      var game = {
        id: games.length,
        players: players
      };

      games.push(game);

      game.players.forEach(function (player) {
        playing[player.username].emit('created-game', game);
      });
    });
  });
});
