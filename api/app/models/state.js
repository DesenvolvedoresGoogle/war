'use strict';

var mongoose = require('mongoose');

try {
  module.exports = mongoose.model('State');
  return;
} catch (err) {}

var StateSchema = {
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
};

var State = mongoose.model('State', StateSchema);

module.exports = State;
