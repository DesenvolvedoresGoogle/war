'use strict';

var Game = require('../../app/models/game');

describe('Game', function () {
  it('should validate presence of players', function (done) {
    new Game().save(function (err) {
      catching(done, function () {
        expect(err.errors).to.have.key('players');
      });
    });
  });
});
