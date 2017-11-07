var ViewModel = function() {
    var self = this;
    self.markerArray = ko.observableArray([]);
    self.searchText = ko.observable('');
    self.location = {
        lat: 40.585258,
        lng: -105.084419
    };
    self.bounds = new google.maps.LatLngBounds(self.location);
    self.map = new google.maps.Map(document.getElementById('map'), {
        center: self.location,
        zoom: 25,
        mapTypeControl: false,
        mapType: 'normal',
        preserveViewport: false
    });
    self.request = {
        location: self.location,
        radius: '10000',
        types: ['museum', 'park', 'university', 'art_gallery']
    };
    self.service = new google.maps.places.PlacesService(self.map);
    self.currentMarker = ko.observable('');
    self.detailedInfoWindow = new google.maps.InfoWindow();
    self.miniInfoWindow = new google.maps.InfoWindow();

    //TODO: autocomplete
    // self.autocomplete = new google.maps.places.Autocomplete(self.searchText());

    self.service.nearbySearch(self.request, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                var marker = new google.maps.Marker({
                    map: self.map,
                    position: place.geometry.location,
                    title: place.name,
                    animation: google.maps.Animation.DROP,
                });

                marker.addListener('click', function() {
                    self.setCurrentMarker(this);
                });
                marker.addListener('mouseover', function() {
                    self.openminiInfoWindow(this);
                });
                marker.addListener('mouseout', function() {
                    self.closeminiInfoWindow(this);
                });

                self.markerArray.push(marker);
                self.bounds.extend(marker.position);
            }
            self.map.fitBounds(self.bounds);
        } else {
            if (self.searchText() != '') {
                window.alert("We could not find that location - please try again with another search term");
                self.searchText('');
            }
        }
    });

    self.openminiInfoWindow = function(marker) {
        var infoStr = `${marker.title}`;
        self.miniInfoWindow.setContent(infoStr);
        self.miniInfoWindow.open(map, marker);
        self.miniInfoWindow.addListener('closeclick', function() {
            self.miniInfoWindow.marker = null;
        });
    }

    self.closeminiInfoWindow = function(marker) {
        self.miniInfoWindow.marker = null;
    }

    self.updateMarker = ko.computed(function() {
        self.request = {
            bounds: self.bounds,
            keyword: self.searchText()
        }
        self.service.nearbySearch(self.request, function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var tempMarker = [];
                clearMarkers();
                for (var i = 0; i < results.length; i++) {
                    var place = results[i];
                    console.log("place " + place.name);
                    var marker = new google.maps.Marker({
                        map: self.map,
                        position: place.geometry.location,
                        title: place.name,
                        animation: google.maps.Animation.DROP,
                    });

                    marker.addListener('click', function() {
                        self.setCurrentMarker(this);
                    });
                    marker.addListener('mouseover', function() {
                        self.openminiInfoWindow(this);
                    });
                    marker.addListener('mouseout', function() {
                        self.closeminiInfoWindow(this);
                    });

                    tempMarker.push(marker);
                    self.bounds.extend(marker.position);
                }
                self.markerArray(tempMarker);
                self.map.fitBounds(self.bounds);

            } else {
                if (self.searchText() != '') {
                    window.alert("We could not find that location - please try again with another search term");
                    self.searchText('');
                }
            }
        });
    });

    self.setCurrentMarker = function(marker) {
        self.currentMarker(marker);
        console.log("currentMarker " + self.currentMarker().title);
        toggleMarker(self.currentMarker());
        self.openminiInfoWindow(self.currentMarker());
        //TODO: zoom in map and setcenter around current marker
    };

    var toggleMarker = function(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.DROP);
        }
    }

    var detailedInfoWindow = function() {

    }

    var clearMarkers = function() {
        console.log("clearing markers");
        for (var i = 0; i < self.markerArray().length; i++) {
            self.markerArray()[i].setMap(null);
        }
    }
}

ko.applyBindings(new ViewModel());