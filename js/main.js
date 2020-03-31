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
      .center([0, 25])
      // Rotation of reference globe
      .rotate([97, -17, 0])
      .parallels([35.5, 41])
      .scale(800)
      // Translate the map to keep it centered in the svg
      .translate([width / 2, height / 2]);

    // Path generator held within "path" variable
    var path = d3.geoPath()
      .projection(projection);

  // Promise.all waits for the last dataset to load to callback all of the datasets
  var promises = [];
  promises.push(d3.csv("data/VoteTurn_Eric_Duffin_Statista_2_3 3_17_CDC_3_24.csv"));
  promises.push(d3.json("data/StateCovid19Vote.topojson"));
  // The above methods are AJAX methods
  Promise.all(promises).then(callback);

  // Callback function
  function callback(data){
    csvData = data[0];
    states = data[1];
    console.log(csvData);
    console.log(states);

    // Translate TopoJSON to GEOJSON for compatibility with D3
    // Parameters: TopoJSON feature, object with dataset's details
    var statesGeoJson = topojson.feature(states, states.objects.StateCovid19Vote);

    // Add geographies to map
    var mapStates = map.append("path")
      .datum(statesGeoJson)
      .attr("class", "mapStates")
      .attr("d", path);
    console.log(mapStates);

    // Graticule generator
    var graticule = d3.geoGraticule()
      .step([5, 5]);

    // Graticule background create for contrasting color
    var gratBackground = map.append("path")
      .datum(graticule.outline())
      .attr("class", "gratBackground")
      .attr("d", path)

    // Add graticule to map
    var gratlines = map.selectAll(".gratlines")
      // graticule.lines binds the graticule to the selected elements
      .data(graticule.lines())
      .append("path")
      .attr("class", "gratlines")
      .attr("d", path);
  };
};
