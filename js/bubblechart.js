// Creating map for leaflet lab




// Map variable declared globally.
var leafletMap;

// Globally declared variable with min, max, and mean
var dataStats = {};

// Define variable globally to hold data
var attributes = ["2008","2009","2010","2011","2012","2013","2014","2015","2016","2017","2018"];


// Instantiate map, defining the initial viewpoint
function createMap(){
  leafletMap = L.map('mapid', {
    center: [-10,-70],
    zoom: 3,
  });
  // Set maximum and minimum zoom to maintain national scale
  leafletMap.options.maxZoom = 7;
  leafletMap.options.minZoom = 2;

  // Add OSM tile layer, will change basemap later
  L.tileLayer('https://api.mapbox.com/styles/v1/cjarchuleta/ck7mofxyh07e91iqvblhjbemz/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2phcmNodWxldGEiLCJhIjoiY2syYW9pcTAyMWV5ejNtbzZhM25zNnpsdSJ9.7Gl9zzKB40HnoFIWBW-Tvg'
        // attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        // id: 'mapbox/streets-v11',
        // accessToken: 'pk.eyJ1IjoiY2phcmNodWxldGEiLCJhIjoiY2syYW9pcTAyMWV5ejNtbzZhM25zNnpsdSJ9.7Gl9zzKB40HnoFIWBW-Tvg'
      ).addTo(leafletMap);

      // Call getData function
      getData();

};


// Calculate the mean value, the minimum absolute value,
// and the maximum absolute value within the dataset
//  to use the Flannery ratio
function calcStats(data){

  // Create empty array to hold data
  var allValues = [];

  // Loop through features for each year between 2008 and 2018,
  // incrementing by one year
  for(var country of data.features){
    for(var year = 2008; year <= 2018; year++){
      // Create a variable to store all of the relevant values
      var value = country.properties[String(year)];
      // Fill array with relevant values
      allValues.push(Math.abs(value));
    }
  }

  // Use the Math.min function to calculate minimum value in the array
  dataStats.min = Math.min(...allValues);
  // Repeat above process, but for the maximum value
  dataStats.max = Math.max(...allValues);

  // Calculate the mean (sum/n)
  var sum = allValues.reduce(function(a, b){return a+b});
  dataStats.mean = sum/ allValues.length;


};

function calcPropRadius(attValue) {

  // Changes the sizes of all of the symbols by changing the minimum radius
  var minRadius = 1.3;

  // Flannery scaling ratio
  var radius = 1.0083 * Math.pow(attValue/dataStats.min,0.5715) * minRadius

  return radius;
};


// function SymbolColors(layer, properties){
//   if (properties[attributes] < 0){
//     layer.setStyle({fillColor:"#d8b365"});
//   } else {
//     layer.setStyle({fillColor:"5ab4ac"});
//   };
// };


// Refactor redundant code in pointToLayer and updatePropSymbols by making one function
function createPopupContent(properties, attribute){
  // Add country name to popup
  var popupContent = "<p><b>Country:</b> " + properties[String("Country Name")] + "</p>";

  // Add rural population growth to popup
  var year = attribute.split("_")[1];
  popupContent += "<p><b>Rural Pop. Growth in " + attribute + ":<b> " + properties[attribute] + "%</p>";

  return popupContent;
};

// Build array for holding temporal data with function
// Create attributes array for accessing data by their indices
function processData(data){
  var attributes = [];

  // Properties of the first feature
  var properties = data.features[0].properties;

  // Push attribute names to fill the array
  for (var attribute in properties){
    // Get attributes for percent change in rural population
    // by having special prefix
    if (attribute.indexOf("2") > -1){
      attributes.push(attribute);
    };
  };

  return attributes;
};

