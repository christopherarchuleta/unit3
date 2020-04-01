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


    // Translate TopoJSON to GEOJSON for compatibility with D3
    // Parameters: TopoJSON feature, object with dataset's details
    var statesGeoJson = topojson.feature(states, states.objects.StateCovid19Vote);
    var lakesGeoJson = topojson.feature(lakes, lakes.objects.GreatLakes);
    var nationsGeoJson = topojson.feature(nations, nations.objects.countries);
    var allStatesGeoJson = topojson.feature(allStates, allStates.objects.usstates);

    // Graticule generator
    var graticule = d3.geoGraticule()
      .step([5, 5]);

    // Graticule background create for contrasting color
    var gratBackground = map.append("path")
      .datum(graticule.outline())
      .attr("class", "gratBackground")
      .attr("d", path);

      // Add graticule to map
    var gratLines = map.selectAll(".gratLines")
      // graticule.lines binds the graticule to the selected elements
      .data(graticule.lines())
      .enter()
      .append("path")
      .attr("class", "gratLines")
      .attr("d", path);



    // Add geographies to map
    var mapNations = map.append("path")
      .datum(nationsGeoJson)
      .attr("class", "mapNations")
      .attr("d", path);

    var mapAllStates = map.append("path")
      .datum(allStatesGeoJson)
      .attr("class", "mapAllStates")
      .attr("d", path);

    var mapStates = map.append("path")
      .datum(statesGeoJson)
      .attr("class", "mapStates")
      .attr("d", path);

    var mapLakes = map.append("path")
      .datum(lakesGeoJson)
      .attr("class", "mapLakes")
      .attr("d", path);




  };
};
