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

  it('should validate that a game must have 3 players', function (done) {
    new Game({ players: [{ username: 'john doe'}] }).save(function (err) {
      catching(done, function () {
        expect(err).to.have.deep.property('errors.players.message',
                                          'O jogo deve conter 2 jogadores');
      });
    });
  });
});