// Create legend, which has temporal component and attribute component
function createLegend(){

  var LegendControl = L.Control.extend({
    options: {
      position: 'bottomright'
    },

    onAdd: function (leafletMap) {
      // Create a container div to put the legend in
      // Styles specified using 'legend-control-container'
      var container = L.DomUtil.create('div', 'legend-control-container');

//    Use span so that year can be specifically targeted by jQuery
      $(container).append('<div id="temporal-legend">Percent Rural Pop. Growth in <span id="year">2008</span></div>');

      // Attribute legend is an svg string because symbols are vectors
      var svg = '<svg id="attribute-legend" width="180px" height="95px">';


      // Create array for exemplar symbols in attribute legend
      var circles = ["max", "mean", "min"];
      // Add the three circles to the svg variable
      for (var i=0; i<circles.length; i++){

        // Set the radii and vertical placement of the circles
        var circleRadius = calcPropRadius(dataStats[circles[i]]);
        var cy = 90 - circleRadius;


        svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + circleRadius + '"cy="' + cy + '" fill="#ffffff" fill-opacity="0.9" stroke="#000000" cx="45px"/>';

      // Evenly space out labels
      var textY = i * 28 + 31;

      // Add labels to svg
      svg += '<text id="' + circles[i] + '-text" x="87" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + '</text>';

      // Add colored circles to legend for positive and negative values
      svg +='<circle class="legend-circle" id="Positive" r="5px"cy="20px" fill="#5ab4ac" fill-opacity="1.0" cx="150px"/>';
      svg +='<circle class="legend-circle" id="Negative" r="5px"cy="70px" fill="#d8b365" fill-opacity="1.0" cx="150px"/>';
      // Add labels to colored circles in attribute legend
      svg +='<text id="Pos" x="125" y="40">Positive</text>';
      svg +='<text id="Neg" x="125" y="90">Negative</text>';
    };

      // Close the svg string
      svg += "</svg>";


      // Use jQuery to target the container and add the svg variable to it
      $(container).append(svg);

      return container;
    }
  });

  leafletMap.addControl(new LegendControl());

  if ($(this).attr('id') == 'forward'){
    // Increment
    index++;
    // Make value go around if an end is surpassed
    index = index > 10 ? 0 : index;
    // Conditional statemnt for when reverse button is pressed
  } else if ($(this).attr('id') == 'reverse'){
    // Decrement
    index--;
    index = index < 0 ? 10 : index;
    // // Make proportional symbols reflect
    // // the current value from the attributes array
  };


};


function updateLegend(attribute){
//Target year element with jQuery and update with attribute

    $("span#year").text(attribute);
}

function updatePropSymbols(attribute){
  leafletMap.eachLayer(function(layer){
    // Only execute following code on the percent change in rural population
    if (layer.feature && layer.feature.properties[attribute]){
      var props = layer.feature.properties;
      //update each feature's radius based on new attribute values
      var radius = calcPropRadius(Math.abs(props[attribute]));

      // var symColors = new SymbolColors(props, attribute);

      // Set colors of the proportional symbols based on positive or negative growth
      if (props[attribute] < 0){
        layer.setStyle({fillColor:"#d8b365"});
      }
      else {
        layer.setStyle({fillColor:"#5ab4ac"});
      };

      layer.setRadius(radius);

      // Use consolidated popup content code
      var popupContent = createPopupContent(props, attribute);


      //update popup content
      popup = layer.getPopup();
      popup.setContent(popupContent).update();

      };
    });
};

// Create sequence controls using the L.control class
function createSequenceControls(attributes){
  var SequenceControl = L.Control.extend({
    options: {
      position: 'bottomleft'
    },

    onAdd: function() {
      // setting a variable for the control container
      var container = L.DomUtil.create('div', 'sequence-control-container');

      // Add slider bar
      $(container).append('<input class="range-slider" type="range">');

      // Add step buttons
      $(container).append('<button class="step" id="reverse">Backward</button>');
      $(container).append('<button class="step" id="forward">Forward</button>');


      // Disable mouse event listeners within container so that clicks
      // only affect sequnce controls
      L.DomEvent.disableClickPropagation(container);

      // Display the sequence control
      return container;
    }
  });

  leafletMap.addControl(new SequenceControl());

  // Replace step buttons with images
  $("button#reverse").html('<img src="img/StepBackward.png">');
  $("button#forward").html('<img src="img/StepForward.png">');
  // Step buttons created by Dmitriy Ivanov from Noun Project


  $('.range-slider').attr({
    max: 10,
    min: 0,
    value: 0,
    step: 1
  });

  $('.step').click(function(){
    // Records previous slider value
    var index = $('.range-slider').val();
    // Conditional statement for when forward button is pressed
    if ($(this).attr('id') == 'forward'){
      // Increment
      index++;
      // Make value go around if an end is surpassed
      index = index > 10 ? 0 : index;




      // Conditional statemnt for when reverse button is pressed
    } else if ($(this).attr('id') == 'reverse'){
      // Decrement
      index--;
      index = index < 0 ? 10 : index;
      // // Make proportional symbols reflect
      // // the current value from the attributes array

    };
//      Update the symbols and legend with each step button click
       updatePropSymbols(attributes[index]);

      updateLegend(attributes[index]);

    // Make proportional symbols reflect
    // the current value from the attributes array

    // Make range slider value equal the new index value
    $('.range-slider').val(index);
  });
// Event listener for the range slider,
// which keeps track of the value of the slider and reassigns it
  $('.range-slider').on('input', function(){
    var index = $(this).val();
    updatePropSymbols(attributes[index]);
       updateLegend(attributes[index]);
  });
};


