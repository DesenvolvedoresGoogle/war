'use strict';

var State = require('./models/state');
var _ = require('lodash');

var Shared;

var Dispatcher = function (socket, s) {
  Shared = s;
  this.socket = socket;
  this.socket.emit('games', Object.keys(Shared.waiting));

  _.bindAll(this);
};

Dispatcher.prototype.games = function () {
  this.socket.broadcast.emit('games', Object.keys(Shared.waiting));
};

Dispatcher.prototype.newGame = function (username) {
  if (username) {
    Shared.waiting[username] = this.socket;
    this.socket.player = username;
    this.games();
  }
};

Dispatcher.prototype.joinGame = function (players) {
  State.allRandom(function (states) {
    var that = this;
    players = players.reduce(function (obj, username) {
      var player = {
        username: username,
        states: states.splice(0, 13),
      };

      Shared.playing[username] = Shared.waiting[username] || that.socket;
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

    this.next(game.id);
  }, this);
};

Dispatcher.prototype.next = function (gameId) {
  var username = _.values(Shared.games[gameId].players)[Shared.index];
  Shared.index = Shared.index ? 0 : 1;
  Shared.playing[username].emit('play');
};

Dispatcher.prototype.disconnect = function () {
  if (this.socket.player) {
    if (Shared.waiting[this.socket.player]) {
      delete Shared.waiting[this.socket.player];
    } else if (Shared.playing[this.socket.player]) {
      var gameId = Shared.playing[this.socket.player].gameId;
      var game = Shared.games[gameId];

      var that = this;
      Object.keys(game.players).filter(function (p) {
        return p !== that.socket.player;
      }).forEach(function (username) {
        Shared.playing[username].emit('win-wo');
      });
      
      Object.keys(game.players).forEach(function (p) {
        delete Shared.playing[p];
      });

      delete Shared.games[gameId];
    }
    this.games();
  }
};

Dispatcher.prototype.notifyAllPlayers = function (event) {
  this.socket.on(event, function (data) {
    var game = Shared.games[data.gameId];
    for (var username in game.players) {
      Shared.playing[username].emit(event, data);
    }
  });
};

module.exports = Dispatcher;
