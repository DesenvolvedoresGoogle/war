'use strict';

var express = require('express');
var router = require('./app/router.js');
var mongoose = require('mongoose');
var app = express();

mongoose.connect('mongodb://localhost/hackathon-war-dev');

app.use(router);

app.listen(8080);
