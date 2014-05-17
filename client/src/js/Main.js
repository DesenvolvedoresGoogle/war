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
        maxZoom: 6,
		    disableDefaultUI: true,
		    center: new google.maps.LatLng(-14.0634424, -50.2827613)
		};

  app.pinColors = ['FF0000', '00FF00'];
	app.init = function () {
		app.options = options;
		app.setup();
		app.bind();
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

    // bounds of the desired area
    var allowedBounds = new google.maps.LatLngBounds(
         new google.maps.LatLng(-28.1354884,-68.1965992), 
         new google.maps.LatLng(-1.4372482,-40.0657399)
    );
    var lastValidCenter = app.map.getCenter();

    google.maps.event.addListener(app.map, 'center_changed', function() {
        if (allowedBounds.contains(app.map.getCenter())) {
            lastValidCenter = app.map.getCenter();
            return; 
        }

        app.map.panTo(lastValidCenter);
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

  app.addMarker = function (lat, lng, pinColor) {
    var pinImage = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor,
      new google.maps.Size(21, 34),
      new google.maps.Point(0,0),
      new google.maps.Point(10, 34)
        );
    var latLng = new google.maps.LatLng(lat, lng);
    var marker = new google.maps.Marker({
      position: latLng,
      map: app.map,
      icon: pinImage
    });

  };
	app.buildMarkers = function () {
    app.options.players.forEach(function (player, i) {
      player.pinColor = app.pinColors[i];

      player.states.forEach(function (state) {
        var marker = app.addMarker(state.lat, state.lng, player.pinColor);
        state.markers = state.markers || [];
        state.markers.push(marker);
      });
    });
	};

	google.maps.event.addDomListener(window, 'load', app.init);
  return app;
};

var StartScreen = function (game) {
	var app = {},
		socket = io.connect('http://localhost:3000');
	
	app.init = function () {
		app.setup();
		app.bind();
	};

	app.setup = function () {
    app.$pieces = $('#points');
    app.$username = $('#username');
    app.$startScreen = $('#start-screen').modal('show');

		app.form = document.getElementById('form');
		app.btnNewGame = document.getElementById('btn-new-game');
		
		socket.on('games', function (data) {
			$('#waiting-list').empty();
			
			for (var i = 0, len = data.length; i < len; i++) {
				$('#waiting-list').append('
					<tr>
						<td>' + data[i] + '</td>
            <td>
						<button class="btn btn-primary btn-enter-game">Entrar</a>
					</td></tr>');
			}
		});

	};

	app.bind = function () {
		app.btnNewGame.addEventListener('click', function (ev) {
			app.username = app.$username.val();
      app.$username.val('');

      if (!app.username) {
        alert('Preencha o seu nome antes de criar um jogo');
        return;
      }

			console.log('new-game', app.username);
			socket.emit('new-game', app.username);

      app.$startScreen.find('.modal-body')
        .html('<p class="text-center">Aguardando outro jogador...</p>')
        .next()
        .empty();
		});


		$(document).on('click', '.btn-enter-game', function () {
			app.username = app.$username.val();
      app.$username.val('');

      if (!app.username) {
        alert('Preencha o seu nome antes de entrar no jogo');
        return;
      }

			var owner = $(this).parent().prev().html();
      var arrayUsers = [owner, app.username];

			console.log('join-game', arrayUsers);
			socket.emit('join-game', arrayUsers);
		});

		socket.on('created-game', function (data) {
      console.log('created-game', data);
      game.options = data;
      game.buildMarkers();
      app.$startScreen.modal('hide');
      
      app.player = data.players.find(function (p) {
        return p.username === app.username;
      });

      $('#menu')
        .find('#user-color').css('background-color', '#' + app.player.pinColor)
        .end()
        .find('#user-name').html(app.username)
        .end()
        .find('#user-stats').html(app.player.states.length + '/26 estados')
        .end()
        .show();
		});

    socket.on('win-wo', function () {
      console.log('win-wo');
      app.$startScreen.find('.modal-body')
        .html('<h2>Você ganhou!</h2><p>Seu oponente desistiu do jogo...</p>')
        .next()
        .html('<button class="btn btn-primary" onclick="window.location.reload()">OK</button>');
      app.$startScreen.modal('show');
    });

    socket.on('add-marker', function (marker) {
      game.addMarker(marker.lat, marker.lng, marker.color);
    });

    var pieces; 

    socket.on('play', function () {
      console.log('play');
      pieces = Math.floor(app.player.states.length/ 2);
      app.$pieces.html(pieces).parent().show();
      google.maps.event.addListener(game.map, 'click', play);
    });

    function play (ev) {
      game.geocoder.geocode({
        'latLng': ev.latLng
      }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          var stateSelected = game.getCountry(results);
          if (stateSelected.short_name === 'DF') {
            stateSelected = {
              long_name: 'Goiás',
              short_name: 'GO'
            };
          }

          var contains = app.player.states.find(function (s) {
            return s.acronym === stateSelected.short_name;
          });

          if (contains) {
            socket.emit('add-marker', {
              gameId: game.options.id,
              lat: ev.latLng.lat(),
              lng: ev.latLng.lng(),
              color: app.player.pinColor
            });

            pieces--;

            if (!pieces) {
              google.maps.event.clearListeners(game.map, 'click');
              app.$pieces.parent().hide();
              socket.emit('next', game.options.id);
            } else {
              app.$pieces.html(pieces);
            }
          }
        }
      });
    }
	};

	app.init();
};

var game = new Game();
new StartScreen(game);
