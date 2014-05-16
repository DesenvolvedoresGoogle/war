
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
					var country = app.getCountry(results);
					console.log(country)
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
		console.log(player)

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



var dummy = {
    players: [
    	{
    		username: 'Usuário Teste',
    		pinColor: '00ffaa',
    		countries: [
    			{
    				lat: -34.397,
    				lng: 150.644
    			},{
    				lat: -44.397,
    				lng: 160.644
    			},{
    				lat: -54.397,
    				lng: 170.644
    			} 
    		]
    	}
    ]
};

new Game(dummy);


