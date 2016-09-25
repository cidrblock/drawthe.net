var drawObjects = function (svg, drawing, objects) {
  var deviceCellsAll = svg.selectAll("cells")
    .data(d3.entries(objects))
    .enter()

  var cells = deviceCellsAll.append("g")
    .attr("transform", function(d) { return "translate(" + diagram.xBand(d.value.x) + "," + diagram.yBand(d.value.y) + ")" })

  var cellFill = cells
    .append("rect")
    .attr("rx", diagram.xBand.bandwidth() * .05)
    .attr("ry", diagram.yBand.bandwidth() * .05)
    .attr("width", diagram.xBand.bandwidth() )
    .attr("height", diagram.yBand.bandwidth() )
    .attr("id", function(d) { return d.key })
    .attr("fill", function(d) { return d.value.backgroundColor })
    .style("stroke", function(d) { return d.value.borderColor || 'none' })

  var cellText = cells
    .append("text")
    .text( function (d) { return d.key })
    .attr("x", diagram.xBand.bandwidth()/2 )
    .attr("y", diagram.yBand.bandwidth()*.95 )
    .attr("text-anchor", "middle")
    .style("font-size", function(d) { return Math.min(diagram.xBand.bandwidth()*.9 / this.getComputedTextLength() * 12, diagram.yBand.bandwidth()/3/2) + "px"; })
    .attr('fill', function(d) { return d.value.color || "white"} )

  var icon = cells
    .append('text')
    .attr("x", diagram.xBand.bandwidth()/2 )
    .attr("y", diagram.yBand.bandwidth() * .7)
    .attr('text-anchor', 'middle')
    // .attr("dominant-baseline", "middle")
    .style('font-family', function(d) { return d.value.font })
    .style('font-size', Math.min(diagram.xBand.bandwidth()*.9,diagram.yBand.bandwidth()*.8*.9)  + 'px')
    .attr('fill', function(d) { return d.value.iconColor || "white"} )
    .text(function (d) {
         return fonts[d.value.font][d.value.type];
      });
}
