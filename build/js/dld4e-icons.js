var drawIcons = function (svg, diagram, icons, iconTextRatio) {
  var deviceCellsAll = svg.selectAll("cells")
    .data(d3.entries(icons))
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
    .style("stroke-dasharray", function(d) { return d.value.strokeDashArray || [0,0] })

  var cellText = cells
    .append("text")
    .attr('class', 'iconLabel')
    .text( function (d) { return d.value.text || d.key })
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .each( function(d) {
      d.value.fontSize = Math.floor(Math.min(d.value.width*.9 / this.getComputedTextLength() * 12, d.value.height/2*iconTextRatio))
      d.value.textPosition = textPositions(0,0,d.value.width,d.value.height,d.value.fontSize + 2)[d.value.textLocation]
      if (d.value.url) {
        var text = d3.select(this)
        text.on("click", function() { window.open(d.value.url); })
        text.style("cursor", "pointer")
        text.style("text-decoration", "underline")
      }
      if (d.value.metadata) {
        var text = d3.select(this)
        text.style("cursor", "pointer")
      }
    })
    .style("font-size", function(d) { return d.value.fontSize + "px"; })
    .attr("id", function(d) { return d.key + '-text'})
    .attr("transform", function(d) { return "translate(" + d.value.textPosition.x + "," + d.value.textPosition.y + ")rotate(" + d.value.textPosition.rotate + ")" })
    .attr('fill', function(d) { return d.value.color || "orange"} )
    .attr("text-anchor", function(d) { return d.value.textPosition.textAnchor})
    .attr("dominant-baseline", "central")

  var icon = cells
    .each ( function(d) {
      var cell = document.getElementById(d.key)
      var cellText = document.getElementById(d.key + "-text")
      var fontSize =  Math.ceil(parseFloat(cellText.style.fontSize))
      // center
      var x = (d.value.width*d.value.iconPaddingX)
      var y = (d.value.height*d.value.iconPaddingY)
      var width = d.value.width*(1-2*d.value.iconPaddingX)
      var height = (d.value.height)*(1-2*d.value.iconPaddingY)
      switch (true) {
        case d.value.textLocation.startsWith('top'):
          y += fontSize
          height = (d.value.height - fontSize)*(1-2*d.value.iconPaddingY)
          break;
        case d.value.textLocation.startsWith('left'):
          x += fontSize
          width = (d.value.width - fontSize)*(1-2*d.value.iconPaddingX)
          break;
        case d.value.textLocation.startsWith('right'):
          width = (d.value.width - fontSize)*(1-2*d.value.iconPaddingX)
          break;
        case d.value.textLocation.startsWith('bottom'):
          height = (d.value.height - fontSize)*(1-2*d.value.iconPaddingY)
          break;
      }

      var url = "build/images/" + d.value.iconFamily + "/" + d.value.icon + ".svg"
      d3.xml(url).mimeType("image/svg+xml").get(function(error, xml) {
        var svg = xml.getElementsByTagName("svg")[0]
        svg.setAttribute("x", x)
        svg.setAttribute("y", y)
        svg.setAttribute("width", width)
        svg.setAttribute("height", height)
        var paths = xml.getElementsByTagName("path")
        for (i = 0; i < paths.length; i++) {
          if ((d.value.preserveWhite) && (paths[i].getAttribute("fill") == '#fff')) {
            //paths[i].setAttribute("fill", d.value.replaceWhite)
          } else if ((d.value.iconFill) && (paths[i].getAttribute("fill") != 'none')) {
            paths[i].setAttribute("fill", d.value.iconFill)
          }
          if ((d.value.iconStroke) && (paths[i].getAttribute("stroke") != 'none')) {
            paths[i].setAttribute("stroke", d.value.iconStroke)
          }
          if ((d.value.iconStrokeWidth) && (paths[i].getAttribute("stroke-width"))) {
            paths[i].setAttribute("stroke-width", d.value.iconStrokeWidth)
          }
        }
        cell.insertBefore(xml.documentElement.cloneNode(true), cellText);
      })
    })

    function handleMouseOver(d, i) {
      if (d.value.metadata.url) {
        var url = d.value.metadata.url
        var replacements = url.match(/{{\s*[\w\.]+\s*}}/g)
        if (replacements) {
          replacements.forEach(function(replacement){
            var inner = replacement.match(/[\w\.]+/)[0]
            if (inner == 'key') {
              url = url.replace(replacement, d.key)
            } else {
              url = url.replace(replacement, d.value[inner])
            }
          })
        }
        d3.json(url, function (json) {
          metadata = Object.assign({},json, d.value.metadata);
          delete metadata.url
          mouseOver(d,i,metadata)
        });
      } else if (d.value.metadata) {
        mouseOver(d,i,d.value.metadata)
      }
    }

    function mouseOver(d,i,json) {
      var metadata = json
      if (metadata) {
        var length = Object.keys(metadata).length
        var jc = "flex-start"
        var meta = svg
          .append("foreignObject")
          .attr("id", "t" + d.value.x + "-" + d.value.y + "-" + i)
          .attr("class", "mouseOver")
          .attr("x", function() {
            if ((d.value.x2 + d.value.width * 2) < diagram.width) {
              return d.value.x2
            } else {
              jc = "flex-end"
              return d.value.x1 - (d.value.width * 3)
            }
            return d.value.x2; })
          .attr("y", function() { return d.value.centerY - (length * d.value.fontSize) })
          .append("xhtml:div")
          .attr("class", "metadata")
          .style("width", function() { return d.value.width * 3 + "px" })
          .style("height", function() { return length * d.value.fontSize })
          .style("justify-content", jc)
          .style("font-size", function() { return d.value.fontSize + "px"; })
          .html(function() {
            var text = "<table>"
            for (key in metadata) {
              text += ("<tr><td>" + key + ":&nbsp</td><td>" + metadata[key] + "</td></tr>")
            }
            text += "</table>"
            return text;
          })
      }
    }
    function handleMouseOut(d, i) {
      svg.selectAll(".mouseOver")
        .remove()
    }
}
