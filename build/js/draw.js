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

  document.body.style.background = backgroundColor
  var ratios = doc['diagramAspectRatio'].split(':')
  var margin = doc['margin'] || {top: 20, right: 20, bottom: 50, left: 20}

  var parentBox = d3.select("#svg").node().getBoundingClientRect()
  if (parentBox.height < parentBox.width) {
    height = parentBox.height - doc.margin.top - doc.margin.bottom
    width = parentBox.height/ratios[1] * ratios[0] - doc.margin.left - doc.margin.right
  } else if (parentBox.width < parentBox.height) {
    width = parentBox.width - doc.margin.left - doc.margin.right
    height = parentBox.width/ratios[0] * ratios[1] - doc.margin.top - doc.margin.bottom
  } else {
    width = parentBox.width
    height = parentBox.height
  }

  var x = d3.scaleBand()
    .domain(Array.from(Array(columns).keys()))
    .rangeRound([0,width])
    .paddingInner(gridPaddingInner);

  var y = d3.scaleBand()
    .domain(Array.from(Array(rows).keys()).reverse())
    .rangeRound([0,height])
    .paddingInner(gridPaddingInner);

  d3.select("svg").remove();
  var svg = d3.select("#svg").append("svg")
    .attr("width", parentBox.width )
    .attr("height", parentBox.height )
    .style("background-color", function(d) { return doc.backgroundColor || "white" })
    .append("g")
      .attr("transform", "translate(" + (parentBox.width - width)/2 + "," + (parentBox.height - height)/2 + ")");

  function make_x_gridlines() {
    return d3.axisBottom(x)
        .ticks(5)
  }
  // gridlines in y axis function
  function make_y_gridlines() {
    return d3.axisLeft(y)
        .ticks(5)
  }
  if (doc.gridLines) {
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
        .tickSize(-height)
        .tickFormat("")
        .ticks(columns)
      )
    svg.append("g")
      .attr("class", "grid")
      .call(make_y_gridlines()
        .tickSize(-width)
        .tickFormat("")
        .ticks(rows)
      )
      // add the X Axis
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "axisNone")
      .call(d3.axisBottom(x));

      // add the Y Axis
    svg.append("g")
      .attr("class", "axisNone")
      .call(d3.axisLeft(y));
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
  doc.connections.forEach(function(connection) {
    var endpoints = connection.endpoints.map( function(device) { return device.split(':')[0]})

    var data = endpoints.map( function(device) {
            return { x: x(doc.objects[device].x) + x.bandwidth()/2,
                     y: y(doc.objects[device].y) + y.bandwidth()/2,
                   }
    });
    var curve = d3[connection.curve] || d3.curveLinear
    var pathName = endpoints.join('-')
    // draw a visibile path
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
    var angleRadians = Math.atan2(data[1].y - data[0].y, data[1].x - data[0].x);
    var angleDegrees = angleRadians *180/Math.PI;
    var startOffset

    var firstLabel = connection.endpoints[0].split(':')[1]
    var secondLabel = connection.endpoints[1].split(':')[1]
    if (firstLabel) {
      if (curve == d3.curveStepBefore) {
        startOffset = y.bandwidth()/2
      } else if (curve == d3.curveLinear) {
        if ([0,180].includes(angleDegrees)) {
          dy = -1
          startOffset = x.bandwidth()/2
        } else if ([-90,90].includes(angleDegrees)) {
          dx = 1
          startOffset = y.bandwidth()/2
        } else if ( Math.abs(angleDegrees) <= 45) {
          startOffset = Math.abs(1/Math.cos(angleRadians) * x.bandwidth()/2)
        } else if (( Math.abs(angleDegrees) > 45) && ( Math.abs(angleDegrees) < 90)) {
          startOffset = Math.abs(1/Math.sin(angleRadians) * y.bandwidth()/2) + 4
        } else if (( Math.abs(angleDegrees) > 90) && ( Math.abs(angleDegrees) < 135)) {
          startOffset = Math.abs(1/Math.sin(angleRadians) * y.bandwidth()/2)
        } else if ( Math.abs(angleDegrees) >= 135) {
          startOffset = Math.abs(1/Math.cos(angleRadians) * x.bandwidth()/2)
        } else {
          // why am i here
          console.log(`unk: ${connection.endpoints} is ${angleDegrees}`)
        }
      } else {
        startOffset =  x.bandwidth()/2
      }
      svg.append("text")
        .style("fill", "white")
        .style('font-size', '10px')
        .attr('dy', -1)
        .append("textPath")
          .style("text-anchor","start")
          .attr("startOffset", startOffset)
          .attr("xlink:href", "#" + pathName)
          .text(firstLabel);
    }

    if (secondLabel) {
    // draw an invisible path
      var data = endpoints.reverse().map( function(device) {
              return { x: x(doc.objects[device].x) + x.bandwidth()/2,
                       y: y(doc.objects[device].y) + y.bandwidth()/2,
                     }
      });
      var pathName = "reverse-" + endpoints.join('-')
      // fip the curve
      if  (curve == d3.curveStepBefore) {
         curve = d3.curveStepAfter
       } else if (curve == d3.curveStepAfter) {
         curve = d3.curveStepBefore
       }
      // draw a invisibile path
      svg.append("path")
        .datum(data)
        .attr("id", pathName)
        .style("stroke", "none") //connection.lineColor || 'orange' )
        .style("fill", "none")
        .attr("d", d3.line()
                     .curve(curve)
                     .x(function(d) { return d.x; })
                     .y(function(d) { return d.y; })
                 );
       if (curve == d3.curveStepBefore) {
         startOffset = y.bandwidth()/2
       } else if (curve == d3.curveLinear) {
         if ([0,180].includes(angleDegrees)) {
           dy = -1
           startOffset = x.bandwidth()/2
         } else if ([-90,90].includes(angleDegrees)) {
           dx = 1
           startOffset = y.bandwidth()/2
         } else if ( Math.abs(angleDegrees) <= 45) {
           startOffset = Math.abs(1/Math.cos(angleRadians) * x.bandwidth()/2)
         } else if (( Math.abs(angleDegrees) > 45) && ( Math.abs(angleDegrees) < 90)) {
           startOffset = Math.abs(1/Math.sin(angleRadians) * y.bandwidth()/2) + 4
         } else if (( Math.abs(angleDegrees) > 90) && ( Math.abs(angleDegrees) < 135)) {
           startOffset = Math.abs(1/Math.sin(angleRadians) * y.bandwidth()/2)
         } else if ( Math.abs(angleDegrees) >= 135) {
           startOffset = Math.abs(1/Math.cos(angleRadians) * x.bandwidth()/2)
         } else {
           // why am i here
           console.log(`unk: ${connection.endpoints} is ${angleDegrees}`)
         }
       } else {
         startOffset =  x.bandwidth()/2
       }
       svg.append("text")
         .style("fill", "white")
         .style('font-size', '10px')
         .attr('dy', -1)
         .append("textPath")
           .style("text-anchor","start")
           .attr("startOffset", startOffset)
           .attr("xlink:href", "#" + pathName)
           .text(secondLabel);
    }
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
