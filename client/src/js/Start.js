'use strict';

var WAR = {
	module: {},
	instance: {}
};

$(document).ready(function () {
	WAR.instance.socket = io.connect('http://localhost:3000');
	WAR.instance.map = WAR.module.Map.init();
	WAR.instance.menu = WAR.module.Menu.init();
});