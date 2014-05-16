'use strict';

var Game = require('../models/game');
var GamesController = {
  index: function (req, res) {
    Game.find({}, function (err, results) {
      if (err) {
        console.err(err.message, err.stack);
        res.json(500, { message: 'Internal server error' });
      } else {
        res.json(results);
      }
    });
  },
  create: function (req, res) {
    new Game(req.body).save(function (err) {
      if (err) {
        console.err(err.message, err.stack);
        res.json(422);
      } else {
        res.json({ message: 'Game created!' });
      }
    });
  }
};

module.exports = GamesController;
