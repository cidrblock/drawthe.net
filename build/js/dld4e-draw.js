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

function draw(doc) {
  var rows = doc.rows || 10
  var columns = doc.columns || 10
  var backgroundColor = doc.backgroundColor || "white";
  var groupPadding = doc.groupPadding || .33;
  var gridPaddingInner = .4;
  var connectionLabelFontSize = 10;
  var gridLines = doc.gridLines || false;
  var title = doc.title || false;
  var titleHeight = 0

  document.body.style.background = backgroundColor
  var ratios = doc['diagramAspectRatio'].split(':')
  var margin = doc['margin'] || {top: 20, right: 20, bottom: 50, left: 20}
  var parentBox = d3.select("#svg").node().getBoundingClientRect()

  // set the desired h/w
  var availbleHeight = parentBox.height - margin.top - margin.bottom
  var availbleWidth = parentBox.width - margin.left - margin.right

  if (availbleHeight < availbleWidth) {
    svgHeight = availbleHeight
    svgWidth = svgHeight/ratios[1] * ratios[0]
  } else if (availbleWidth < availbleHeight) {
    svgWidth = availbleWidth
    svgHeight = svgWidth/ratios[0] * ratios[1]
  } else {
    svgWidth = availbleWidth
    svgHeight = availbleHeight
  }
  // downsize if outside the bounds
  if (svgHeight > availbleHeight) {
    svgHeight = availbleHeight
    svgWidth = svgHeight/ratios[1] * ratios[0]
  }
  if (svgWidth > availbleWidth) {
    svgWidth = availbleWidth
    svgHeight = svgWidth/ratios[0] * ratios[1]
  }

  if (title) { titleHeight = svgHeight*.10 }
  if (title) { title.height = svgHeight*.10 }

  var drawingHeight = svgHeight - titleHeight
  var drawingWidth = drawingHeight/ratios[1] * ratios[0]
  var drawingX = (svgWidth - drawingWidth)/2
  var drawingY = (svgHeight - titleHeight - drawingHeight)
  var drawing = {
    height: drawingHeight,
    width: drawingWidth,
    x: drawingX,
    y: drawingY,
    columns: columns,
    rows: rows
  }


  var x = d3.scaleBand()
    .domain(Array.from(Array(columns).keys()))
    .rangeRound([drawingX,drawingWidth + drawingX])
    .paddingInner(gridPaddingInner);

  var y = d3.scaleBand()
    .domain(Array.from(Array(rows).keys()).reverse())
    .rangeRound([drawingY,drawingHeight + drawingY])
    .paddingInner(gridPaddingInner);

  // remove the old diagram
  d3.select("svg").remove();
  var svg = d3.select("#svg").append("svg")
    .attr("width", parentBox.width )
    .attr("height", parentBox.height )
    .style("background-color", backgroundColor )
    .append("g")
      .attr("transform", "translate(" + (parentBox.width - svgWidth)/2 + "," + (parentBox.height - svgHeight)/2 + ")");

  // draw the title
if (title) {
  drawTitle(svg, drawing, title)
}

if (gridLines) {
  drawGridLines(svg, drawing, x, y)
}

// draw the groups
  if (doc.groups) {
    doc.groups.forEach(function(group) {
      var xpad = (x.step() - x.bandwidth()) * groupPadding
      var ypad = (y.step() - y.bandwidth()) * groupPadding
      var x1 = x(d3.min(group.members, function(d) {return doc.objects[d].x })) - xpad
      var y1 = y(d3.max(group.members, function(d) { return doc.objects[d].y })) - ypad
      var x2 = x(d3.max(group.members, function(d) { return doc.objects[d].x })) + xpad + x.bandwidth()
      var y2 = y(d3.min(group.members, function(d) { return doc.objects[d].y })) + ypad + y.bandwidth()
      var width = x2 - x1
      var height = y2 - y1
      svg.append("rect")
         .attr("x", x1)
         .attr("y", y1)
         .attr("rx", x.bandwidth() * .05)
         .attr("ry", y.bandwidth() * .05)
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
          .style("font-size", function(d) { return Math.min(x.bandwidth()*.9 / this.getComputedTextLength() * 12, y.bandwidth()/3/2) + "px"; })
          .attr('fill', function(d) { return group.color || "white"} )
      }
    })
  }

// draw the connections

