'use strict';

var mongoose = require('mongoose');

try {
  module.exports = mongoose.model('State');
  return;
} catch (err) {}

var StateSchema = {
  name: { type: String, required: true },
  acronym: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
};

var State = mongoose.model('State', StateSchema);
State.allRandom = function (cb, context) {
  State.find({}, function (err, states) {
    // Knuth shuffle
    for (var i = 0, l = states.length; i < l; i++) {
      var j = i + Math.floor(Math.random() * (l - i));
      var aux = states[i];
      states[i] = states[j];
      states[j] = aux;
    }

    cb.call(context, states);
  });
};

module.exports = State;
