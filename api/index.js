'use strict';

var mongoose = require('mongoose');
var Dispatcher = require('./app/dispatcher');

mongoose.connect(process.env.MONGOLAB_URI ||
  'mongodb://localhost/hackathon-war-dev');

var Shared = {
  waiting: {},
  games: [],
  playing: {},
  index: 0
};

var app = require('http').createServer(handler),
  io = require('socket.io').listen(app),
  fs = require('fs');

console.log('Listening on %d...', process.env.PORT || 3000);
app.listen(process.env.PORT || 3000);

function handler(req, res) {
  var url = req.url === '/' ? '/index.html' : req.url;
  console.log(url);
  fs.readFile(__dirname + '/../client' + url,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading game...');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
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
