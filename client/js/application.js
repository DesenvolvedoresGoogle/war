"use strict";

var possibilities = {
    AC: [ "AM", "RO" ],
    AM: [ "AC", "RO", "RR", "PA", "MT" ],
    AL: [ "SE", "PE", "BH" ],
    AP: [ "PA" ],
    BA: [ "SE", "AL", "PE", "PI", "TO", "GO", "MG", "ES" ],
    CE: [ "RN", "PI", "PB", "PE" ],
    ES: [ "BA", "MG", "RJ" ],
    GO: [ "MS", "MT", "TO", "BA", "MG" ],
    MA: [ "PI", "TO", "PA" ],
    MG: [ "SP", "GO", "BA", "ES", "RJ" ],
    MS: [ "GO", "MG", "SP", "PR", "MT" ],
    MT: [ "RO", "AM", "PA", "TO", "GO", "MS" ],
    PA: [ "AP", "AM", "RR", "MT", "TO", "MA" ],
    PB: [ "RN", "CE", "PE" ],
    PE: [ "SE", "BA", "PI", "CE", "PB" ],
    PI: [ "CE", "MA", "TO", "BA", "PE" ],
    PR: [ "MS", "SP", "SC" ],
    RJ: [ "SP", "MG", "ES" ],
    RN: [ "CE", "PB" ],
    RO: [ "AC", "AM", "MT" ],
    RR: [ "AM", "PA" ],
    RS: [ "SC" ],
    SC: [ "PR", "RS" ],
    SE: [ "AL", "BA" ],
    SP: [ "MS", "MG", "PR", "RJ" ],
    TO: [ "MA", "GO", "PA", "PI", "BH", "MT" ]
};

var WAR = {
    module: {},
    instance: {}
};

$(document).ready(function() {
    WAR.instance.socket = io.connect("http://localhost:3000");
    WAR.module.Map.init();
    WAR.module.Menu.init();
});

"use strict";

WAR.module.Map = {
    init: function() {
        console.log("init map");
        google.maps.event.addDomListener(window, "load", this.attach.bind(this));
    },
    attach: function(settings) {
        this.settings = {
            zoom: 4,
            minZoom: 4,
            maxZoom: 6,
            disableDefaultUI: true,
            center: new google.maps.LatLng(-14.0634424, -50.2827613)
        };
        this.setup();
        this.events();
    },
    setup: function() {
        this.map = new google.maps.Map(document.getElementById("game"), this.settings);
        this.geocoder = new google.maps.Geocoder();
        this.markers = [];
        this.mapBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-28.1354884, -68.1965992), new google.maps.LatLng(-1.4372482, -40.0657399));
        new google.maps.KmlLayer({
            url: "https://sites.google.com/a/gmapas.com/home/poligonos-ibge/poligonos-estados-do-brasil/Estados.kmz"
        }).setMap(this.map);
    },
    events: function() {
        var _this = this, lastValidCenter = this.map.getCenter();
        google.maps.event.addListener(this.map, "center_changed", function() {
            if (_this.mapBounds.contains(_this.map.getCenter())) {
                lastValidCenter = _this.map.getCenter();
                return;
            }
            _this.map.panTo(lastValidCenter);
        });
    },
    addMarker: function(lat, lng, pinColor) {
        var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor, new google.maps.Size(21, 34), new google.maps.Point(0, 0), new google.maps.Point(10, 34));
        return new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            map: this.map,
            icon: pinImage,
            clickable: false
        });
    },
    getCountry: function(ev, callback) {
        this.geocoder.geocode({
            latLng: ev.latLng
        }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var geocoderAddressComponent, addressComponentTypes, address;
                for (var i in results) {
                    geocoderAddressComponent = results[i].address_components;
                    for (var j in geocoderAddressComponent) {
                        address = geocoderAddressComponent[j];
                        addressComponentTypes = geocoderAddressComponent[j].types;
                        for (var k in addressComponentTypes) {
                            if (addressComponentTypes[k] == "administrative_area_level_1") {
                                if (address.short_name === "DF") {
                                    address = {
                                        long_name: "Goiás",
                                        short_name: "GO"
                                    };
                                }
                                return callback(address);
                            }
                        }
                    }
                }
                callback("Unknown");
            }
        });
    }
};