// Add proportional symbols to the map after specifying their attributes
function createPropSymbols(data, attributes){


// Create function to keep pointToLayer in L.geoJSON uncluttered
  function pointToLayer(feature, latlng, attributes){
    //Choose attribute to visulaize with proportional symbols
    // Choose intial value for map and slider
    var attribute = attributes[0];

    //Create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    // Convert the attribute data type to number because data is derived from .csv
    // Make a variable to hold the attribute values
    // feature.properties is used because the attributes fall within the
    // "properties" group (see GeoJSON)
    var attValue = Number(feature.properties[attribute]);


    // symColors = SymbolColors(Number(feature.properties),attribute);

    // Use hue to differentiate between increase and decrease in rural population
    if (attValue < 0){
      options.fillColor = "#d8b365"
    } else {
      options.fillColor = "#5ab4ac"
    };

    // Use absolute value to create symbols with negative values
    options.radius = calcPropRadius(Math.abs(attValue));

    // Test the attribute value
    console.log(feature.properties, attValue);

    //Create circle marker layer
    var layer = L.circleMarker(latlng, options);

    // Create popup content with consolidated code
    var popupContent = createPopupContent (feature.properties, attribute);

    // return SymbolColors(layer, properties, attribute);

    //Bind the popup to the circle marker and create an offset
    layer.bindPopup(popupContent, {
      offset: new L.Point(0,-options.radius * 0.5)
    });


    //Return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

  L.geoJson(data, {
    pointToLayer: function(feature, latlng){
      // Add attributes to their respective proportional symbols
      return pointToLayer(feature, latlng, attributes);
    }
  }).addTo(leafletMap);
};

function onEachFeature(feature, layer) {
  var popupContent = "";
  // Where ever there are properties in a given feature,
  // a for loop creates popup content stating the properties
  if (feature.properties) {
    for (var property in feature.properties){
      popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
    }
    layer.bindPopup(popupContent);



  };
};

// Use AJAX for asynchronous data and page loading
function getData(){
    //load the data
    $.ajax("data/RuralPop.geojson", {
        dataType: "json",
        success: function(response){
            var attributes = processData(response);
            minValue = calcStats(response);
            //add symbols and UI elements
            createPropSymbols(response, attributes);
            createSequenceControls(attributes);
            createLegend();
            calcStats(response);


        }
    });
};

// Call createMap function once page elements are ready
$(document).ready(createMap);








































// // Creating test div to see results via Prepros and browser inspector
// var mydiv = document.getElementById("mydiv");
// mydiv.innerHTML = "Hello World";
//
// // Using window.onload to perform js functions after html elements load
// function myfunc(){
//   var mydiv = document.getElementById("mydiv");
//   mydiv.innerHTML = "Hello World.";
// };
//
// window.onload = myfunc();
//
// // Initialize function when page loads, which calls the table function
// function initialize(){
//   newTable();
// };
//
// // Native JS function method for printing GeoJson file via AJAX
// function jsAjax(){
//   // Create new request
//   var ajaxrequest = new XMLHttpRequest();
//
//   // Create event handler to send data to callback function,
//   // where it can be accessed
//   ajaxrequest.onreadystatechange = function(){
//     if (ajaxrequest.readystate == 4){
//       callback(ajaxrequest.response);
//     };
//   };
//
//   // Open the server connection with path and asynchronicity
//   ajaxrequest.open('GET', 'data/MegaCities.geojson', true);
//
//   // Set response data type
//   ajaxrequest.responseType = "json";
//
//   // Send the request
//   ajaxrequest.send();
// };
//
// // Callback function for when data loads in JS file
// function callback(response){
//   // Print the geoJson file in the callback function so
//   // it can be sent to server and back before user engagement
//   console.log(response);
// };
//
// // Shorthand jQuery AJAX method equivalent to functions above
// $.getJSON("data/MegaCities.geojson", callback);
//
// // Function for making new table
// function newTable(){
//   // Create arrays
//   var name = [
//     'Kitty',
//     'Oreo',
//     'Snowbell'
//   ];
//   var birthYear = [
//     2013,
//     2012,
//     2003
//   ];
//
//   // Make table element to be filled
//   var table = document.createElement("table");
//
//   // Make header row to be filled
//   var headerRow = document.createElement("tr");
//
//   // Add column for names
//   var nameColumn = document.createElement("th");
//   nameColumn.innerHTML = "Name";
//   headerRow.appendChild(nameColumn);
//
//   // Add column for birth years
//   var birthYearColumn = document.createElement("th");
//   birthYearColumn.innerHTML = "Birth Year";
//   headerRow.appendChild(birthYearColumn);
//
//   // Add row, with the columns appended to them, to the table
//   table.appendChild(headerRow);
//
//   // Add rows for each cat with a for loop
//   for (var i = 0; i < name.length; i++){
//     var tr = document.createElement("tr");
//
//     var cat = document.createElement("td");
//     cat.innerHTML = name[i];
//     tr.appendChild(cat);
//
//     var year = document.createElement("td");
//     year.innerHTML = birthYear[i];
//     tr.appendChild(year);
//
//     table.appendChild(tr);
//   };
//
//   // Add table to div in index.html
//   var mydiv = document.getElementById("mydiv");
//   mydiv.appendChild(table);
// };
//
// // Call the initialize function after elements load
// window.onload = initialize();
// // Use AJAX for data transfer afetr elements load
// window.onload = jsAjax();
// // Scripts by Chris Archuleta, 2020
