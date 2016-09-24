function draw(doc) {
  var drawingDefaults = {
    backgroundColor: "white",
    connectionLabelFontSize: 10,
    aspectRatio: "1:1",
    rows: 10,
    columns: 10,
    groupPadding: .33,
    gridLines: true,
    gridPaddingInner: .4, // the space between objects (%)
    margins: {top: 20, right: 20, bottom: 50, left: 20 }
  }
  var titleDefaults = {
    text: "Decent diagrams for engineers",
    subText: "More information can be found at http://github.com/cidrblock/dld4e",
    author: "Bradley A. Thornton",
    company: "Self",
    date: new Date().toLocaleDateString(),
    version: 1.01,
    color: "black",
    barColor: "black",
    boxFillColor: "white",
    boxStroke: "black",
    heightPercentage: 6, // percent of total height
    logoUrl: "./radial.png",
    logoFill: "white"
  }
  var connections = doc.connections || [];
  var groups = doc.groups || [];
  var objects = doc.objects || [];

  diagram = Object.assign(drawingDefaults, doc.diagram || {})
  title = Object.assign(titleDefaults, doc.title || {})

  document.body.style.background = diagram.backgroundColor
  var ratios = diagram.aspectRatio.split(':')
  var parentBox = d3.select("#svg").node().getBoundingClientRect()

  // set the desired h/w
  var availbleHeight = parentBox.height - diagram.margins.top - diagram.margins.bottom
  var availbleWidth = parentBox.width - diagram.margins.left - diagram.margins.right

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

  title.height = svgHeight * title.heightPercentage/100
  diagram.height = svgHeight - title.height
  diagram.width = diagram.height/ratios[1] * ratios[0]
  diagram.x = (svgWidth - diagram.width)/2
  diagram.y = (svgHeight - title.height - diagram.height)

  diagram.xBand = d3.scaleBand()
    .domain(Array.from(Array(diagram.columns).keys()))
    .rangeRound([diagram.x,diagram.width + diagram.x])
    .paddingInner(diagram.gridPaddingInner);

  diagram.yBand = d3.scaleBand()
    .domain(Array.from(Array(diagram.rows).keys()).reverse())
    .rangeRound([diagram.y,diagram.height + diagram.y])
    .paddingInner(diagram.gridPaddingInner);

  // remove the old diagram
  d3.select("svg").remove();
  var svg = d3.select("#svg").append("svg")
    .attr("width", parentBox.width )
    .attr("height", parentBox.height )
    .style("background-color", diagram.backgroundColor )
    .append("g")
      .attr("transform", "translate(" + (parentBox.width - svgWidth)/2 + "," + (parentBox.height - svgHeight)/2 + ")");

  // draw the title
drawTitle(svg, diagram, title)
drawGridLines(svg, diagram)
drawGroups(svg, diagram, groups, objects)
drawConnections(svg, diagram, connections, objects)

// draw the connections


  var deviceCellsAll = svg.selectAll("cells")
    .data(d3.entries(doc.objects))
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
    .attr("y", diagram.yBand.bandwidth() * .4 )
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .style('font-family', function(d) { return d.value.font })
    .style('font-size', Math.min(diagram.xBand.bandwidth()*.9,diagram.yBand.bandwidth()*.8*.9)  + 'px')
    .attr('fill', function(d) { return d.value.iconColor || "white"} )
    .text(function (d) {
         return fonts[d.value.font][d.value.type];
      });


};
