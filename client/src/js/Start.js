'use strict';



var possibilities = {
	AC: ['AM', 'RO'],
	AM: ['AC', 'RO', 'RR', 'PA', 'MT'],
	AL: ['SE', 'PE', 'BH'],
	AP: ['PA'],
	BA: ['SE', 'AL', 'PE', 'PI', 'TO', 'GO', 'MG', 'ES'], 
	CE: ['RN', 'PI', 'PB', 'PE'],
	ES: ['BA', 'MG', 'RJ'],
	GO: ['MS', 'MT', 'TO', 'BA', 'MG'], 
	MA: ['PI', 'TO', 'PA'],
	MG: ['SP', 'GO', 'BA', 'ES', 'RJ'], 
	MS: ['GO', 'MG', 'SP', 'PR', 'MT'], 
	MT: ['RO', 'AM', 'PA', 'TO', 'GO', 'MS'], 
	PA: ['AP', 'AM', 'RR', 'MT', 'TO', 'MA'], 
	PB: ['RN', 'CE', 'PE'],
	PE: ['SE', 'BA', 'PI', 'CE', 'PB'],
	PI: ['CE', 'MA', 'TO', 'BA', 'PE'], 
	PR: ['MS', 'SP', 'SC'], 
	RJ: ['SP', 'MG', 'ES'],
	RN: ['CE', 'PB'],
	RO: ['AC', 'AM', 'MT'],
	RR: ['AM', 'PA'],
	RS: ['SC'],
	SC: ['PR', 'RS'], 
	SE: ['AL', 'BA'],
	SP: ['MS', 'MG', 'PR', 'RJ'], 
	TO: ['MA', 'GO', 'PA', 'PI', 'BH', 'MT'], 
};

var WAR = {
	module: {},
	instance: {}
};

$(document).ready(function () {
	WAR.instance.socket = io.connect('http://localhost:3000');
	WAR.module.Map.init();
	WAR.module.Menu.init();
});
