var mongoose = require('mongoose');

try {
  module.exports = mongoose.model('User');
  return;
} catch (err) {}

var UserSchema = {
  username: String
};

var User = mongoose.model('User', UserSchema);

module.exports = User;
