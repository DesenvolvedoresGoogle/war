var Game = function(options) {
    console.log("running...");
    var app = {}, defaults = {
        zoom: 3,
        center: new google.maps.LatLng(-34.397, 150.644),
        players: [ {
            username: "Default User",
            pinColor: "FFFFFF",
            countries: []
        } ]
    };
    /*
	* Recursively merge properties of two objects 
	* @todo: improvements and refactoring.
	* http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
	*/
    app.mergeRecursive = function(obj1, obj2) {
        for (var p in obj2) {
            try {
                // Property in destination object set; update its value.
                if (obj2[p].constructor == Object) {
                    obj1[p] = app.mergeRecursive(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    };
    app.init = function() {
        app.settings = app.mergeRecursive(defaults, options);
        app.setup();
        app.bind();
        app.buildMarkers(app.settings.players[0]);
    };
    app.setup = function() {
        app.game = document.getElementById("game");
        app.map = new google.maps.Map(app.game, app.settings);
        app.geocoder = new google.maps.Geocoder();
        app.markers = [];
    };
    app.bind = function() {
        google.maps.event.addListener(app.map, "click", function(ev) {
            app.geocoder.geocode({
                latLng: ev.latLng
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var country = app.getCountry(results);
                    console.log(country);
                }
                if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                    console.log("ZERO_RESULTS");
                }
                if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    console.log("OVER_QUERY_LIMIT");
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
                    if (addressComponentTypes[k] == "country") {
                        return address;
                    }
                }
            }
        }
        return "Unknown";
    };
    app.buildMarkers = function(player) {
        console.log(player);
        var current = null, latLng = null, pinColor = player.pinColor, pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor, new google.maps.Size(21, 34), new google.maps.Point(0, 0), new google.maps.Point(10, 34));
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
    google.maps.event.addDomListener(window, "load", app.init);
};

var dummy = {
    players: [ {
        username: "Usuário Teste",
        pinColor: "00ffaa",
        countries: [ {
            lat: -34.397,
            lng: 150.644
        }, {
            lat: -44.397,
            lng: 160.644
        }, {
            lat: -54.397,
            lng: 170.644
        } ]
    } ]
};

new Game(dummy);