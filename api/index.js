'use strict';

var mongoose = require('mongoose');
var Dispatcher = require('./app/dispatcher');
var io = require('socket.io').listen(3000, '0.0.0.0');

mongoose.connect('mongodb://localhost/hackathon-war-dev');

var Shared = {
  waiting: {},
  games: [],
  playing: {},
  index: 0
};

io.set('log level', 1);
io.on('connection', function(socket){
  var dispatcher = new Dispatcher(socket, Shared);

  socket.on('disconnect', dispatcher.disconnect);
  socket.on('new-game', dispatcher.newGame);
  socket.on('join-game', dispatcher.joinGame);
  socket.on('next', dispatcher.next);
  socket.on('sync-menu', dispatcher.syncMenu);


  dispatcher.notifyAllPlayers('add-marker');
  dispatcher.notifyAllPlayers('remove-markers');
  dispatcher.notifyAllPlayers('change-state-owner');
});
