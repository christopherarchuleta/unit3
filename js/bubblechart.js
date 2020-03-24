// Creating map for D3 lab

//Load window, then execute script
window.onload = function(){


    // SVG dimension variables
    var w = 900, h = 500;

    // Just like jQuery, d3 can select elements from the DOM and work with them
    var container = d3.select("body")
    // The above container variable holds the selection of the HTML body
    // The variable is called "conatiner" because its svg is the operand
    // which will be affected by D3 operators
    // The append method below is a type of D3 operator, indented to form a block
    // This chain has to use D3 methods as defined above
      .append("svg")
      // Add attributes to the svg, including a class name to easily style and select it
      .attr("width", w)
      .attr("height", h)
      // Notice that the block name (variable name here) is used as class name
      .attr("class", "container")
      .style("background-color", "rgba(193,180,174,0.7)");
      // Semicolons go at the end of blocks only

    // A new element requires a new block
    var innerRect = container.append("rect")
    // This is a way to add an operand to a container without
    // overriding the svg operand(if "rect" was appended to last block)
      .datum(400)
      // The .datum method binds data to the D3 selection,
      // and anonymous functions for attributes will call the data
      .attr("width", function(d){
        return d * 2;
      })
      .attr("height", function(d){
        return d;
      })
      .attr("class", "innerRect")
      // x and y positions from top left
      .attr("x", 50)
      .attr("y",50)
      .style("fill", "#FFFFFF");

    // Create bubblechart

    // Create the scale before block creating the circles
    // The scale is of a continuous type
    // The operand of x is each datum in cityPop,
    // which is scaled according to the range and domain defined below
    // This is a generator since it interpolates new values
    var x = d3.scaleLinear()
      .range([90, 810])
      .domain([0, 3])
    var dataArray = [10, 20, 30, 40, 50];

    var cityPop = [
      {
        city: 'Madison',
        population: 233209
      },
      {
        city: 'Milwaukee',
        population: 594833
      },
      {
        city: 'Green Bay',
        population: 104057
      },
      {
        city: 'Superior',
        population: 27244
      }
    ];

    // get the minimum value of the array for scaling on the y-axis
    var minPop = d3.min(cityPop, function(d){
      return d.population;
    });

    var maxPop = d3.max(cityPop, function(d){
      return d.population;
    });

    var y = d3.scaleLinear()
    .range([440, 95])
    .domain([
      minPop,
      maxPop
    ]);

    // All elements called circles are selected here
    // selectAll is used to create different circles simultaneously
    var circles = container.selectAll(".circles")
      // Note that the name of the block is that of the class being selected
      .data(cityPop)
      .enter()
      // Enter joins the data, the array in this case, to the selected elements
      .append("circle")
      .attr("class", "circles")
      // For each datum, a circle is made and is included in ".circles"
      .attr("id", function(d){
        return d.city;
      })
      // Below are defining the attributes of the circles with anonymous functions
      .attr("r", function(d, i){
        var area = d.population * 0.01;
        return Math.sqrt(area/Math.PI);
      })
      .attr("cx", function(d, i){
        return x(i);
      })
      .attr("cy", function(d){
        return y(d.population);
      })
};
// // Scripts by Chris Archuleta, 2020
