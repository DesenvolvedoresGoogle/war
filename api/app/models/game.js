var mongoose = require('mongoose');
var User = require('./user');

try {
  module.exports = mongoose.model('Game');
  return;
} catch (err) {}

var GameSchema = {
  users: User.schema
};

var Game = mongoose.model('Game', GameSchema);

module.exports = Game;
