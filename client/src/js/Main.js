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

	app.getCountry = function(ev, callback) {
      game.geocoder.geocode({
        'latLng': ev.latLng
      }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          var geocoderAddressComponent, addressComponentTypes, address;

          for (var i in results) {
            geocoderAddressComponent = results[i].address_components;

            for (var j in geocoderAddressComponent) {
              address = geocoderAddressComponent[j];
              addressComponentTypes = geocoderAddressComponent[j].types;

              for (var k in addressComponentTypes) {
                if (addressComponentTypes[k] == 'administrative_area_level_1') {
                  if (address.short_name === 'DF') {
                    address = {
                      long_name: 'Goiás',
                      short_name: 'GO'
                    };
                  }

                  return callback(address);
                }
              }
            }
          }
          callback('Unknown');
        }
      });
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

    return marker;
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
      
      if (data.players[0].username === app.username) {
        app.player = data.players[0];
        app.enemy = data.players[1];
      } else {
        app.player = data.players[1];
        app.enemy = data.players[0];
      }

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
      console.log('add-marker: marker = ', marker);
      var state = marker.state;
      marker = game.addMarker(marker.lat, marker.lng, marker.color);
      game.options.players.forEach(function (p) {
        var s = p.states.filter(function (s) {
          return s.acronym === state;
        });

        if (s.length) {
          console.log('add-marker: found state', s[0]);
          s[0].markers = s[0].markers || [];
          s[0].markers.push(marker);
        }
      });
    });

    var pieces; 

    socket.on('play', function () {
      console.log('play');
      pieces = Math.floor(app.player.states.length / 2);
      app.$pieces.html(pieces).parent().show();
      google.maps.event.addListener(game.map, 'click', play);
    });

    function play (ev) {
      game.getCountry(ev, function (stateSelected) {
        var contains = app.player.states.filter(function (s) {
          return s.acronym === stateSelected.short_name;
        });

        if (contains.length) {
          console.log(stateSelected.short_name);
          socket.emit('add-marker', {
            gameId: game.options.id,
            lat: ev.latLng.lat(),
            lng: ev.latLng.lng(),
            color: app.player.pinColor,
            state: stateSelected.short_name
          });

          pieces--;

          if (!pieces) {
            google.maps.event.clearListeners(game.map, 'click');
            app.$pieces.parent().hide();
            google.maps.event.addListener(game.map, 'click', attackHandler);
          } else {
            app.$pieces.html(pieces);
          }
        }
      });
    }

    var _state = 0;
    function attackHandler(event) {
      game.getCountry(event, function (state) {
        var contains = app.player.states.filter(function (s) {
          return s.acronym === state.short_name;
        });

        if (!_state) {
          if (contains.length) {
            _state = contains[0];
          }
        } else {
          var attack = _state;
          _state = null;

          if (!contains.length) {
            var number = parseInt(prompt('Com quantos exércitos você deseja atacar?'));
            var attackCount = (attack.markers || []).length - 1;

            if (number < 1 || number > 3) {
              return alert('Você só pode atacar com 1 a 3 exércitos');
            } else if (number > attackCount) {
              return alert('Você só tem ' + attackCount + ' exércitos disponíveis para atacar');
            }

            attackCount = number;
            var defense = app.enemy.states.filter(function (enemyState) {
              return enemyState.acronym === state.short_name;
            })[0];

            console.log('defense:', defense.markers.length, defense.markers);
            var defenseCount = Math.min((defense.markers || []).length, attackCount);
            var attackRandoms = [];
            var defenseRandoms = [];
            var i;

            var random = function (n, container) {
              for (i = 0; i < n; i++) {
                container.push(1 + Math.floor(Math.random() * 6));
              }
              console.log(container);
            };

            random(attackCount, attackRandoms);
            random(defenseCount, defenseRandoms);

            attackRandoms = attackRandoms.sort(function(a,b){return b-a;});
            defenseRandoms = defenseRandoms.sort(function(a,b){return b-a;});

            console.log('attack', attackRandoms);
            console.log('defense', defenseRandoms);

            var defenseLost = 0;
            var attackLost = 0;

            for (i = 0; i < Math.min(defenseCount, attackCount); i++) {
              if (attackRandoms[i] > defenseRandoms[i]) {
                defenseLost++;
              } else {
                attackLost++;
              }
            }

            defenseCount = (defense.markers || []).length;
            console.log('attack lost', attackLost);
            console.log('defense lost', defenseLost);
            console.log('defense count', defenseCount);
            
            var remove = function (from, count) {
              for (i = 0; i < count; i++) {
                from.markers[0].setMap(null);
                from.markers.splice(i, 1);
              }
            };

            remove(defense, defenseLost);
            remove(attack, attackLost);

            if (defenseLost === defenseCount) {
              app.enemy.states.splice(
                app.enemy.states.indexOf(defense),
                1);
              app.player.states.push(defense);

              var move = function (lat, lng) {
                attack.markers[0].setMap(null);
                attack.markers.splice(0, 1);
                var marker = game.addMarker(lat, lng, app.player.pinColor);
                defense.markers.push(marker);
              };

              move(defense.lat, defense.lng);

              alert('Clique no novo território para mover mais exércitos');
              google.maps.event.clearListeners(game.map, 'click');
              google.maps.event.addListener(game.map, 'click', function (e) {
                if (attack.markers.length === 1) {
                  return alert('Você não tem mais exércitos para mover');
                }

                game.getCountry(e, function (state) {
                  if (state.short_name === defense.acronym) {
                    move(e.latLng.lat(), e.latLng.lng());
                  }
                });
              });

              window.done = function () {
                google.maps.event.clearListeners(game.map, 'click');
                google.maps.event.addListener(game.map, 'click', attackHandler);
              };
            }
          } else {
            alert('Você não pode atacar o seu próprio estado.');
          }
        }
      });
    }
	};

	app.init();
};

var game = new Game();
new StartScreen(game);
