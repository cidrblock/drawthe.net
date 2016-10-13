var drawNotes = function (svg, diagram, notes) {

  var converter = new showdown.Converter({extensions: ['prettify']});
  converter.setOption('prefixHeaderId', 'notes-');
  converter.setOption('tables', 'true');


  var xAlign = {
    left: {
      textAlign: "left",
      alignItems: "flex-start"
    },
    right: {
      textAlign: "right",
      alignItems: "flex-end"
    },
    center: {
      textAlign: "center",
      alignItems: "center"
    }
  }
  var yAlign = {
    top: {
      justifyContent: "flex-start"
    },
    center: {
      justifyContent: "center"
    },
    bottom: {
      justifyContent: "flex-end"
    }
  }

  var notes = svg.selectAll("notes")
    .data(d3.entries(notes))
    .enter()

  var notesg = notes.append("g")
    .attr("transform", function(d) { return "translate(" + d.value.x1 + "," + d.value.y1 + ")" })

  var noteFill = notesg
    .append("rect")
    .attr("rx", function(d) { return d.value.rx })
    .attr("ry", function(d) { return d.value.ry })
    .attr("width", function(d) { return d.value.width })
    .attr("height", function(d) { return d.value.height })
    .attr("id", function(d) { return d.key })
    .attr("fill", function(d) { return d.value.fill || "red" })
    .style("stroke", function(d) { return d.value.stroke || "red" })

  var noteTextDiv = notesg
    .append("foreignObject")
    .attr("width", function(d) { return d.value.width + "px" })
    .attr("height", function(d) { return d.value.height + "px" })
    .append("xhtml:div")
    .style("width", function(d) { return d.value.width + "px" })
    .style("height", function(d) { return d.value.height + "px" })
    .style('font-size', Math.min(diagram.yBand.bandwidth() * .125, diagram.xBand.bandwidth() * .125)  + 'px')
    .style('display', 'flex')
    .style('padding', function(d) { return d.value.padding + "px"})
    .attr("class", "notes")
    .style("color", function(d) { return d.value.color || "white" })
    .style('flex-direction', function(d) { return d.value.flexDirection || "column" } )
    .style('align-items', function(d) { return d.value.alignItems || xAlign[d.value.xAlign].alignItems })
    .style('justify-content', function(d) { return d.value.justifyContent || yAlign[d.value.yAlign].justifyContent })
    .style('text-align', function(d) { return d.value.textAlign || xAlign[d.value.xAlign].textAlign })
    .html( function (d) { return converter.makeHtml(d.value.text || "Missing text in note") })
}
