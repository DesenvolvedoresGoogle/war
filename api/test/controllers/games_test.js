'use strict';

var GamesController = require('../../app/controllers/games');
GamesController.socket = {};

describe('GamesController', function () {
  context('#index', function () {
    it('should list all games', function (done) {
      GamesController.socket.emit = function (evt, data) {
        data.should.deep.equal(GamesController._waiting);
        done();
      };
      GamesController.sendUpdate();
    });
  });

  context('#create', function () {
    it('should create a new game', function (done) {
      var length = GamesController._games.length;
      GamesController.socket.emit = function (evt, data) {
        if (evt === 'created-game') {
          GamesController._games.length.should.be.equal(length + 1);
          done();
        }
      };

      GamesController.create(['Tadeu', 'Bernardo']);
    });

    xit('should validate presence of 2 names', function (done) {
      var length = GamesController._games.length;
      GamesController.socket.emit = function (evt, data) {
        if (evt === 'created-game') {
          done('created anyway');
        }
      };

      GamesController.create(['Tadeu']);
    });

    it('should remove the players from the waiting list', function (done) {
      GamesController.socket.emit = function (evt, data) {
        if (evt === 'games') {
          GamesController._waiting.should.be.empty;
          done();
        }
      };

      GamesController._waiting = ['Tadeu', 'Bernardo'];
      GamesController.create(['Tadeu', 'Bernardo']);
    });
  });
  
  context('#waiting', function () {
    it('should add player to the waiting list', function () {
      var player = 'player' + Math.random();
      GamesController.socket.emit = function (evt, data) {
        GamesController._waiting.should.contain(player);
      };
      GamesController.waiting(player);
    });

    it('should validate presence of player', function () {
      var length = GamesController._waiting.length;
      GamesController.waiting('');
      GamesController._waiting.length.should.equal(length);
    });
  });
});
