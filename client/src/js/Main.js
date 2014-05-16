'use strict';

var possibilities = {
	AC: ['AM', 'RO'],
	AM: ['AC', 'RO', 'RR', 'PA', 'MT'],
	AL: ['SE', 'PE', 'BH'],
	AP: ['PA'],
	BA: ['SE', 'AL', 'PE', 'PI', 'TO', 'GO', 'MG', 'ES'], 
	CE: ['RN', 'PI', 'PB', 'PE'],
	ES: ['BA', 'MG', 'RJ'],
	GO: ['MS', 'MT', 'TO', 'BA'], 
	MA: ['PI', 'TO', 'PA'],
	MG: ['SP', 'GO', 'BA', 'ES', 'RJ'], 
	MS: ['GO', 'MG', 'SP', 'PR'], 
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


var Game = function (options) {
	var app = {},
		mapSettings = {
		    zoom: 4,
		    minZoom: 4,
		    disableDefaultUI: true,
		    center: new google.maps.LatLng(-14.0634424, -50.2827613)
		};

	app.init = function () {
		app.options = options;
		app.setup();
		app.bind();
		app.buildMarkers(app.options.players[0]);
	};

	app.setup = function () {
		app.game = document.getElementById('game');
		app.map = new google.maps.Map(app.game, mapSettings);
		app.geocoder = new google.maps.Geocoder();
		app.markers = [];

		var ctaLayer = new google.maps.KmlLayer({
			url: 'https://sites.google.com/a/gmapas.com/home/poligonos-ibge/poligonos-estados-do-brasil/Estados.kmz'
		});
		
		ctaLayer.setMap(app.map);
	};

	app.bind = function () {
		google.maps.event.addListener(app.map, 'click', function (ev) {
			app.geocoder.geocode({
				'latLng': ev.latLng
			}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					var stateSelected = app.getCountry(results);
				}
				if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
					console.log('ZERO_RESULTS');
				}
				if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
					console.log('OVER_QUERY_LIMIT');
				}
            });
		});
	};

	app.getCountry = function(results) {
		var geocoderAddressComponent, addressComponentTypes, address;

		for (var i in results) {
			geocoderAddressComponent = results[i].address_components;

			for (var j in geocoderAddressComponent) {
				address = geocoderAddressComponent[j];
				addressComponentTypes = geocoderAddressComponent[j].types;

				for (var k in addressComponentTypes) {
					if (addressComponentTypes[k] == 'administrative_area_level_1') {
						return address;
					}
				}
			}
		}

		return 'Unknown';
	};

	app.buildMarkers = function (player) {
    if (!player) {
      return;
    }

		var current = null,
			latLng = null,
			pinColor = player.pinColor,
			pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
				new google.maps.Size(21, 34),
				new google.maps.Point(0,0),
				new google.maps.Point(10, 34)
			);

		for (var i = 0, len = player.countries.length; i < len; i++) {
			latLng = new google.maps.LatLng(player.countries[i].lat, player.countries[i].lng);
			current = new google.maps.Marker({
				position: latLng,
				map: app.map,
				icon: pinImage
			});

			app.markers.push(current);
		}
	};

	google.maps.event.addDomListener(window, 'load', app.init);
};

var StartScreen = function () {

	var app = {},
		socket = io.connect('http://192.168.2.1:3000');
	
	app.init = function () {
		app.setup();
		app.bind();
	};

	app.setup = function () {
		app.form = document.getElementById('form');
    app.$username = $('#username');
		app.btnNewGame = document.getElementById('btn-new-game');
		
		socket.on('games', function (data) {
			$('#waiting-list').empty();
      app.$username.val('');
			
			for (var i = 0, len = data.length; i < len; i++) {
				$('#waiting-list').append('
					<tr>
						<td>' + data[i] + '</td>
            <td>
						<a class="btn-enter-game" href="javascript:;">Entrar</a>
					</td></tr>');
			}
		});

	};

	app.bind = function () {
		app.btnNewGame.addEventListener('click', function (ev) {
			var username = app.$username.val();
			console.log('new-game', username);
			socket.emit('new-game', username);
		});


		$(document).on('click', '.btn-enter-game', function () {
			var username = app.$username.val(),
				arrayUsers = [];

			var a = $(this).parent().prev().html();

			arrayUsers.push(username);
			arrayUsers.push(a);

			console.log('join-game', arrayUsers);

			return false;
			socket.emit('join-game', arrayUsers);
		});

		socket.on('created-game', function (data) {
			console.log(data);
		});
	};

	app.init();
};

new StartScreen();
new Game();
