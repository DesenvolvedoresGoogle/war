'use strict';

var User = require('../../app/models/user');

describe('User', function () {
  it('should validate presence of username', function (done) {
    new User({}).save(function (err) {
      catching(done, function () {
        expect(err.errors).to.have.key('username');
      });
    });
  });
});
