'use strict';

var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = require('./app/router.js');
var app = express();

mongoose.connect('mongodb://localhost/hackathon-war-dev');

app.use(bodyParser.urlencoded())
  .use(logger())
  .use(router);

app.listen(8080);
console.log('Listening on port 8080');
