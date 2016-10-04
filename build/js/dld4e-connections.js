var drawConnections = function (svg, diagram, connections, icons, notes) {
    var connectionLabelFontSize = Math.min(diagram.xBand.bandwidth()/8,diagram.yBand.bandwidth()/8)
    connections.forEach(function(connection,index) {
      var endpoints = connection.endpoints.map( function(device) { return device.split(':')[0]})

      var data = endpoints.map( function(thing) {
              if (thing in icons) {
              return { x: icons[thing].centerX,
                       y: icons[thing].centerY
                     }
              } else if (thing in notes) {
              return { x: notes[thing].centerX,
                       y: notes[thing].centerY
                     }
              }
      });
      var angleRadians = Math.atan2(data[1].y - data[0].y, data[1].x - data[0].x);
      var angleDegrees = angleRadians *180/Math.PI;

      // first, let get all the paths gong left to right & recompute
      if ((angleDegrees >= 90) || (angleDegrees < -90)) {
        connection.endpoints = connection.endpoints.reverse()
        endpoints = endpoints.reverse()
        data = data.reverse()
        angleRadians = Math.atan2(data[1].y - data[0].y, data[1].x - data[0].x);
        angleDegrees = angleRadians *180/Math.PI;
        if (connection.curve == 'curveStepAfter') {
          connection.curve = 'curveStepBefore'
        } else if (connection.curve == 'curveStepBefore') {
          connection.curve = 'curveStepAfter'
        }
      }
      var curve = d3[connection.curve] || d3.curveLinear
      var dxOffset = 3
      var firstLabel = connection.endpoints[0].split(':')[1]
      var secondLabel = connection.endpoints[1].split(':')[1]
      var pathName = "path" + index
      if (curve == d3.curveStepBefore) { startOffset = diagram.yBand.bandwidth()/2 }
      if (curve == d3.curveStepAfter) { startOffset = diagram.xBand.bandwidth()/2 }
      if (curve == d3.curveStep) { startOffset = diagram.xBand.bandwidth()/2 }
      if (curve == d3.curveLinear) {
          // find the angle of the center to the corner
          var c2cRadians = Math.atan2(diagram.yBand.bandwidth() - diagram.yBand.bandwidth()/2, diagram.xBand.bandwidth() - diagram.xBand.bandwidth()/2);
          var c2cDegrees = c2cRadians *180/Math.PI
          var A = Math.abs(c2cDegrees - Math.abs(angleDegrees))
          var C = 90 - c2cDegrees
          if (Math.abs(angleDegrees) > C ) { C = 90 - C }
          var B = 180 - (A + C)
          var b = Math.sqrt(Math.pow(diagram.xBand.bandwidth()/2,2) + Math.pow(diagram.yBand.bandwidth()/2,2))
          var c = (Math.sin(C*(Math.PI / 180))*b)/Math.sin(B*(Math.PI / 180))
          var startOffset = Math.abs(c)
          // add a little padding if we're leaning in
          if ((angleDegrees < 0) && (angleDegrees > -c2cDegrees)) {dxOffset = connectionLabelFontSize * .6}
          if ((angleDegrees > c2cDegrees) && (angleDegrees < 90)) {dxOffset = connectionLabelFontSize * .6}
        }
        // draw the path between the points
        svg.append("path")
          .datum(data)
          .attr("id", pathName)
          .style("stroke", connection.stroke || 'orange' )
          .style("fill", "none")
          .style("stroke-dasharray", connection.strokeDashArray || [0,0])
          .style("stroke-width", connection.strokeWidth || 1 )
          .attr("d", d3.line()
                       .curve(curve)
                       .x(function(d) { return d.x; })
                       .y(function(d) { return d.y; })
                   );

        // draw the text for the first label
        svg.append("text")
          .attr('class', 'connectionLabel')
          .style("fill", function(d) { return connection.color || "orange" })
          .style('font-size', connectionLabelFontSize + 'px' )
          .attr('dy', -1)
          .attr('dx', function(d) {
            return startOffset + dxOffset
          })
          .append("textPath")
            .style("text-anchor","start")
            .attr("xlink:href", "#" + pathName)
            .text(firstLabel);

        //in theses we enter the 2nd node in a different direction
        if (curve == d3.curveStepBefore) {
          startOffset = diagram.xBand.bandwidth()/2
        } else if (curve == d3.curveStepAfter) {
          startOffset = diagram.yBand.bandwidth()/2
        }
        // draw the text for the second node
        svg.append("text")
          .attr('class', 'connectionLabel')
          .style("fill", function(d) { return connection.color || "orange" })
          .style('font-size',  connectionLabelFontSize + 'px' )
          .attr('dy', connectionLabelFontSize)
          .attr('dx', function(d) {
            return -startOffset - this.getComputedTextLength() - dxOffset
          })
          .append("textPath")
            .style("text-anchor","end")
            .attr("startOffset","100%")
            .attr("xlink:href", "#" + pathName)
            .text(secondLabel);
    });
}
