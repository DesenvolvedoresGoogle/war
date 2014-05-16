'use strict';

var GamesController = require('../../app/controllers/games');

describe('GamesController', function () {
  context('#index', function () {
    it('should list all games', function (done) {
      GamesController.index(null, { json: function (res) {
        res.should.deep.equal(GamesController._waiting);
        done();
      }});
    });
  });

  context('#create', function () {
    it('should create a new game', function (done) {
      var length = GamesController._games.length;

      GamesController.create(['Tadeu', 'Bernardo'],
        function (res) {
          catching(done, function () {
            GamesController._games.length.should.be.equal(length + 1);
          });
        });
    });

    it('should validate presence of 2 names', function (done) {
      GamesController.create({
        body: {
          players: ['Tadeu']
        }
      }, {
        json: function (status, msg) {
          status.should.equal(422);
          done();
        }
      });
    });

    it('should remove the players from the waiting list', function (done) {
      GamesController._waiting = ['Tadeu', 'Bernardo'];
      GamesController.create({
        body: {
          players: ['Tadeu', 'Bernardo']
        }
      }, {
        json: function () {
          GamesController._waiting.should.be.empty;
          done();
        }
      });
    });
  });
  
  context('#waiting', function () {
    it('should add player to the waiting list', function () {
      var player = 'player' + Math.random();
      GamesController.waiting({
        body: {
          player: player
        }
      }, {
        json: function () {
          GamesController._waiting.should.contain(player);
        }
      })
    });

    it('should validate presence of player', function () {
      GamesController.waiting({
        body: {
          player: ''
        }
      }, {
        json: function (status, res) {
          status.should.equal(422);
        }
      })
    });
  });
});
