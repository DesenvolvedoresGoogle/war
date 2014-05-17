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
        games[gameId].players.filter(function (p) {
          return p !== socket.player;
        }).forEach(function (player) {
          playing[player.username].emit('win-wo');
        });
        
        games[gameId].players.forEach(function (p) {
          delete playing[p.username];
        });
        delete games[gameId];
      }
      update();
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
        playing[username].player = username;
        delete waiting[username];

        return player;
      });

      var game = {
        id: games.length,
        players: players
      };

      games.push(game);

      game.players.forEach(function (player) {
        playing[player.username].gameId = game.id;
        playing[player.username].emit('created-game', game);
        playing[player.username].emit('play', players[index++ % 2].username);
      });

    });
  });

  socket.on('next', function (gameId) {
    var player = games[gameId].players[index++ % 2];
    console.log(player.username);
    playing[player.username].emit('play');
  });
});
