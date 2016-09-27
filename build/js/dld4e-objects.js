var drawObjects = function (svg, objects) {
  var deviceCellsAll = svg.selectAll("cells")
    .data(d3.entries(objects))
    .enter()

  var cells = deviceCellsAll.append("g")
    .attr("id", function(d) { return d.key })
    .attr("transform", function(d) { return "translate(" + diagram.xBand(d.value.x) + "," + diagram.yBand(d.value.y) + ")" })

  var cellFill = cells
    .append("rect")
    .attr("rx", function(d) { return d.value.rx })
    .attr("ry", function(d) { return d.value.ry })
    .attr("width", function(d) { return d.value.width })
    .attr("height", function(d) { return d.value.height })
    .attr("fill", function(d) { return d.value.fill || "orange"})
    .style("stroke", function(d) { return d.value.stroke || "orange" })

  var cellText = cells
    .append("text")
    .text( function (d) { return d.key })
    .attr("x", function(d) { return d.value.width/2 })
    .attr("y", function(d) { return d.value.height * .95})
    .attr("text-anchor", "middle")
    .style("font-size", function(d) { return Math.min(d.value.width*.9 / this.getComputedTextLength() * 12, d.value.height/3/2) + "px"; })
    .attr('fill', function(d) { return d.value.color || "orange"} )

  var icon = cells.append('g')
    .attr("x", function(d) { return d.value.width*.2 })
    .attr("y", function(d) { return d.value.height*.2})

  for (let key in objects ) {
    d3.xml(`build/fonts/${objects[key].font}/${objects[key].type}.svg`).mimeType("image/svg+xml").get(function(error, xml) {
      var svg = xml.getElementsByTagName("svg")[0]
      svg.setAttribute("x", objects[key].width * .1)
      svg.setAttribute("y", objects[key].height * .05)
      svg.setAttribute("width", objects[key].width * .8)
      svg.setAttribute("height", objects[key].height * .7)
      var paths = xml.getElementsByTagName("path")
      for (i = 0; i < paths.length; i++) {
        if (paths[i].getAttribute("fill") == '#fff') {
          paths[i].setAttribute("fill", objects[key].fill || "orange")
        } else if (paths[i].getAttribute("fill") != 'none') {
          paths[i].setAttribute("fill", objects[key].iconFill || "orange")
        }
        if (paths[i].getAttribute("stroke") != 'none') {
          paths[i].setAttribute("stroke", objects[key].iconStroke || "orange")
        }
        if (paths[i].getAttribute("stroke-width")) {
          paths[i].setAttribute("stroke-width", objects[key].iconStrokeWidth || "1")
        }
      }
      var g = document.getElementById(key)
      var foo = g.appendChild(xml.documentElement.cloneNode(true));
    })
  }
}
