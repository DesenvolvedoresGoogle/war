'use strict';

var State = require('../../app/models/state');

describe('State', function () {
  it('should validate presence of name', function (done) {
    new State().save(function (err) {
      catching(done, function () {
        expect(err).to.have.deep.property('errors.name.message');
      });
    });
  });

  it('should validate presence of lat', function (done) {
    new State().save(function (err) {
      catching(done, function () {
        expect(err).to.have.deep.property('errors.lat.message');
      });
    });
  });

  it('should validate presence of long', function (done) {
    new State().save(function (err) {
      catching(done, function () {
        expect(err).to.have.deep.property('errors.long.message');
      });
    });
  });
});
