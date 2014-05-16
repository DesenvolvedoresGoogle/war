'use strict';

var State = require('../models/state');


var GamesController = {
  _waiting: [],
  _games: [],
  sendUpdate: function () {
    GamesController.socket.emit('games', GamesController._waiting);
  },
  create: function (players) {
    State.find({}, function (err, states) {
      // Knuth shuffle
      for (var i = 0, l = states.length; i < l; i++) {
        var j = i + Math.floor(Math.random() * (l - i));
        var aux = states[i];
        states[i] = states[j];
        states[j] = aux;
      }

      GamesController._waiting = GamesController._waiting.filter(function (username) {
        return !~players.indexOf(username);
      });
      GamesController.sendUpdate();

      var players = players.map(function (username) {
        return { username: username, states: states.splice(0, 13) };
      });

      var game = { id: GamesController._games.length, players: players };
      GamesController._games.push(game);
    });
  },
  waiting: function (player) {
    if (player) {
      GamesController._waiting.push(player);
      GamesController.sendUpdate();
    }
  }
};

module.exports = GamesController;
