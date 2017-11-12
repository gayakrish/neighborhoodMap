# NeighborhoodMap of Fort Collins, CO #

This project displays a list of restaurants around the downtown neighborhood of the city of Fort Collins, CO. Live version can be found [here](https://gayakrish.github.io/neighborhoodMap/)

## How to Launch ##

1. Access the live link [here](https://gayakrish.github.io/neighborhoodMap/)
                    (or)
2. Download and extract the zip file from this repository. Open index.html from your browser and explore the map.

## How to Explore the Map

1. When you launch the map, it displays a list of **Restaurants** in the downtown neighborhood. These locations are obtained via the Google Maps Places API given the LatLng of the downtown neighborhood in Fort Collins, CO. Markers are placed on these locations. 
2. As you move the mouse across each item in the list or over the markers, the name of location is displayed.
3. If you need more information about a location, then you can click on the marker or on the item in the list.
4. Detailed information about each location has been retrieved from Foursquare API.
5. The **Search** box can be used to filter locations within the list of restaurants provided. 
6. It is a live search box where as you type you can filter/narrow to your choice of locations in the list provided.
7. On the smaller screens i.e less than 750px or so, the search list is hidden and is displayed when the list icon is clicked.

## APIs and Frameworks ##
1. [Knockout.js](http://knockoutjs.com/documentation/introduction.html) is used for updating the DOM elements. It is included in the zip file.
2. [Google Map](https://developers.google.com/maps/documentation/javascript/) is used for rendering the map, search places and display markers.
3. [Foursquare API](https://developer.foursquare.com/) is used for obtaining detailed information about a location. Ajax request is used for connecting with Foursquare.

## Testing ##
This game has been tested on Chrome, Microsoft Edge, Opera and Mozilla Firefox browsers. It has also been tested on different screen sizes using the Chrome Dev Tools device emulator, Samsung Galaxy S6, Samsung Galaxy S7 Edge mobile phones, Ipad Pro 9.7.

## Credits ##
1. 'No photo icon' image was obtained from [freeiconspng](http://www.freeiconspng.com/img/23494)
2. [Live Search Example using Knockout.js](https://opensoul.org/2011/06/23/live-search-with-knockoutjs/)
