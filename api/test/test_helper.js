'use strict';

var mongoose = require('mongoose');
var FactoryGirl = require('factory_girl');
var chai = require('chai');
var sinon = require('sinon');
var requireSubvert = require('require-subvert');

mongoose.connect('mongodb://localhost/hackathon-war-test');

FactoryGirl.definitionFilePaths = [__dirname + '/factories'];
FactoryGirl.findDefinitions();

global.expect = chai.expect;
global.sinon = sinon;
global.catching = function (done, fn) {
  try {
    fn();
    done();
  } catch (err) {
    done(err);
  }
};
