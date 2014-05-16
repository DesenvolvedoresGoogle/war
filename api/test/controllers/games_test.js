'use strict';

var Game = function () {};
var GameController;
var requireSubvert = require('require-subvert')(__dirname);

describe('GamesController', function () {
  context('#index GET', function (done) {
    before(function () {
      requireSubvert.subvert('../../app/models/game', Game);
      GameController = requireSubvert.require('../../app/controllers/games');
    });

    after(function () {
      requireSubvert.cleanUp();
    });

    it('should list all games', function (done) {
      Game.find = sinon.stub().callsArg(1);
      GameController.index(null, { json: function () {
        catching(done, function () {
          expect(Game.find.calledOnce).to.be.true;
        });
      }});
    });
  });

  context('#index POST', function () {
    it('should create a new game', function (done) {
      Game.prototype.save = sinon.stub().callsArg(0);

      GameController.create({ body: { players: [] }}, {
        json: function () {
          catching(done, function () {
            expect(Game.prototype.save.calledOnce).to.be.true;
          });
        }
      });
    });
  });
});
