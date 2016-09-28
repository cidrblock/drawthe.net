var drawGroups = function (svg, diagram, groups, objects) {
    for (var group in groups) {
      var xpad = (diagram.xBand.step() - diagram.xBand.bandwidth()) * diagram.groupPadding
      var ypad = (diagram.yBand.step() - diagram.yBand.bandwidth()) * diagram.groupPadding

      svg.append("rect")
         .attr("x", groups[group].x1)
         .attr("y", groups[group].y1)
         .attr("rx", diagram.xBand.bandwidth() * .05)
         .attr("ry", diagram.yBand.bandwidth() * .05)
         .attr("width", groups[group].width )
         .attr("height", groups[group].height )
         .attr("fill", function(d) { return d3.color(groups[group].fill) || 'none' })
         .style("stroke", function(d) { return d3.color(groups[group].stroke) || 'white' })
      if (groups[group].name) {
        var textLocation = textPositions(groups[group].x1,groups[group].y1,groups[group].x2,groups[group].y2, xpad/3, ypad/3 )[groups[group].textLocation || 'topLeft']
        svg.append("text")
          .text( groups[group].name )
          .attr("transform", `translate(${textLocation.x},${textLocation.y})rotate(${textLocation.rotate})`)
          .attr("text-anchor", textLocation.textAnchor)
          .style("font-size", function(d) { return Math.min(diagram.xBand.bandwidth()*.9 / this.getComputedTextLength() * 12, diagram.yBand.bandwidth()/3/2) + "px"; })
          .attr('fill', function(d) { return groups[group].color || "white"} )
      }
    }
}
