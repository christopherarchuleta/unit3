// Self-executing anonymous function that holds
// everything to avoid global variables
(function(){
  // Begin script when data loads
  window.onload = setMap();

  // Set up choropleth map
  function setMap(){

    //Map frame projections
    var width = 960,
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
      var statesGeoJson = topojson.feature(states, states.objects.StateCovid19Vote);
      var lakesGeoJson = topojson.feature(lakes, lakes.objects.GreatLakes);
      var nationsGeoJson = topojson.feature(nations, nations.objects.countries);
      var allStatesGeoJson = topojson.feature(allStates, allStates.objects.usstates);

      // Join csv data to GeoJSON EAs
      statesGeoJson = joinData(statesGeoJson, csvData);


      // Set color scale
      // var colorScale = makeColorScale(data);

      // Add geographies to map
      var mapNations = map.append("path")
        .datum(nationsGeoJson)
        .attr("class", "mapNations")
        .attr("d", path)
        console.log((Object.values(csvData[0]))[4])
        console.log(statesGeoJson)

      var mapAllStates = map.append("path")
        .datum(allStatesGeoJson)
        .attr("class", "mapAllStates")
        .attr("d", path);

      setEnumerationUnits(statesGeoJson, map, path);

      var mapLakes = map.append("path")
        .datum(lakesGeoJson)
        .attr("class", "mapLakes")
        .attr("d", path);
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

        // Assign CSV attributes to GeoJSON with each loop
        for (var i=0; i<csvData.length; i++){
          // Index EAs
          var csvRegion = csvData[i];
          // "name" is the joining field
          var csvKey = csvRegion.name;

          // Loop through GeoJson EAs to find correct one
          for (var a=0; a<statesGeoJson.features.length; a++){

            // Properties of current EA
            var geojsonProps = statesGeoJson.features[a].properties;
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

      function setEnumerationUnits(statesGeoJson, map, path){
        var mapStates = map.append("path")
          .datum(statesGeoJson)
          .attr("class", "mapStates")
          .attr("d", path);
      };

      // Color scale generator function
      function makeColorScale(csvData){
        var colorClasses = [
          "#d4b9da",
          "#c994c7",
          "df65b0",
          "dd1c77",
          "980043"
        ];

        // Color scale generator
        // scaleQuantile stretched or compresses data
        // into range of discrete values
        var colorScale = d3.scaleQuantile()
          .range(colorClasses);

        // To make an equal interval classification,
        // use the minimum and maximum data values as the
        // extrema of the new range
        var minmax = [
          d3.min(csvData, function(d) { return parseFloat(d[expressed]); }),
          d3.max(csvData, function(d) { return parseFloat(d[expressed]); })
        ];
        colorScale.domain(minmax);
        console.log(colorScale.quantiles());

        return colorScale;
      };


// End of wrapper function
})();