if (doc.connections) {
  doc.connections.forEach(function(connection,index) {
    var endpoints = connection.endpoints.map( function(device) { return device.split(':')[0]})

    var data = endpoints.map( function(device) {
            return { x: x(doc.objects[device].x) + x.bandwidth()/2,
                     y: y(doc.objects[device].y) + y.bandwidth()/2,
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
    }
    var curve = d3[connection.curve] || d3.curveLinear
    var dxOffset = 0
    var firstLabel = connection.endpoints[0].split(':')[1]
    var secondLabel = connection.endpoints[1].split(':')[1]
    var pathName = `path${index}`
    if (curve == d3.curveStepBefore) { startOffset = y.bandwidth()/2 }
    if (curve == d3.curveStepAfter) { startOffset = x.bandwidth()/2 }
    if (curve == d3.curveStep) { startOffset = x.bandwidth()/2 }
    if (curve == d3.curveLinear) {
        // find the angle of the center to the corner
        var c2cRadians = Math.atan2(y.bandwidth() - y.bandwidth()/2, x.bandwidth() - x.bandwidth()/2);
        var c2cDegrees = c2cRadians *180/Math.PI
        var A = Math.abs(c2cDegrees - Math.abs(angleDegrees))
        var C = 90 - c2cDegrees
        if (Math.abs(angleDegrees) > C ) { C = 90 - C }
        var B = 180 - (A + C)
        var b = Math.sqrt(Math.pow(x.bandwidth()/2,2) + Math.pow(y.bandwidth()/2,2))
        var c = (Math.sin(C*(Math.PI / 180))*b)/Math.sin(B*(Math.PI / 180))
        var startOffset = Math.abs(c)
        // add a little padding if we're leaning in
        if ((angleDegrees < 0) && (angleDegrees > -c2cDegrees)) {dxOffset = connectionLabelFontSize/2}
        if ((angleDegrees > c2cDegrees) && (angleDegrees < 90)) {dxOffset = connectionLabelFontSize/2}
      }
      // draw the path between the points
      svg.append("path")
        .datum(data)
        .attr("id", pathName)
        .style("stroke", connection.lineColor || 'orange' )
        .style("fill", "none")
        .style("stroke-dasharray", connection.strokeDashArray || [0,0])
        .attr("d", d3.line()
                     .curve(curve)
                     .x(function(d) { return d.x; })
                     .y(function(d) { return d.y; })
                 );
      // draw the text for the first label
      svg.append("text")
        .style("fill", function(d) { return connection.color || "white" })
        .style('font-size', connectionLabelFontSize + 'px')
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
        startOffset = x.bandwidth()/2
      } else if (curve == d3.curveStepAfter) {
        startOffset = y.bandwidth()/2
      }
      // draw the text for the second node
      svg.append("text")
      .style("fill", function(d) { return connection.color || "white" })
       .style('font-size', connectionLabelFontSize + 'px')
       .attr('dy', 8)
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


  var deviceCellsAll = svg.selectAll("cells")
    .data(d3.entries(doc.objects))
    .enter()

  var cells = deviceCellsAll.append("g")
    .attr("transform", function(d) { return "translate(" + x(d.value.x) + "," + y(d.value.y) + ")" })

  var cellFill = cells
    .append("rect")
    .attr("rx", x.bandwidth() * .05)
    .attr("ry", y.bandwidth() * .05)
    .attr("width", x.bandwidth() )
    .attr("height", y.bandwidth() )
    .attr("id", function(d) { return d.key })
    .attr("fill", function(d) { return d.value.backgroundColor })
    .style("stroke", function(d) { return d.value.borderColor || 'none' })

  var cellText = cells
    .append("text")
    .text( function (d) { return d.key })
    .attr("x", x.bandwidth()/2 )
    .attr("y", y.bandwidth()*.95 )
    .attr("text-anchor", "middle")
    .style("font-size", function(d) { return Math.min(x.bandwidth()*.9 / this.getComputedTextLength() * 12, y.bandwidth()/3/2) + "px"; })
    .attr('fill', function(d) { return d.value.color || "white"} )

  var icon = cells
    .append('text')
    .attr("x", x.bandwidth()/2 )
    .attr("y", y.bandwidth() * .4 )
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .style('font-family', function(d) { return d.value.font })
    .style('font-size', Math.min(x.bandwidth()*.9,y.bandwidth()*.8*.9)  + 'px')
    .attr('fill', function(d) { return d.value.iconColor || "white"} )
    .text(function (d) {
         return fonts[d.value.font][d.value.type];
      });


};
