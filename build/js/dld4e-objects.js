var drawObjects = function (svg, objects) {
  var deviceCellsAll = svg.selectAll("cells")
    .data(d3.entries(objects))
    .enter()

  var cells = deviceCellsAll.append("g")
    .attr("transform", function(d) { return "translate(" + diagram.xBand(d.value.x) + "," + diagram.yBand(d.value.y) + ")" })

  var cellFill = cells
    .append("rect")
    .attr("rx", function(d) { return d.value.rx })
    .attr("ry", function(d) { return d.value.ry })
    .attr("width", function(d) { return d.value.width })
    .attr("height", function(d) { return d.value.height })
    .attr("id", function(d) { return d.key })
    .attr("fill", function(d) { return d.value.fill || "orange"})
    .style("stroke", function(d) { return d.value.stroke || "orange" })

  var cellText = cells
    .append("text")
    .text( function (d) { return d.key })
    .attr("x", function(d) { return d.value.width/2 })
    .attr("y", function(d) { return d.value.height * .95})
    .attr("text-anchor", "middle")
    .style("font-size", function(d) { return Math.min(d.value.width*.9 / this.getComputedTextLength() * 12, d.value.height/3/2) + "px"; })
    .attr('fill', function(d) { return d.value.color || "orange"} )

  var icon = cells
    .append('text')
    .attr("stroke", function(d) { return d.value.iconStroke || "orange" } )
    .attr("stroke-width", function(d) { return d.value.iconStrokeWidth || 1 })
    .attr("x", function(d) { return d.value.width/2 })
    .attr("y", function(d) { return d.value.height * .7})
    .attr('text-anchor', 'middle')
    .style('font-family', function(d) { return d.value.font })
    .style('font-size', function(d) { return Math.min(d.value.width*.9,d.value.height*.8*.9)  + 'px' })
    .style("dominant-baseline", "alphabetic")
    .attr('fill', function(d) { return d.value.iconFill || "orange"} )
    .text(function (d) {
         return fonts[d.value.font][d.value.type];
      });
}
