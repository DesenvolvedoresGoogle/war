'use strict';

var State = require('../models/state');


var GamesController = {
  _waiting: [],
  _games: [],
  index: function (req, res) {
    res.json(GamesController._waiting);
  },
  create: function (req, res) {
    State.find({}, function (err, states) {
      // Knuth shuffle
      for (var i = 0, l = states.length; i < l; i++) {
        var j = i + Math.floor(Math.random() * (l - i));
        var aux = states[i];
        states[i] = states[j];
        states[j] = aux;
      }

      GamesController._waiting = GamesController._waiting.filter(function (username) {
        return !~req.body.players.indexOf(username);
      });

      var players = req.body.players.map(function (username) {
        return { username: username, states: states.splice(0, 13) };
      });

      var game = { id: GamesController._games.length, players: players };
      GamesController._games.push(game);

      res.json({ message: 'Game created!' , game: game });
    });
  },
  waiting: function (req, res) {
    var player = req && req.body && req.body.player;

    if (player) {
      GamesController._waiting.push(req.body.player);
      res.json({ message: 'Player added to the waiting list' });
    } else {
      res.json(422, { message: 'Requisição inválida' });
    }
  }
};

module.exports = GamesController;
