'use strict';

var mongoose = require('mongoose');

try {
  module.exports = mongoose.model('User');
  return;
} catch (err) {}

var State = require('../../app/models/state');

var UserSchema = {
  username: { type: String, required: true },
  states: { type: [State.schema], required: true }
};

var User = mongoose.model('User', UserSchema);

module.exports = User;
