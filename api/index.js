'use strict';

var mongoose = require('mongoose');
var GamesController = require('./app/controllers/games.js');
var io = require('socket.io').listen(3000, '0.0.0.0');

mongoose.connect('mongodb://localhost/hackathon-war-dev');

io.on('connection', function(socket){
  GamesController.socket = socket;
  GamesController.sendUpdate();

  socket.on('new-game', GamesController.waiting);

  socket.on('join-game', GamesController.create);
});
