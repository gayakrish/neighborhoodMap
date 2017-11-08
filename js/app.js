var ViewModel = function() {
    var self = this;
    self.markerArray = ko.observableArray([]);
    self.searchText = ko.observable('');
    self.location = {
        lat: 40.5749824,
        lng: -105.0838675
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
        radius: '11000',
        types: ['museum', 'park', 'university']
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
        self.toggleMarker(self.currentMarker());
        // self.openminiInfoWindow(self.currentMarker());
        self.detailedInfoWindow(marker);
        //TODO: zoom in map and setcenter around current marker
    };

    self.toggleMarker = function(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.DROP);
        }
    }

    self.detailedInfoWindow = function(marker) {
        const venueIdRequest = new XMLHttpRequest();
        venueIdRequest.onload = self.getVenueId;
        venueIdRequest.onerror = function(err) {
            console.log("Error getting venue Id " + err);
        }

        var markerPos = marker.getPosition();
        var markerLat = markerPos.lat();
        var markerLng = markerPos.lng();
        console.log("marker position " + markerLat + " , " + markerLng);
        var markerName = marker.title;
        venueIdRequest.open('GET',
            `https://api.foursquare.com/v2/venues/search?ll=${markerLat},${markerLng}&name=${markerName}
                            &client_id=EDQTERY1IPD34QQA4NGCV0OI3QGKMQQM5SCSFXX04YDRIRPE
                            &client_secret=NCOEULIZXHH04MBAZTJDLUZIOF2D1YFKCCUP5OZEIX4CM1OU
                            &v=20170101`);
        venueIdRequest.send();
    }

    self.getVenueId = function() {
        var data = JSON.parse(this.response);
        console.log(data.response.venues);
        var venues = data.response.venues;

        for (var i = 0; i < venues.length; i++) {
            var venueName = venues[i].name;
            var markerTitle = self.currentMarker().title;

            if (self.checkVenueName(venueName, markerTitle)) {

                var venueId = venues[i].id;

                console.log("item id : " + venueId);
                console.log("name " + venueName);


                const venueDetailsRequest = new XMLHttpRequest();
                venueDetailsRequest.onload = self.venueDetails;
                venueDetailsRequest.onerror = function(err) {
                    console.log("Error getting venue details " + err);
                }

                venueDetailsRequest.open('GET', `https://api.foursquare.com/v2/venues/${venueId}?client_id=EDQTERY1IPD34QQA4NGCV0OI3QGKMQQM5SCSFXX04YDRIRPE
                                    &client_secret=NCOEULIZXHH04MBAZTJDLUZIOF2D1YFKCCUP5OZEIX4CM1OU&v=20170101`);
                venueDetailsRequest.send();
            }
        }
    }

    self.checkVenueName = function(venueName, markerTitle) {
        var venueArr = venueName.split(" ");
        var markerTitleArr = markerTitle.split(" ");
        if (venueName.includes(markerTitle)) {
            return true;
        } else {
            for (var i = 0; i < venueArr.length; i++) {
                for (var j = 0; j < markerTitleArr.length; j++) {
                    if (venueArr[i].includes(markerTitleArr[j])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    self.venueDetails = function() {
        var marker = self.currentMarker();
        console.log("venue data");
        var data = JSON.parse(this.response);
        console.log(data);
        var venueUrl = self.getVenueUrl(data);
        var venueHours = self.getVenueHours(data);
        var venueLoc = self.getVenueLoc(data);
        var venuePic = self.getVenuePic(data);
        var infoStr = `<div> <p> ${marker.title} </p>
                        <p> ${venueLoc} </p>
                        <img src=${venuePic}>
                        <a href=${venueUrl}> ${venueUrl} </a>
                        <p> ${venueHours} </p>
                        </div>`;
        self.miniInfoWindow.setContent(infoStr);
        self.miniInfoWindow.open(map, marker);
        self.miniInfoWindow.addListener('closeclick', function() {
            self.miniInfoWindow.marker = null;
        });
    }

    self.getVenuePic = function(data) {
        if (typeof(data.response.venue.bestPhoto) != 'undefined') {
            return `${data.response.venue.bestPhoto.prefix}50x50${data.response.venue.bestPhoto.suffix}`;
        } else {
            return data.response.venue.canonicalUrl;
        }
    }

    self.getVenueUrl = function(data) {
        if (typeof(data.response.venue.url) != 'undefined') {
            return data.response.venue.url;
        } else {
            return data.response.venue.canonicalUrl;
        }
    }

    self.getVenueLoc = function(data) {
        if (typeof(data.response.venue.location.address) != 'undefined') {
            return data.response.venue.location.address;
        } else {
            return "";
        }
    }

    self.getVenueHours = function(data) {
        if (typeof(data.response.venue.hours) != 'undefined') {
            return data.response.venue.hours.status;
        } else {
            return "";
        }
    }

    self.getVenueImage = function(data) {
        if (typeof(data.response.venue.url) != 'undefined') {
            return data.response.venue.url;
        } else {
            return data.response.venue.canonicalUrl;
        }
    }

    self.clearMarkers = function() {
        console.log("clearing markers");
        for (var i = 0; i < self.markerArray().length; i++) {
            self.markerArray()[i].setMap(null);
        }
    }
}

ko.applyBindings(new ViewModel());