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
      .style("background-color", "rgba(0,100,0,0.2)");
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
};
// // Scripts by Chris Archuleta, 2020
