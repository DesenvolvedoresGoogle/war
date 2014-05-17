'use strict';

WAR.module.Game = {
	init: function (data) {
		this.data = data;
		// console.log('=========>', this.data);
		this.setup();
		this.create();
		this.events();
	},

	setup: function () {
		this.player = null;
		this.enemy = null;
		this.pinColors = ['FF0000', '00FF00'];

		this.$modal = $('#start-screen');
		this.$pieces = $('#points');

		this.details = {
			attack: $('.details-attack'),
			defense: $('.details-defense')
		};
	},

	events: function () {
		var _this = this;

		WAR.instance.socket.on('win-wo', function () {
			// console.log('win-wo');
			_this.$modal.find('.modal-body')
				.html('<h2>Você ganhou!</h2><p>Seu oponente desistiu do jogo...</p>')
				.next()
				.html('<button class="btn btn-primary" onclick="window.location.reload()">OK</button>');

			WAR.module.Menu.showModal();
		});

		WAR.instance.socket.on('add-marker', function (marker) {
			// console.log('add-marker: marker = ', marker);
			var state = marker.state;

			marker = WAR.module.Map.addMarker(marker.lat, marker.lng, marker.color);

			_.each(_this.data.players, function (p) {
				var s = p.states.filter(function (s) {
					return s.acronym === state;
				});

				if (s.length) {
					// console.log('add-marker: found state', s[0]);
					s[0].markers = s[0].markers || [];
					s[0].markers.push(marker);
				}
			});
		});

		this.pieces = null;

		WAR.instance.socket.on('play', function (marker) {
      console.log('play');
      $('#details').find('.btn').one('click', function () {
        google.maps.event.clearListeners(WAR.module.Map.map, 'click');
        
        WAR.instance.socket.emit('next', _this.data.id);
      });

			_this.pieces = Math.floor(_this.player.states.length / 2);
			_this.$pieces.html(_this.pieces).parent().show();
			google.maps.event.addListener(WAR.module.Map.map, 'click', function (ev) {
				_this.play(ev);
			});
		});

		WAR.instance.socket.on('remove-markers', function (obj) {
			var from = _.map(_this.data.players, function (p) {
				return p.states.filter(function (s) {
					return s.acronym === obj.from;
				})[0];
			}).reduce(function (a, b) {
				return a || b;
			});

			for (var i = 0; i < obj.count; i++) {
				from.markers[0].setMap(null);
				from.markers.splice(i, 1);
			}
		});

		WAR.instance.socket.on('change-state-owner', function (data) {
      var players = _this.data.players;
      var from = players[data.from];
      var state, index, length = from.states.length;
      for (index = 0; index < length; index++) {
        state = from.states[index];
        if (state.acronym === data.state) {
          break;
        }
      }

			from.states.splice(index, 1);
			_this.data.players[data.to].states.push(state);
		});
	},

	play: function (ev) {
		var _this = this;

		this._state = null;

		WAR.module.Map.getCountry(ev, function (stateSelected) {
			var contains = _this.player.states.filter(function (s) {
				return s.acronym === stateSelected.short_name;
			});

			if (contains.length) {
				// console.log(stateSelected.short_name);

				WAR.instance.socket.emit('add-marker', {
					gameId: _this.data.id,
					lat: ev.latLng.lat(),
					lng: ev.latLng.lng(),
					color: _this.player.pinColor,
					state: stateSelected.short_name
				});

				_this.pieces--;

				if (!_this.pieces) {
					google.maps.event.clearListeners(WAR.module.Map.map, 'click');
					_this.$pieces.parent().hide();
					google.maps.event.addListener(WAR.module.Map.map, 'click', function (ev) {
						_this.attackHandler(ev);
					});
				}
				else {
					_this.$pieces.html(_this.pieces);
				}
			}
		});
	},

	create: function () {
		var _this = this,
			player = {};

		WAR.module.Menu.hideModal();

		_.each(this.data.players, function (player, username, players) {
			player.pinColor = _this.pinColors[_.keys(players).indexOf(username)];

			player.states.forEach(function (state) {
				var marker = WAR.module.Map.addMarker(state.lat, state.lng, player.pinColor);
				state.markers = state.markers || [];
				state.markers.push(marker);
			});
		});

		var ps = _.values(this.data.players);

		if (ps[0].username === WAR.username) {
			this.player = ps[0];
			this.enemy = ps[1];
		}
		else {
			this.player = ps[1];
			this.enemy = ps[0];
		}

		$('#menu')
			.find('#user-color')
			.css('background-color', '#' + this.player.pinColor)
			.end()
			.find('#user-name').html(WAR.username)
			.end()
			.find('#user-stats').html(this.player.states.length + '/26 estados')
			.end()
			.show();
	},

	updateStats: function () {
		// @TODO	
	},

	attackHandler: function (ev) {
		// console.log('attackHandler');

		var _this = this;


		WAR.module.Map.getCountry(ev, function (state) {
			var contains = _this.player.states.filter(function (s) {
				return s.acronym === state.short_name;
			});

			if (!_this._state) {
				if (contains.length) {
					_this._state = contains[0];
					_this.details.attack.text(contains[0].acronym);
				}
			}
			else {
				var attack = _this._state;
				_this._state = null;

				if (!contains.length) {
					if (!~possibilities[attack.acronym].indexOf(state.short_name)) {
						return alert('Só é possível atacar estados que fazem fronteira');
					}

					// console.log(attack.markers.length, attack, attack.markers);
					
					var number = parseInt(prompt('Com quantos exércitos você deseja atacar?'), 10),
						attackCount = (attack.markers || []).length - 1;

					if (number < 1 || number > 3) {
						return alert('Você só pode atacar com 1 a 3 exércitos');
					}
					else {
						if (number > attackCount) {
							return alert('Você só tem ' + attackCount + ' exércitos disponíveis para atacar');
						}
					}

					attackCount = number;

					var defense = _this.enemy.states.filter(function (enemyState) {
						return enemyState.acronym === state.short_name;
					})[0];

					_this.details.defense.text(defense.acronym);

					// console.log('defense:', defense.markers.length, defense.markers);
					var defenseCount = Math.min((defense.markers || []).length, attackCount);
					var attackRandoms = [];
					var defenseRandoms = [];
					var i;

					var random = function (n, container) {
						for (i = 0; i < n; i++) {
							container.push(1 + Math.floor(Math.random() * 6));
						}
						// console.log(container);
					};

					random(attackCount, attackRandoms);
					random(defenseCount, defenseRandoms);

					attackRandoms = attackRandoms.sort(function(a,b){return b-a;});
					defenseRandoms = defenseRandoms.sort(function(a,b){return b-a;});

					// console.log('attack', attackRandoms);
					// console.log('defense', defenseRandoms);

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
					// console.log('attack lost', attackLost);
					// console.log('defense lost', defenseLost);
					// console.log('defense count', defenseCount);

					WAR.instance.socket.emit('remove-markers', {
						from: attack.acronym,
						count: attackLost,
						gameId: _this.data.id
					});

					WAR.instance.socket.emit('remove-markers', {
						from: defense.acronym,
						count: defenseLost,
						gameId: _this.data.id
					});

					if (defenseLost === defenseCount) {
						WAR.instance.socket.emit('change-state-owner', {
							gameId: _this.data.id,
							state: defense.acronym,
							from: _this.enemy.username,
							to: _this.player.username
						});

						var move = function (lat, lng) {
							WAR.instance.socket.emit('remove-markers', {
								gameId: _this.data.id,
								count: 1,
								from: attack.acronym
							});

							WAR.instance.socket.emit('add-marker', {
								gameId: _this.data.id,
								lat: lat,
								lng: lng,
								color: _this.player.pinColor,
								state: defense.acronym
							});
						};

						move(defense.lat, defense.lng);

						alert('Clique no novo território para mover mais exércitos');
						
						google.maps.event.clearListeners(WAR.module.Map.map, 'click');
						google.maps.event.addListener(WAR.module.Map.map, 'click', function (e) {
							if (attack.markers.length === 1) {
								return alert('Você não tem mais exércitos para mover');
							}

							WAR.module.Map.getCountry(e, function (state) {
								if (state.short_name === defense.acronym) {
									move(e.latLng.lat(), e.latLng.lng());
								}
							});
						});

						window.done = function () {
							google.maps.event.clearListeners(WAR.module.Map.map, 'click');
							google.maps.event.addListener(WAR.module.Map.map, 'click', function (ev) {
								_this.attackHandler(ev);
							});
						};
					}
				}
				else {
					alert('Você não pode atacar o seu próprio estado.');
				}
			}
		});
	}
};

