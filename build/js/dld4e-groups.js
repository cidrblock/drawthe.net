function textPositions(x1, y1, x2, y2, xpad, ypad ) {
  var positions = {
    topLeft: { x: x1 + xpad, y: y1 + (ypad * 2.33), textAnchor: "start", rotate: 0 },
    topMiddle: { x: (x2 - x1)/2 + x1 , y: y1 + (ypad * 2.33), textAnchor: "middle", rotate: 0},
    topRight: { x: x2 - xpad, y: y1 + (ypad * 2.33), textAnchor: "end", rotate: 0 },
    leftTop: { x: x1 + (xpad * 2.33), y: y1 + ypad, textAnchor: "end", rotate: -90},
    leftMiddle: { x: x1 + (xpad * 2.33), y: (y2-y1)/2 + y1, textAnchor: "middle", rotate: -90},
    leftBottom: { x: x1 + (xpad * 2.33), y: y2 - ypad, textAnchor: "start", rotate: -90},
    rightTop: { x: x2 - (xpad * 2.33), y: y1 + ypad, textAnchor: "start", rotate: 90},
    rightMiddle: { x: x2 - (xpad * 2.33), y: (y2-y1)/2 + y1, textAnchor: "middle", rotate: 90},
    rightBottom: { x: x2 - (xpad * 2.33), y: y2 - ypad, textAnchor: "end", rotate: 90},
    bottomLeft: { x: x1 + xpad, y: y2 - ypad, textAnchor: "start", rotate: 0 },
    bottomMiddle: { x: (x2 - x1)/2 + x1 , y: y2 - ypad, textAnchor: "middle", rotate: 0},
    bottomRight: { x: x2 - xpad, y: y2 - ypad, textAnchor: "end", rotate: 0 },
  }
  return positions
}


var drawGroups = function (svg, drawing, groups, objects) {
    groups.forEach(function(group) {
      var xpad = (drawing.xBand.step() - drawing.xBand.bandwidth()) * groupPadding
      var ypad = (drawing.yBand.step() - drawing.yBand.bandwidth()) * groupPadding
      var x1 = drawing.xBand(d3.min(group.members, function(d) {return objects[d].x })) - xpad
      var y1 = drawing.yBand(d3.max(group.members, function(d) { return objects[d].y })) - ypad
      var x2 = drawing.xBand(d3.max(group.members, function(d) { return objects[d].x })) + xpad + drawing.xBand.bandwidth()
      var y2 = drawing.yBand(d3.min(group.members, function(d) { return objects[d].y })) + ypad + drawing.yBand.bandwidth()
      var width = x2 - x1
      var height = y2 - y1
      svg.append("rect")
         .attr("x", x1)
         .attr("y", y1)
         .attr("rx", drawing.xBand.bandwidth() * .05)
         .attr("ry", drawing.yBand.bandwidth() * .05)
         .attr("width", width )
         .attr("height", height )
         .attr("fill", function(d) { return d3.color(group.fill) || 'none' })
         .style("stroke", function(d) { return d3.color(group.stroke) || 'white' })
      if (group.name) {
        var textLocation = textPositions(x1,y1,x2,y2, xpad/3, ypad/3 )[group.textLocation || 'topLeft']
        svg.append("text")
          .text( group.name )
          .attr("transform", `translate(${textLocation.x},${textLocation.y})rotate(${textLocation.rotate})`)
          .attr("text-anchor", textLocation.textAnchor)
          .style("font-size", function(d) { return Math.min(drawing.xBand.bandwidth()*.9 / this.getComputedTextLength() * 12, drawing.yBand.bandwidth()/3/2) + "px"; })
          .attr('fill', function(d) { return group.color || "white"} )
      }
    })
}
