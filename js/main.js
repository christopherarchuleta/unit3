// Javascript by Christopher Archuleta, 2020




// ON USER SELECTION:
// Step 1. Change the expressed attribute
// Step 2. Recreate the color scale with new class breaks
// Step 3. Recolor each enumeration unit on the map
// Step 4. Re-sort each bar on the bar chart
// Step 5. Resize each bar on the bar chart
// Step 6. Recolor each bar on the bar chart






// Self-executing anonymous function that holds
// everything to avoid global variables
(function(){
  // Pseudo-global variables
  // var ss = {};
  var attrArray = ["Voter Turnout (Pct Of Total Population)", "OID", "COVID Cases Mar24", "Cases (Pct of Total Pop)"];
  var expressed = attrArray[3];
  var colorScale;

  // Chart dimensions
  var chartWidth = window.innerWidth * 0.425,
    chartHeight = 473,
    leftPadding = 35,
    rightPadding = 5,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

  // y-Scale of chart bars
  var yScale;



  // Begin script when data loads
  window.onload = setMap();


  // Set up choropleth map
  function setMap(){

    //Map frame projections
    // The width includes code for responsive web design
    // Width varies depending on the size of the browser window
    var width = window.innerWidth * 0.5,
        height = 460;

      // SVG container for map
      var map = d3.select("body")
        // Append svg to the body in index.html
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

      // Create Albers equal-area projection for continental US
      // Special generator method called a projection method
      var projection = d3.geoAlbers()
        // Center of developable surface, not the reference globe
        .center([0, 22])
        // Rotation of reference globe
        .rotate([97, -17, 0])
        .parallels([35.5, 41])
        .scale(930)
        // Translate the map to keep it centered in the svg
        .translate([width / 2, height / 2]);

      // Path generator held within "path" variable
      var path = d3.geoPath()
        .projection(projection);

    // Promise.all waits for the last dataset to load to callback all of the datasets
    var promises = [];
    promises.push(d3.csv("data/VoteTurn_Eric_Duffin_Statista_2_3 3_17_CDC_3_24.csv"));
    promises.push(d3.json("data/StateCovid19Vote.topojson"));
    promises.push(d3.json("data/GreatLakes.topojson"));
    promises.push(d3.json("data/countries.topojson"));
    promises.push(d3.json("data/usstates.topojson"));
    // The above methods are AJAX methods
    Promise.all(promises).then(callback);

    // Callback function
    function callback(data){
      csvData = data[0];
      states = data[1];
      lakes = data[2];
      nations = data[3];
      allStates = data[4];

      // Place graticule on the map
      setGraticule(map, path);


      // Translate TopoJSON to GEOJSON for compatibility with D3
      // Parameters: TopoJSON feature, object with dataset's details
      var statesGeoJson = topojson.feature(states, states.objects.StateCovid19Vote).features;
      var lakesGeoJson = topojson.feature(lakes, lakes.objects.GreatLakes);
      var nationsGeoJson = topojson.feature(nations, nations.objects.countries);
      var allStatesGeoJson = topojson.feature(allStates, allStates.objects.usstates);

      // Join csv data to GeoJSON EAs
      statesGeoJson = joinData(statesGeoJson, csvData);

      // Set color scale
      colorScale = makeColorScale(csvData);

      // Add geographies to map
      var mapNations = map.append("path")
        .datum(nationsGeoJson)
        .attr("class", "mapNations")
        .attr("d", path)


      var mapAllStates = map.append("path")
        .datum(allStatesGeoJson)
        .attr("class", "mapAllStates")
        .attr("d", path);

      setEnumerationUnits(statesGeoJson, map, path, colorScale);

      var mapLakes = map.append("path")
        .datum(lakesGeoJson)
        .attr("class", "mapLakes")
        .attr("d", path);

        // Add coordinated visualization to map
        setChart(csvData, colorScale);

        // Create dropdown menu
        createDropdown(csvData, setEnumerationUnits);


    };
  };


      function setGraticule(map, path){
            // Graticule generator
            var graticule = d3.geoGraticule()
              .step([5, 5]);

            // Graticule background create for contrasting color
            var gratBackground = map.append("path")
              .datum(graticule.outline())
              .attr("class", "gratBackground")
              .attr("d", path)

              // Add graticule to map
            var gratLines = map.selectAll(".gratLines")
              // graticule.lines binds the graticule to the selected elements
              .data(graticule.lines())
              .enter()
              .append("path")
              .attr("class", "gratLines")
              .attr("d", path);
            };




      function joinData(statesGeoJson, csvData){
        // Variables for data join from csv
        var attrArray = ["Voter Turnout (Pct Of Total Population)", "OID", "COVID Cases Mar24", "Cases (Pct of Total Pop)"];
        // var expressed = attrArray[2];

        // Assign CSV attributes to GeoJSON with each loop
        for (var i=0; i<csvData.length; i++){
          // Index EAs
          var csvRegion = csvData[i];
          // "name" is the joining field
          var csvKey = csvRegion.name;

          // Loop through GeoJson EAs to find correct one
          for (var a=0; a<statesGeoJson.length; a++){

            // Properties of current EA
            var geojsonProps = statesGeoJson[a].properties;
            var geojsonKey = geojsonProps.name;

            // Conditional statement to transfer csv data when names match
            if (geojsonKey == csvKey){
              // When the condition is met, assign all attributes and values
              attrArray.forEach(function(attr){
                // Make variable equal to csv value
                var val = parseFloat(csvRegion[attr]);
                // Assign value to GeoJSON
                geojsonProps[attr] = val;
              });
            };
          };
        };
        return statesGeoJson;
      };

      function setEnumerationUnits(statesGeoJson, map, path, colorScale){
        // Select all to individualize states

        var mapStates = map.selectAll(".mapStates")
          .data(statesGeoJson)
          .enter()
          .append("path")
          // Assign a unique class to each region based on joined data
          .attr("class", function(d){
            // Space after mapStates so that multiple
            // styles can be added to HTML element

            return "mapStates " + d.properties.name;
          })
          .attr("d", path)
          .style("fill", function(d){

            var value = d.properties[expressed];

            // Add color only if there is a value
            if(value) {
            	return colorScale(d.properties[expressed]);
            } else {
            	return "#ccc";
            }
          })
          // Highlighting for feedback and linking views in interface
          .on("mouseover", function(d){
            highlight(d.properties);
          })
          .on("mouseout", function(d){
            dehighlight(d.properties);
          });
        // Style descriptor for SVG element allows entire style to be selected
        // See dehighlighting
        var desc = mapStates.append("desc")
          // Text below is JSON
          .text('{"stroke": "#636363", "stroke-width": "0.5"}');

      };

      // Color scale generator function
      function makeColorScale(csvData){
        var colorClasses = [
          "#fef0d9",
          "#fdcc8a",
          "fc8d59",
          "e34a33",
          "b30000"
        ];
        // Color scale courtesy of Color Brewer

        // Color scale generator
        // scaleThreshold stretches or compresses data
        // into range of discrete values
        var colorScale = d3.scaleThreshold()
          .range(colorClasses);

        // Array of all data values necessary for
        // new values and clustering to work

        var domainArray = [];
          for (var i=0; i<csvData.length; i++){
            var val = parseFloat(csvData[i][expressed]);
            domainArray.push(val);
          };

          // To make a natural breaks classification,
          // use an algorithm to optimize clustering

          var clusters = ckmeans(domainArray, 5);
          // Use cluster minimum to set breaks
          domainArray = clusters.map(function(d){
            return d3.min(d);
          });
          // Remove first value from domain array for logical breakpoints
          domainArray.shift();

        // Remaining cluster minmums become class breaks
        colorScale.domain(domainArray);

        return colorScale;
      };

      // Creates bar chart (coordinated visualization)
      function setChart(csvData, colorScale){


        // Creates svg element that holds bar chart
        var chart = d3.select("body")
          .append("svg")
          .attr("width", chartWidth)
          .attr("height", chartHeight + 70)
          .attr("class", "chart");

        var chartBackground = chart.append("rect")
          .attr("class", "chartBackground")
          .attr("width", chartInnerWidth)
          .attr("height", chartInnerHeight)
          .attr("transform", translate);




        // Vertical scaling of bars relative to frame
        yScale = d3.scaleLinear()
          .range([chartHeight, 0])
          .domain([d3.min(csvData, function (d) {
                return (parseFloat(d[expressed]));
            }),
            d3.max(csvData, function (d) {
                return (parseFloat(d[expressed])) * 1.1;
            })]);



        // Set bars for each state
        var bars = chart.selectAll(".bar")
          .data(csvData)
          .enter()
          .append("rect")
          // Sort compares successive values to display them in order
          .sort(function(a, b){
            return b[expressed]-a[expressed]
          })
          .attr("class", function(d){
            return "bar " + d.name;
          })
          // Size and position of rectangles based on index value
          // Width of n/1 would result in adjacent bars
          // n/1 - 1 allows for spaces between them
          .attr("width", chartWidth / csvData.length - 2.25)
          .attr("x", function(d, i){
            return i * (chartInnerWidth / csvData.length) + leftPadding;
          })
          .attr("height", function(d, i){
            return chartHeight - yScale(parseFloat(d[expressed]));
          })
          .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
          })
          .style("fill", function(d){
            return colorScale(d[expressed]);
          })
          .on("mouseover", highlight)
          .on("mouseout", dehighlight);

        var desc = bars.append("desc")
          .text('{"stroke": "none", "stroke-width": "0px"}');



        var chartName = chart.append("text")
          .attr("x", 90)
          .attr("y", 40)
          .attr("class", "chartName")


        var yAxis = d3.axisLeft()
            .scale(yScale);



        var axis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", translate)
            .call(yAxis);

        //create frame for chart border
        var chartFrame = chart.append("rect")
            .attr("class", "chartFrame")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight + 10)
            .attr("transform", translate);

        updateChart(bars, csvData.length, colorScale);

        // Append text to a block so the bars make sense to the user
        // var numbers = chart.selectAll(".numbers")
        //   .data(csvData)
        //   .enter()
        //   .append("text")
        //   .sort(function(a, b){
        //     return a[expressed]-b[expressed]
        //   })
        //   .attr("class", function(d){
        //     return "numbers " + d.name;
        //   })
        //   .attr("text-anchor", "middle")
        //   .attr("x", function (d, i){
        //     var fraction = chartWidth / csvData.length;
        //     return i * fraction + (fraction - 1) / 2;
        //     console.log("Hello");
        //   })
        //   // Labels placed inside the bars
        //   .attr("y", function(d){
        //     return chartHeight - yScale(parseFloat(d[expressed])) + 15;
        //   })
        //   .text(function(d){
        //     return d[expressed];
        //   });
        };

  //Enable reexpress with dropdown menu of attributes
  function createDropdown(csvData, map){
      //Append select element to DOM
      var dropdown = d3.select("body")
          .append("select")
          .attr("class", "dropdown")
          // Event listener
          .on("change", function(){
            changeAttribute(this.value, csvData, map);
            console.log("he");
          });

      //Options are required for menu buttons
      // This option serves as affordance and cannot be selected(disabled)
      var titleOption = dropdown.append("option")
          .attr("class", "titleOption")
          .attr("disabled", "true")
          .text("Select Attribute");

      //Attribute name options based on the attributes in attrArray
      var attrOptions = dropdown.selectAll("attrOptions")
          .data(attrArray)
          .enter()
          .append("option")
          .attr("value", function(d){ return d })
          .text(function(d){ return d });
  };

  // Change listener, which reacts to change in dropdown menu
  function changeAttribute(attribute, csvData, map){
    // Change the expressed attribute
    expressed = attribute;

    // Update color sclae to new attribute
    var colorScale = makeColorScale(csvData);

    // Recolor states
    var mapStates = d3.selectAll(".mapStates")
      // Add transition of 1000 milliseconds for improved feedback
      .transition()
      .duration(1000)
      .style("fill", function(d){

        var value = d.properties[expressed];

        // Add color only if there is a value
        if(value) {
          return colorScale(d.properties[expressed]);
        } else {
          return "#ccc";
        }
      });


      //Make bars respond to attribute reexpress
      var bars = d3.selectAll(".bar")
          //Re-sort bars
          .sort(function(a, b){
              return b[expressed] - a[expressed];
          })
          .transition()
          // Delay for bars relative to each other so they move at different times
          .delay(function(d, i){
            return i * 20
          })
          .duration(500);

        updateChart(bars, csvData.length, colorScale);
  };

    // Set position, size, and color of chart bars
    function updateChart(bars, n, colorScale){
      // Update yScale
      yScale = d3.scaleLinear()
        .range([chartHeight, 0])
        .domain([d3.min(csvData, function (d) {
              return (parseFloat(d[expressed]));
          }),
          d3.max(csvData, function (d) {
              return (parseFloat(d[expressed])) * 1.1;
          })]);

      bars.attr("x", function(d, i){
        return i * (chartInnerWidth / n) + leftPadding;
      })
      .attr("height", function(d, i){
        return chartHeight - yScale(parseFloat(d[expressed]));
      })
      .attr("y", function(d, i){
        return yScale(parseFloat(d[expressed])) + topBottomPadding;
      })
      // Color bars
      .style("fill", function(d){
        var value = d[expressed];
        if(value) {
          console.log(attrArray);
          return colorScale(value);
        } else {
          return "#ccc";
        }
      });
      var chartTitle = d3.selectAll(".chartTitle")
        .attr("x", 90)
        .attr("y", 40)
        .text("jkjk");

    };

    //Highlight function
    function highlight(props){
        //Change stroke
        var selected = d3.selectAll("." + props.name)
            .style("stroke", "black")
            .style("stroke-width", "1");
    };

    // Dehighlight function
    // Style reset on mouseout
    function dehighlight(props){
    var selected = d3.selectAll("." + props.name)
      // Each style spec (ex: stroke) determined by style descriptor of selection
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        });

    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();

        // Use JSON syntax to get different style elements like stroke
        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
    };
};




// End of wrapper function
})();
