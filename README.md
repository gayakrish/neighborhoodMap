# NeighborhoodMap of Fort Collins, CO #

This project is for displaying the Neighborhood Map of a locality in Fort Collins, CO. 

## How to Launch ##

Download and extract the zip file from this repository. Open index.html from your browser and explore the map.

## How to Explore the Map

1. By default, when you launch the map, it displays a list of **Parks** in the city. Markers are placed on these locations. 
2. As you move the mouse across each item in the list or over the markers, the name of location is displayed.
3. If you need more information about a location, then you can click on the marker or on the item in the list.
4. Detailed information about each location has been retrieved from Foursquare API.
5. The **Search** box can be used to search and find other places like restaurants, coffee shops, schools, university, bus routes etc. 
6. Enter the search term like "Coffee" or any specific shop say "Starbucks" and it will display all matching locations with markers in that locality.
7. On the smaller screens i.e less than 750px or so, the search list is hidden and is displayed when the list icon is clicked.

## APIs and Frameworks ##
1. [Knockout.js](http://knockoutjs.com/documentation/introduction.html) is used for updating the DOM elements. It is included in the zip file.
2. [Google Map](https://developers.google.com/maps/documentation/javascript/) is used for rendering the map, search places and display markers.
3. [Foursquare API](https://developer.foursquare.com/) is used for obtaining detailed information about a location. Ajax request is used for connecting with Foursquare.

## Testing ##
This game has been tested on Chrome, Microsoft Edge, Opera and Mozilla Firefox browsers. It has also been tested on different screen sizes using the Chrome Dev Tools device emulator, Samsung Galaxy S6 and Samsung Galaxy S7 Edge mobile phones.

## Credits ##
1. 'No photo icon' image was obtained from [freeiconspng](http://www.freeiconspng.com/img/23494)
