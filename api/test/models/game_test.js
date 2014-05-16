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

  it('should validate that a game must have 2 players', function (done) {
    var game = { players: [
      { username: 'john doe',
        states: [
          { name: 'Santa Catarina', lat: 12, long: 15 }
        ]
      }
    ]};

    new Game(game).save(function (err) {
      catching(done, function () {
        expect(err).to.have.deep.property('errors.players.message',
                                          'O jogo deve conter 2 jogadores');
      });
    });
  });
});
