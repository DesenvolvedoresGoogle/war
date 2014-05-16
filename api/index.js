'use strict';

var express = require('express');
var router = require('./app/router.js');
var app = express();

app.use(router);

app.listen(8080);
