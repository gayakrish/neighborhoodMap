var ViewModel = function() {
    var self = this;
    self.markerArray = ko.observableArray([]);
    self.searchText = ko.observable('');
    self.searchList = [];

    //location of Fort Collins, CO
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
        radius: '2000',
        types: ['restaurant']
    };
    self.service = new google.maps.places.PlacesService(self.map);
    self.currentMarker = ko.observable('');

    self.detailedInfoWindow = new google.maps.InfoWindow();
    self.miniInfoWindow = new google.maps.InfoWindow();

    //to handle hamburger menu visibility
    self.menuVisible = ko.observable(false);

    google.maps.event.addDomListener(window, "resize", function() {
        var center = self.map.getCenter();
        google.maps.event.trigger(self.map, "resize");
        self.map.setCenter(center);
    });

    //setting this flag helps in resetting the markers when no text is entered in the search box
    self.isStart = true;

    //this is to get the requested places and place markers after the map is loaded
    self.service.nearbySearch(self.request, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                var marker = self.createMarker(place.geometry.location, place.name);
                self.markerArray.push(marker);
                self.searchList.push(marker);
                self.bounds.extend(marker.position);
            }
            self.map.fitBounds(self.bounds);
        } else {

            //if there is no information regarding the search text, appropriate error message is displayed
            if (self.searchText() !== '') {
                window.alert("We could not find that location - please try again with another search term");
                self.searchText('');
            }
        }
    });

    //resets the markers when the search box is clicked and no search text
    self.resetMarker = function() {
        self.markerArray(self.searchList);
        for (var i = 0; i < self.markerArray().length; i++) {
            self.markerArray()[i].setMap(self.map);
        }
    };

    //this function is to open the info window with just the title when there is a mouseover event on the marker or list item
    self.openminiInfoWindow = function(marker) {
        var infoStr = `<div class="info">${marker.title}</div>`;
        self.miniInfoWindow.setContent(infoStr);
        self.miniInfoWindow.open(self.map, marker);
        self.miniInfoWindow.addListener('closeclick', function() {
            self.miniInfoWindow.marker = null;
        });
    };

    //this is to exit the infowindow on mouseout event on the marker or the list item
    self.closeminiInfoWindow = function(marker) {
        self.miniInfoWindow.marker = null;
    };

    //creates a marker at the given location and name, registers event listeners
    self.createMarker = function(location, name) {
        var marker = new google.maps.Marker({
            map: self.map,
            position: location,
            title: name,
            animation: google.maps.Animation.DROP,
            optimized: false,
            zoomControl: true,
            scaleControl: true
        });

        marker.addListener('click', function() {
            self.setCurrentMarker(marker);
        });

        marker.addListener('mousedown', function() {
            self.setCurrentMarker(marker);
        });

        marker.addListener('mouseover', function() {
            self.openminiInfoWindow(marker);
        });

        marker.addListener('mouseout', function() {
            self.closeminiInfoWindow(marker);
        });

        return marker;
    };

    //when a new search text is entered, this function retrieves relevant places and displays markers on each of them
    self.updateMarker = ko.computed(function() {
        if (self.searchText() !== '') {
            self.isStart = false;
            self.clearMarkers();

            for (var i = 0; i < self.searchList.length; i++) {
                var place = self.searchList[i];
                if (place.title.toLowerCase().indexOf(self.searchText().toLowerCase()) >= 0) {
                    var marker = self.searchList[i];
                    marker.setMap(self.map);
                    self.markerArray.push(marker);
                    // self.bounds.extend(marker.position);
                }
            }

            if (self.markerArray().length > 0) {
                self.map.fitBounds(self.bounds);
            } else {
                window.alert("We could not find that location - please try again with another search term");
                self.searchText('');
                self.resetMarker();
            }
        } else {
            if (!self.isStart) {
                self.resetMarker();
            }
        }
    });

    //this function is called when a marker is clicked, this opens a detailed info window with data from foursquare api
    self.setCurrentMarker = function(marker) {
        self.currentMarker(marker);
        self.toggleMarker(self.currentMarker());
        self.detailedInfoWindow(marker);
    };

    //this is to animate the clicked or selected marker
    self.toggleMarker = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 700);
    };

    //this method sends an Ajax request to foursquare and gets the venues at the specified latlng
    self.detailedInfoWindow = function(marker) {
        self.menuVisible(false);
        var markerPos = marker.getPosition();
        var markerLat = markerPos.lat();
        var markerLng = markerPos.lng();
        var markerName = marker.title;

        fetch(`https://api.foursquare.com/v2/venues/search?ll=${markerLat},${markerLng}&name=${markerName}
                &intent=match&city='Fort Collins'
                &client_id=2U1TKXY4EE4QIQTT02IEET2QXTTXYYFIZ3LRCJA35ERGUJGM
                &client_secret=R2UDUI5BZR0K52Y2IQSNKVZEA3WLOUETFID3YRADQAB33NZ4
                &v=20170101`)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                self.getVenueId(data);
            })
            .catch(function(error) {
                self.ajaxError();
            });
    };


    //from the venue data from Ajax response, we extract the exact or matching venue's venue id
    self.getVenueId = function(data) {
        var venues = data.response.venues;
        var venueName = venues[0].name;
        var markerTitle = self.currentMarker().title;
        var venueId = venues[0].id;
        fetch(`https://api.foursquare.com/v2/venues/${venueId}?client_id=2U1TKXY4EE4QIQTT02IEET2QXTTXYYFIZ3LRCJA35ERGUJGM
                &client_secret=R2UDUI5BZR0K52Y2IQSNKVZEA3WLOUETFID3YRADQAB33NZ4&v=20170101`)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                self.venueDetails(data);
            })
            .catch(function(error) {
                self.ajaxError();
            });
    };

    //after obtaining the venue is, details about the specific venue are retrieved from JSON response and displayed in the infowindow
    self.venueDetails = function(data) {
        var marker = self.currentMarker();
        var venueUrl = self.getVenueUrl(data);
        var venueHours = self.getVenueHours(data);
        var venueLoc = self.getVenueLoc(data);
        var venuePic = self.getVenuePic(data);
        if (venuePic === "") {
            venuePic = `images/no-image-icon.png`;
        }
        var infoStr = `<div id="content">
                            <table class="info">
                            <tr> <th colspan="3"> <h4> ${marker.title} </h4> </th></tr>
                            <tr>
                            <td rowspan="3" colspan="1"> <img src='${venuePic}' height=50 width=50> </td>
                            <td colspan="2">${venueLoc} <br>
                            <a href=${venueUrl}> ${venueUrl} </a> <br>
                            ${venueHours} <br>
                            <div class="source">
                            Source: <a href="https://foursquare.com/" class="source"> https://foursquare.com </a>
                            </div>
                            </td>
                            </tr>
                            </table>
                            </div>`;
        self.miniInfoWindow.setContent(infoStr);
        self.miniInfoWindow.open(map, marker);
        self.miniInfoWindow.addListener('closeclick', self.miniInfoWindowClose);
    };

    //close action for the mini infoWindow
    self.miniInfoWindowClose = function() {
        self.miniInfoWindow.marker = null;
    };

    //retrieve the venue's pic url from the JSON response
    self.getVenuePic = function(data) {
        if (typeof(data.response.venue.bestPhoto) != 'undefined') {
            return `${data.response.venue.bestPhoto.prefix}50x50${data.response.venue.bestPhoto.suffix}`;
        } else {
            return "";
        }
    };

    //retrieve the venue's website details from the JSON response
    self.getVenueUrl = function(data) {
        if (typeof(data.response.venue.url) != 'undefined') {
            return data.response.venue.url;
        } else {
            return data.response.venue.canonicalUrl;
        }
    };

    //retrieve the venue's address from the JSON response
    self.getVenueLoc = function(data) {
        if (typeof(data.response.venue.location.address) != 'undefined') {
            return data.response.venue.location.address;
        } else {
            return "";
        }
    };

    //retrieve the venue's open-close hours from the JSON response
    self.getVenueHours = function(data) {
        if (typeof(data.response.venue.hours) != 'undefined') {
            return data.response.venue.hours.status;
        } else {
            return "";
        }
    };

    //this function clears the existing markers when a new search text is entered
    self.clearMarkers = function() {
        for (var i = 0; i < self.markerArray().length; i++) {
            self.markerArray()[i].setMap(null);
        }
        self.markerArray([]);
    };

    //this is to handle the visibility of the hamburger menu
    self.toggleMenu = function() {
        self.menuVisible(!self.menuVisible());
    };

    //this is to handle and display the appropriate error message
    self.ajaxError = function(err) {
        console.log("Error getting venue details " + err);
        var infoStr = `<div id="content"> <p class="info"> Couldn't find information about this place. Sorry! </p>
                       </div>`;
        self.miniInfoWindow.setContent(infoStr);
        self.miniInfoWindow.open(self.map, self.currentMarker());
        self.miniInfoWindow.addListener('closeclick', self.miniInfoWindowClose);
    };
};

function initApp() {
    ko.applyBindings(new ViewModel());
}

function mapError() {
    window.alert("Unable to load the Google Map. Please try again later");
}