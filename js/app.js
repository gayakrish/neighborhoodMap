var markerArray = [];
var filterArray = ['Restaurants', 'Schools', 'University', 'Bus', 'Museum', 'Park'];
var currentMarker;

var ViewModel = function() {
    var self = this;
    var geocoder = new google.maps.Geocoder();

    self.markerArray = ko.observableArray(markerArray);
    self.bounds = new google.maps.LatLngBounds();
    self.searchText = ko.observable('');

    var location = {
        lat: 40.585258,
        lng: -105.084419
    };

    var map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 15,
        mapTypeControl: false,
        mapType: 'normal'
    });


    var request = {
        location: location,
        radius: '2000',
        types: ['school', 'museum', 'restaurant', 'park', 'university', 'bus_station']
    };

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    title: place.name
                });

                self.markerArray.push(marker);
                self.bounds.extend(marker.position);
            }
            map.fitBounds(self.bounds);

        } else {
            //TODO: handle error
        }
    });

    self.filterArrayVisible = ko.observable(false);
    self.toggleFilterArray = function() {
        self.filterArrayVisible(!self.filterArrayVisible());
    }

    self.filterArray = ko.observableArray(filterArray);
    self.currentFilter = ko.observable('Restaurants');

    self.currentFilter = ko.computed(function() {
        document.getElementById
    });

    self.updateMarker = ko.computed(function() {
        geocoder.geocode({
            'address': self.searchText()
        }, function(results, status) {
            if (status == 'OK') {
                var place = results[0];
                clearMarkers();
                map.setCenter(place.geometry.location);
                var marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    title: place.name
                });
                self.markerArray.push(marker);
                self.bounds.extend(marker.position);
                map.fitBounds(self.bounds);
                // }
            } else {
                console.dir('Geocode was not successful for the following reason: ' + status);
            }
        });
    });

    var clearMarkers = function() {
        console.log("clearing markers");
        for (var i = 0; i < self.markerArray.length; i++) {
            self.markerArray[i].setMap(null);
        }
        self.markerArray = [];
        console.log("markerArray.length " + markerArray.length);

    }
}

ko.applyBindings(new ViewModel());