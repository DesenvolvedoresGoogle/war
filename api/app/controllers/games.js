'use strict';

var Game = require('../models/game');
var User = require('../models/user');
var State = require('../models/state');

var GamesController = {
  index: function (req, res) {
    Game.find({}, function (err, results) {
      if (err) {
        console.error(err.message, err.stack);
        res.json(500, { message: 'Internal server error' });
      } else {
        res.json(results);
      }
    });
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

      var players = req.body.players.map(function (username) {
        return new User({ username: username, states: states.splice(0, 13) });
      });

      new Game({ players: players }).save(function (err) {
        if (err) {
          console.error(err.message, err.stack);
          res.json(422);
        } else {
          res.json({ message: 'Game created!' , players: players });
        }
      });
    });
  }
};

module.exports = GamesController;
