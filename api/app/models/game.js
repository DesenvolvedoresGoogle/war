'use strict';

var mongoose = require('mongoose');
var User = require('./user');

try {
  module.exports = mongoose.model('Game');
  return;
} catch (err) {}

var GameSchema = {
  players: { type: [User.schema], required: true }
};

var Game = mongoose.model('Game', GameSchema);

Game.schema.path('players').validate(function (value) {
  return value.length === 2;
}, 'O jogo deve conter 2 jogadores');

module.exports = Game;