"use strict";

WAR.module.Menu = {
    init: function() {
        this.setup();
        this.bind();
        this.showModal();
        this.updateListGames();
    },
    setup: function() {
        this.$form = $("#form");
        this.$username = $("#username");
        this.$btnNewGame = $("#btn-new-game");
        this.$modal = $("#start-screen");
        this.$pieces = $("#points");
        this.$listGames = $("#waiting-list");
        this.$btnEnterGame = $(".btn-enter-game");
    },
    bind: function() {
        var _this = this;
        this.$btnNewGame.on("click", function() {
            _this.waitingList();
        });
        $(document).on("click", ".btn-enter-game", function() {
            _this.joinGame($(this));
        });
        WAR.instance.socket.on("created-game", function(data) {
            WAR.module.Game.init(data);
        });
    },
    joinGame: function(target) {
        WAR.username = this.$username.val();
        if (!WAR.username) {
            alert("Preencha o seu nome antes de criar um jogo");
            return;
        }
        var owner = target.parent().prev().html(), arrayUsers = [ owner, WAR.username ];
        this.$username.val("");
        WAR.instance.socket.emit("join-game", arrayUsers);
    },
    waitingList: function() {
        WAR.username = this.$username.val();
        if (!WAR.username) {
            alert("Preencha o seu nome antes de criar um jogo");
            return;
        }
        this.$username.val("");
        WAR.instance.socket.emit("new-game", WAR.username);
        this.$modal.find(".modal-body").html('<p class="text-center">Aguardando outro jogador...</p>').next().empty();
    },
    showModal: function() {
        this.$modal.modal("show");
    },
    hideModal: function() {
        this.$modal.modal("hide");
    },
    updateListGames: function() {
        var _this = this;
        WAR.instance.socket.on("games", function(data) {
            var html = [];
            _this.$listGames.empty();
            for (var i = 0, len = data.length; i < len; i++) {
                html.push("<tr>");
                html.push("	<td>" + data[i] + "</td>");
                html.push("	<td>");
                html.push('	 <button class="btn btn-primary btn-enter-game">Entrar</a>');
                html.push("	</td>");
                html.push("</tr>");
            }
            _this.$listGames.append(html.join(" "));
        });
    }
};

"use strict";

