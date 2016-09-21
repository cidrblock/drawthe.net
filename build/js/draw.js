function draw(doc) {

  document.body.style.background =  doc.backgroundColor || "red";
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

  var rows = doc.rows || 10
  var columns = doc.columns || 10

  var x = d3.scaleBand()
    .domain(Array.from(Array(columns).keys()))
    .rangeRound([0,width])
    .paddingInner(0.2);

  var y = d3.scaleBand()
    .domain(Array.from(Array(rows).keys()).reverse())
    .rangeRound([0,height])
    .paddingInner(0.2);

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

  if (doc.connections) {

    doc.connections.forEach(function(connection) {
      var data = connection.endpoints.map( function(device) {
              return { x: x(doc.devices[device].x) + x.bandwidth()/2,
                       y: y(doc.devices[device].y) + y.bandwidth()/2,
                     }
      });
      alert(data);
      var curve = d3[connection.curve] || d3.curveLinear
      svg.append("path")
        .datum(data)
        .style("stroke", connection.lineColor || 'orange' )
        .style("fill", "none")
        .style("stroke-dasharray", connection.strokeDashArray || [0,0])
        .attr("d", d3.line()
                     .curve(curve)
                     .x(function(d) { return d.x; })
                     .y(function(d) { return d.y; })
                 );
    });
  }

  var deviceCellsAll = svg.selectAll("cells")
    .data(d3.entries(doc.devices))
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

  if (doc.groups) {
    doc.groups.forEach(function(group) {
      var xpad = (x.step() - x.bandwidth()) *.33
      var ypad = (y.step() - y.bandwidth()) *.33
      var members = d3.selectAll(group.members.map( function(name) { return "#" + name }).join(','))
      var bx = x(d3.min(members.data(), function(d) {return d.value.x})) - xpad
      var by = y(d3.max(members.data(), function(d) {return d.value.y})) - ypad
      var width = x(d3.max(members.data(), function(d) { return d.value.x })) - bx + x.bandwidth() + xpad
      var height = y(d3.min(members.data(), function(d) { return d.value.y })) - by + y.bandwidth() + ypad
      svg.append("rect")
         .attr("x", bx)
         .attr("y", by)
         .attr("width", width )
         .attr("height", height )
         .attr("fill", 'none')
         .style("stroke", function(d) { return group.borderColor || 'white' })
    })
  }
};
