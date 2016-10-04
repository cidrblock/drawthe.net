var drawGroups = function (svg, diagram, groups, icons) {
    for (var group in groups) {
      svg.append("rect")
         .attr("x", groups[group].x1)
         .attr("y", groups[group].y1)
         .attr("rx", diagram.xBand.bandwidth() * .05)
         .attr("ry", diagram.yBand.bandwidth() * .05)
         .attr("width", groups[group].width )
         .attr("height", groups[group].height )
         .attr("fill", function(d) { return groups[group].fill || 'orange' })
         .style("stroke", function(d) { return groups[group].stroke || 'orange' })
         .style("stroke-dasharray", groups[group].strokeDashArray || [0,0])
         .style("stroke-width", groups[group].strokeWidth || 1 )


      if (groups[group].name) {
        var textLocation = textPositions(groups[group].x1,groups[group].y1,groups[group].x2,groups[group].y2, groups[group].fontSize + 2 )[groups[group].textLocation || 'topLeft']
        svg.append("text")
          .attr('class', 'groupLabel')
          .text( groups[group].name )
          .attr("transform", "translate(" + textLocation.x + "," + textLocation.y + ")rotate(" + textLocation.rotate + ")")
          .attr("text-anchor", textLocation.textAnchor)
          .attr("dominant-baseline", "central")
          .style("font-size", groups[group].fontSize + "px")
          .attr('fill', function(d) { return groups[group].color || "orange"} )
      }
    }
}
