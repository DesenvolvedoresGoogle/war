'use strict';

var Game = {};
var GameController;
var requireSubvert = require('require-subvert')(__dirname);

describe('GamesController', function () {
  context('#index', function (done) {
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
});