WAR.module.Game = {
    init: function(data) {
        this.data = data;
        // console.log('=========>', this.data);
        this.setup();
        this.create();
        this.events();
    },
    setup: function() {
        this.player = null;
        this.enemy = null;
        this.pinColors = [ "FF0000", "00FF00" ];
        this.$modal = $("#start-screen");
        this.$pieces = $("#points");
        this.fetchDetails();
    },
    fetchDetails: function() {
        this.details = {
            clear: function() {
                this.nextAttack.hide();
                this.endAttack.show();
                this.attack.empty();
                this.defense.empty();
                this.attackDice.empty();
                this.defenseDice.empty();
                this.sync();
            },
            nextAttack: $("#details .next-attack"),
            endAttack: $("#details .end-attack"),
            attackDice: $("#details .attack-dice"),
            defenseDice: $("#details .defense-dice"),
            table: $("#details table"),
            attack: $(".details-attack"),
            defense: $(".details-defense"),
            sync: function() {
                WAR.instance.socket.emit("sync-menu", $("#details").html());
            }
        };
    },
    events: function() {
        var _this = this;
        WAR.instance.socket.on("win-wo", function() {
            // console.log('win-wo');
            _this.$modal.find(".modal-body").html("<h2>Você ganhou!</h2><p>Seu oponente desistiu do jogo...</p>").next().html('<button class="btn btn-primary" onclick="window.location.reload()">OK</button>');
            WAR.module.Menu.showModal();
        });
        WAR.instance.socket.on("sync-menu", function(html) {
            $("#details").html(html);
        });
        WAR.instance.socket.on("add-marker", function(marker) {
            // console.log('add-marker: marker = ', marker);
            var state = marker.state;
            marker = WAR.module.Map.addMarker(marker.lat, marker.lng, marker.color);
            _.each(_this.data.players, function(p) {
                var s = p.states.filter(function(s) {
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
        WAR.instance.socket.on("play", function(marker) {
            console.log("play");
            _this.fetchDetails();
            _this.details.table.css("border-top-color", "#" + _this.player.pinColor);
            _this.pieces = Math.floor(_this.player.states.length / 2);
            _this.$pieces.html(_this.pieces).parent().show();
            google.maps.event.addListener(WAR.module.Map.map, "click", function(ev) {
                _this.play(ev);
            });
        });
        WAR.instance.socket.on("remove-markers", function(obj) {
            console.log(obj);
            var from = _.map(_this.data.players, function(p) {
                return p.states.filter(function(s) {
                    return s.acronym === obj.from;
                })[0];
            }).reduce(function(a, b) {
                return a || b;
            });
            console.log(from, obj.count);
            for (var i = 0; i < obj.count; i++) {
                from.markers.shift().setMap(null);
            }
        });
        WAR.instance.socket.on("change-state-owner", function(data) {
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
            $("#user-stats").html(_this.player.states.length + "/26 estados");
        });
    },
    play: function(ev) {
        var _this = this;
        this._state = null;
        WAR.module.Map.getCountry(ev, function(stateSelected) {
            var contains = _this.player.states.filter(function(s) {
                return s.acronym === stateSelected.short_name;
            });
            if (contains.length) {
                // console.log(stateSelected.short_name);
                WAR.instance.socket.emit("add-marker", {
                    gameId: _this.data.id,
                    lat: ev.latLng.lat(),
                    lng: ev.latLng.lng(),
                    color: _this.player.pinColor,
                    state: stateSelected.short_name
                });
                _this.pieces--;
                if (!_this.pieces) {
                    _this.details.endAttack.removeClass("disabled").one("click", function() {
                        _this.details.clear();
                        _this.details.table.css("border-top-color", "#" + _this.enemy.pinColor);
                        google.maps.event.clearListeners(WAR.module.Map.map, "click");
                        WAR.instance.socket.emit("next", _this.data.id);
                        _this.details.endAttack.addClass("disabled");
                    });
                    google.maps.event.clearListeners(WAR.module.Map.map, "click");
                    _this.$pieces.parent().hide();
                    google.maps.event.addListener(WAR.module.Map.map, "click", function(ev) {
                        _this.attackHandler(ev);
                    });
                } else {
                    _this.$pieces.html(_this.pieces);
                }
            }
        });
    },
    create: function() {
        var _this = this, player = {};
        WAR.module.Menu.hideModal();
        _.each(this.data.players, function(player, username, players) {
            player.pinColor = _this.pinColors[_.keys(players).indexOf(username)];
            player.states.forEach(function(state) {
                var marker = WAR.module.Map.addMarker(state.lat, state.lng, player.pinColor);
                state.markers = state.markers || [];
                state.markers.push(marker);
            });
        });
        var ps = _.values(this.data.players);
        if (ps[0].username === WAR.username) {
            this.player = ps[0];
            this.enemy = ps[1];
        } else {
            this.player = ps[1];
            this.enemy = ps[0];
        }
        _this.details.table.css("border-top-color", "#" + _this.enemy.pinColor);
        $("#menu").find("#user-color").css("background-color", "#" + this.player.pinColor).end().find("#user-name").html(WAR.username).end().find("#user-stats").html(this.player.states.length + "/26 estados").end().show();
    },
    updateStats: function() {},
    attackHandler: function(ev) {
        // console.log('attackHandler');
        var _this = this;
        WAR.module.Map.getCountry(ev, function(state) {
            var contains = _this.player.states.filter(function(s) {
                return s.acronym === state.short_name;
            });
            if (!_this._state) {
                if (contains.length) {
                    _this.details.clear();
                    _this._state = contains[0];
                    _this.details.attack.text(contains[0].acronym);
                    _this.details.sync();
                }
            } else {
                var attack = _this._state;
                _this._state = null;
                if (!contains.length) {
                    if (!~possibilities[attack.acronym].indexOf(state.short_name)) {
                        return alert("Só é possível atacar estados que fazem fronteira");
                    }
                    // console.log(attack.markers.length, attack, attack.markers);
                    var defense = _this.enemy.states.filter(function(enemyState) {
                        return enemyState.acronym === state.short_name;
                    })[0];
                    _this.details.defense.text(defense.acronym);
                    _this.details.sync();
                    var number = parseInt(prompt("Com quantos exércitos você deseja atacar?"), 10), attackCount = (attack.markers || []).length - 1;
                    if (isNaN(number)) {
                        return _this.details.clear();
                    }
                    if (number < 1 || number > 3) {
                        return alert("Você só pode atacar com 1 a 3 exércitos");
                    } else {
                        if (number > attackCount) {
                            return alert("Você só tem " + attackCount + " exércitos disponíveis para atacar");
                        }
                    }
                    attackCount = number;
                    // console.log('defense:', defense.markers.length, defense.markers);
                    var defenseCount = Math.min((defense.markers || []).length, 3);
                    var attackRandoms = [];
                    var defenseRandoms = [];
                    var i;
                    var random = function(n, container) {
                        for (i = 0; i < n; i++) {
                            container.push(1 + Math.floor(Math.random() * 6));
                        }
                    };
                    random(attackCount, attackRandoms);
                    random(defenseCount, defenseRandoms);
                    attackRandoms = attackRandoms.sort(function(a, b) {
                        return b - a;
                    });
                    defenseRandoms = defenseRandoms.sort(function(a, b) {
                        return b - a;
                    });
                    _this.details.attackDice.html("(" + attackRandoms.join(",") + ")");
                    _this.details.defenseDice.html("(" + defenseRandoms.join(",") + ")");
                    _this.details.sync();
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
                    WAR.instance.socket.emit("remove-markers", {
                        from: attack.acronym,
                        count: attackLost,
                        gameId: _this.data.id
                    });
                    WAR.instance.socket.emit("remove-markers", {
                        from: defense.acronym,
                        count: defenseLost,
                        gameId: _this.data.id
                    });
                    if (defenseLost === defenseCount) {
                        WAR.instance.socket.emit("change-state-owner", {
                            gameId: _this.data.id,
                            state: defense.acronym,
                            from: _this.enemy.username,
                            to: _this.player.username
                        });
                        var move = function(lat, lng) {
                            WAR.instance.socket.emit("remove-markers", {
                                gameId: _this.data.id,
                                count: 1,
                                from: attack.acronym
                            });
                            WAR.instance.socket.emit("add-marker", {
                                gameId: _this.data.id,
                                lat: lat,
                                lng: lng,
                                color: _this.player.pinColor,
                                state: defense.acronym
                            });
                        };
                        move(defense.lat, defense.lng);
                        if (attack.markers.length > 1) {
                            _this.details.endAttack.hide();
                            _this.details.nextAttack.show().one("click", function() {
                                console.log("here");
                                google.maps.event.clearListeners(WAR.module.Map.map, "click");
                                google.maps.event.addListener(WAR.module.Map.map, "click", function(ev) {
                                    _this.attackHandler(ev);
                                });
                                _this.details.clear();
                            });
                        }
                        alert("Clique no novo território para mover mais exércitos");
                        google.maps.event.clearListeners(WAR.module.Map.map, "click");
                        google.maps.event.addListener(WAR.module.Map.map, "click", function(e) {
                            if (attack.markers.length === 1) {
                                return alert("Você não tem mais exércitos para mover");
                            }
                            WAR.module.Map.getCountry(e, function(state) {
                                if (state.short_name === defense.acronym) {
                                    move(e.latLng.lat(), e.latLng.lng());
                                }
                            });
                        });
                    }
                } else {
                    _this.details.clear();
                    alert("Você não pode atacar o seu próprio estado.");
                }
            }
        });
    }
};