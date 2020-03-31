// Begin script when data loads
window.onload = setMap();

// Set up choropleth map
function setMap(){
  // Promise.all waits for the last dataset to load to callback all of the datasets
  var promises = [d3.csv("data/VoteTurn_Eric_Duffin_Statista_2_3 3_17_CDC_3_24.csv"),
                  d3.json("data/StateCovid19Vote.topojson")
                  // The above methods are AJAX methods
                ];
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

    console.log(statesGeoJson);
  };
};
