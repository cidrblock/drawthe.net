function textPositions(x1, y1, x2, y2, xpad, ypad ) {
  var positions = {
    topLeft: { x: x1 + xpad, y: y1 + (2*ypad + ypad/2), textAnchor: "start", rotate: 0 },
    topMiddle: { x: (x2 - x1)/2 + x1 , y: y1 + (2*ypad + ypad/2), textAnchor: "middle", rotate: 0},
    topRight: { x: x2 - xpad, y: y1 + (2*ypad + ypad/2), textAnchor: "end", rotate: 0 },
    leftTop: { x: x1 + (2*xpad + xpad/2), y: y1 + ypad, textAnchor: "end", rotate: -90},
    leftMiddle: { x: x1 + (2*xpad + xpad/2), y: (y2-y1)/2 + y1, textAnchor: "middle", rotate: -90},
    leftBottom: { x: x1 + (2*xpad + xpad/2), y: y2 - ypad, textAnchor: "start", rotate: -90},
    rightTop: { x: x2 - (2*xpad + xpad/2), y: y1 + ypad, textAnchor: "start", rotate: 90},
    rightMiddle: { x: x2 - (2*xpad + xpad/2), y: (y2-y1)/2 + y1, textAnchor: "middle", rotate: 90},
    rightBottom: { x: x2 - (2*xpad + xpad/2), y: y2 - ypad, textAnchor: "end", rotate: 90},
    bottomLeft: { x: x1 + xpad, y: y2 - ypad/2, textAnchor: "start", rotate: 0 },
    bottomMiddle: { x: (x2 - x1)/2 + x1 , y: y2 - ypad/2, textAnchor: "middle", rotate: 0},
    bottomRight: { x: x2 - xpad, y: y2 - ypad/2, textAnchor: "end", rotate: 0 },
  }
  return positions
}

var drawGroups = function (svg, diagram, groups, objects) {
    for (var group in groups) {
      var xpad = (diagram.xBand.step() - diagram.xBand.bandwidth()) * diagram.groupPadding
      var ypad = (diagram.yBand.step() - diagram.yBand.bandwidth()) * diagram.groupPadding
      var x1 = diagram.xBand(d3.min(groups[group].members, function(d) {return objects[d].x })) - xpad
      var y1 = diagram.yBand(d3.max(groups[group].members, function(d) { return objects[d].y })) - ypad

      var x2 = d3.max(groups[group].members, function(d) { return objects[d].x2 + xpad })
      var y2 = d3.max(groups[group].members, function(d) { return objects[d].y2 + ypad })
      console.log('y2',y2)
      var width = x2 - x1
      var height = y2 - y1
      svg.append("rect")
         .attr("x", x1)
         .attr("y", y1)
         .attr("rx", diagram.xBand.bandwidth() * .05)
         .attr("ry", diagram.yBand.bandwidth() * .05)
         .attr("width", width )
         .attr("height", height )
         .attr("fill", function(d) { return d3.color(groups[group].fill) || 'none' })
         .style("stroke", function(d) { return d3.color(groups[group].stroke) || 'white' })
      if (groups[group].name) {
        var textLocation = textPositions(x1,y1,x2,y2, xpad/3, ypad/3 )[groups[group].textLocation || 'topLeft']
        svg.append("text")
          .text( groups[group].name )
          .attr("transform", `translate(${textLocation.x},${textLocation.y})rotate(${textLocation.rotate})`)
          .attr("text-anchor", textLocation.textAnchor)
          .style("font-size", function(d) { return Math.min(diagram.xBand.bandwidth()*.9 / this.getComputedTextLength() * 12, diagram.yBand.bandwidth()/3/2) + "px"; })
          .attr('fill', function(d) { return groups[group].color || "white"} )
      }
    }
}
