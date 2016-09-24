

var groupPadding
var connectionLabelFontSize = 10;
var connections = [];

function draw(doc) {
  var rows = doc.rows || 10
  var columns = doc.columns || 10
  var backgroundColor = doc.backgroundColor || "white";
  var groups = doc.groups;
  var objects = doc.objects;
  var connections = doc.connections || connections;
  var gridPaddingInner = .4;
  var gridLines = doc.gridLines || false;
  var title = doc.title || false;
  var titleHeight = 0
  groupPadding = doc.groupPadding || .33;


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


  drawing.xBand = d3.scaleBand()
    .domain(Array.from(Array(columns).keys()))
    .rangeRound([drawingX,drawingWidth + drawingX])
    .paddingInner(gridPaddingInner);

  drawing.yBand = d3.scaleBand()
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
  drawGridLines(svg, drawing)
}

if (groups) {
  drawGroups(svg, drawing, groups, objects)
}

drawConnections(svg, drawing, connections, objects)

// draw the connections


  var deviceCellsAll = svg.selectAll("cells")
    .data(d3.entries(doc.objects))
    .enter()

  var cells = deviceCellsAll.append("g")
    .attr("transform", function(d) { return "translate(" + drawing.xBand(d.value.x) + "," + drawing.yBand(d.value.y) + ")" })

  var cellFill = cells
    .append("rect")
    .attr("rx", drawing.xBand.bandwidth() * .05)
    .attr("ry", drawing.yBand.bandwidth() * .05)
    .attr("width", drawing.xBand.bandwidth() )
    .attr("height", drawing.yBand.bandwidth() )
    .attr("id", function(d) { return d.key })
    .attr("fill", function(d) { return d.value.backgroundColor })
    .style("stroke", function(d) { return d.value.borderColor || 'none' })

  var cellText = cells
    .append("text")
    .text( function (d) { return d.key })
    .attr("x", drawing.xBand.bandwidth()/2 )
    .attr("y", drawing.yBand.bandwidth()*.95 )
    .attr("text-anchor", "middle")
    .style("font-size", function(d) { return Math.min(drawing.xBand.bandwidth()*.9 / this.getComputedTextLength() * 12, drawing.yBand.bandwidth()/3/2) + "px"; })
    .attr('fill', function(d) { return d.value.color || "white"} )

  var icon = cells
    .append('text')
    .attr("x", drawing.xBand.bandwidth()/2 )
    .attr("y", drawing.yBand.bandwidth() * .4 )
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .style('font-family', function(d) { return d.value.font })
    .style('font-size', Math.min(drawing.xBand.bandwidth()*.9,drawing.yBand.bandwidth()*.8*.9)  + 'px')
    .attr('fill', function(d) { return d.value.iconColor || "white"} )
    .text(function (d) {
         return fonts[d.value.font][d.value.type];
      });


};
