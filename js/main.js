var locations = [
    {
        title: "Minya Governorate",
        loacation: {
            lat: 28.0871,
            lng: 30.7618
        }
    },
    {
        title: "Assiut Governorate",
        loacation: {
            lat: 27.1783,
            lng: 31.1859
        }
    },
    {
        title: "Sohag Governorate",
        loacation: {
            lat: 26.5591,
            lng: 31.6957
        }
    },
    {
        title: "Beni Suef Governorate",
        loacation: {
            lat: 29.0661,
            lng: 31.0994
        }
    },
    {
        title: "Cairo Governorate",
        loacation: {
            lat: 30.0444,
            lng: 31.2357
        }
    }
];

var markerArray = []; //arry of markers
var apiResults = []; //to store foursquare data
//ajax request to get lat & lng of each location then >> add the data to apiLocation of each location
for (let i = 0; i < locations.length; i++) {
    $.getJSON("https:api.foursquare.com/v2/venues/search?ll=" + locations[i].loacation.lat + "," + locations[i].loacation.lng + "&oauth_token=1DU14SXAZKWNOUEOHKO4VWNT5YQLEVKW2LGNDC4E4QG04JAC&v=20180421").done(function (data) {
        //when data successful loaded
        apiResults[i] = "<div>" + "lat : " + data.response.venues[i].location["lat"] + "<br> lng : " + data.response.venues[i].location["lng"] + "</div>";
    }).fail(function () {
        //when data failed to load
        alert("failed to get foursquare information");
    });
}

//function >> when google map failed to load
function googleError() {
    alert("failed to load the map ..try again");
}

//function to animate the marker
function toggleBounce(marker) {
    "use strict";
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

//onclick >> open infowindow for each marker with it's information
for (let i = 0; i < locations.length; i++) {
    function populateInfoWindow(marker, infowindow) {
        "use strict";
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker !== marker) {
            infowindow.marker = marker;
            //the content of each window has the location title with foursquare data
            infowindow.setContent('<h3>' + marker.title + "</h3>" + apiResults[i]);
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.setMarker = null;
            });
        }
        //onclick set toggleBounce function to the marker
        toggleBounce(marker);
        setTimeout(function () { //after 700 ms remove the animation
            marker.setAnimation(null);
        }, 700);
    }
}

function initMap() { //init map
    "use strict";
    var map = new google.maps.Map(document.getElementById('map'), { //options of the map
        zoom: 7,
        center: { //center of the map
            lat: 28.0871,
            lng: 30.7618
        }
    });


    var largeInfowindow = new google.maps.InfoWindow();
    //adding marker to each location 
    for (let i = 0; i < locations.length; i++) {
        var marker = new google.maps.Marker({
            position: locations[i].loacation,
            map: map,
            title: locations[i].title,
            animation: google.maps.Animation.DROP
        });
        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfowindow);
        });

        markerArray.push(marker);
        console.log(markerArray);
    }
    //view model
    var ViewModel = function () {
        //on click the list >> open it's infowindow
        this.selectedList = function (marker) {
            populateInfoWindow(marker, largeInfowindow);
        };


        var self = this;
        var filterResult;
        //observable array for current array of markers
        this.markers = ko.observableArray(markerArray);
        this.filteredMarkers = ko.observable();
        //observable to store markers
        this.filter = ko.observable("");
        //computed observable to filter markers
        this.filterAllMarkers = ko.computed(function () {
            if (!self.filter()) {
                filterResult = self.markers();
            } else {
                filterResult = ko.utils.arrayFilter(self.markers(), function (marker) {
                    return ((self.filter().length == 0 || marker.title.toLowerCase().includes(self.filter().toLowerCase())));
                });
            }

            //make not filtered markers not visisble
            for (let i = 0; i < self.markers().length; i++) {
                self.markers()[i].setMap(null);
            }
            //make filterd markers visisble
            for (let i = 0; i < filterResult.length; i++) {
                filterResult[i].setMap(map);
            }

            return filterResult;
        });
    };
    ko.applyBindings(new ViewModel());
}