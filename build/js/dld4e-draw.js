function draw(doc) {
  // set the drawing defaults
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
  // set the title defaults
  var titleDefaults = {
    text: "Decent looking diagrams for engineers",
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
    logoUrl: "build/images/radial.png",
    logoFill: "white"
  }
  // incase there are none
  var connections = doc.connections || [];
  var groups = doc.groups || [];
  var objects = doc.objects || [];

  // merge the doc properties into the defaults
  diagram = Object.assign(drawingDefaults, doc.diagram || {})
  title = Object.assign(titleDefaults, doc.title || {})

  // set the background color of the whole page
  document.body.style.background = diagram.backgroundColor

  // find a good fit for the diagram
  var parentBox = d3.select("#svg").node().getBoundingClientRect()
  var ratios = diagram.aspectRatio.split(':')

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

  // using the svg dimentions, set the title and digrams
  title.height = svgHeight * title.heightPercentage/100
  diagram.height = svgHeight - title.height
  diagram.width = diagram.height/ratios[1] * ratios[0]
  diagram.x = (svgWidth - diagram.width)/2
  diagram.y = (svgHeight - title.height - diagram.height)

  // create our bands
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
  // and add the svg
  var svg = d3.select("#svg").append("svg")
    .attr("width", parentBox.width )
    .attr("height", parentBox.height )
    .style("background-color", diagram.backgroundColor )
    .append("g")
      .attr("transform", "translate(" + (parentBox.width - svgWidth)/2 + "," + (parentBox.height - svgHeight)/2 + ")");

  // draw all the things
  drawTitle(svg, diagram, title)
  drawGridLines(svg, diagram)
  drawGroups(svg, diagram, groups, objects)
  drawConnections(svg, diagram, connections, objects)
  drawObjects(svg, diagram, objects)
};
