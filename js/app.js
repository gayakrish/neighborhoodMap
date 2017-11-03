var markersArray = [

]

var ViewModel = function() {
    var self = this;
    var geocoder;
    var location = {
        lat: 40.585258,
        lng: -105.084419
    };

    var map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 13,
        mapTypeControl: false,
        mapType: 'normal'
    });

    var request = {
        location: location,
        radius: '2000',
        types: ['shopping_mall', 'art_gallery', 'restaurant', 'park', 'university']
    };

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                // If the request succeeds, draw the place location on
                // the map as a marker, and register an event to handle a
                // click on the marker.
                var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location
                });
            }
        } else {
            //TODO: handle error
        }
    });

    this.searchText = ko.observable('');
    this.updateMarker = ko.computed(function() {
        alert("calling updateMarker " + this.searchText);
        //   //var address = document.getElementById('search-text').value;
        //   geocoder.geocode({'address': searchText}, function(results, status) {
        // if (status == 'OK') {
        // 	map.setCenter(results[0].geometry.location);
        // 	var marker = new google.maps.Marker({
        // 		map: map,
        // 		position: results[0].geometry.location
        // 	});
        // } else {
        // 	alert('Geocode was not successful for the following reason: ' + status);
        // }
        //   });
    });
}

ko.applyBindings(new ViewModel());