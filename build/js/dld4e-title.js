var drawTitle = function (svg, drawing, title) {
  if (title.heightPercentage > 0) {
    // title bar
    axisPadding = 20
    title.x1 = drawing.x - axisPadding
    title.y1 = drawing.height + drawing.y + axisPadding
    title.x2 = drawing.x + drawing.width + axisPadding
    title.y2 = title.y1 + title.height + axisPadding
    title.width = title.x2 - title.x1

    var titleBox = svg.append("g")
      .attr("transform", "translate(" + title.x1 + "," + title.y1 + ")")

    if (title.type == "bar") {
      titleBox.append("line")
        .attr("stroke", title.stroke )
        .attr("x2", title.width)
        .attr("fill", title.fill)
    } else {
      titleBox.append("rect")
        .attr("fill", title.fill)
        .attr("stroke", title.stroke )
        .attr('width', title.width)
        .attr('height', title.height)
    }

    // image and imagefill
    var padding = title.height * .025
    var titleInner = titleBox.append("g")
      .attr("transform", "translate(" + padding + "," + padding + ")")

    var logo = titleInner.append("g")
    logo.append("rect")
      .attr('width', title.height - 2*padding)
      .attr('height', title.height - 2*padding)
      .attr("fill", title.logoFill)
    logo.append("svg:image")
      .attr('width', title.height - 2*padding)
      .attr('height', title.height - 2*padding)
      .attr("xlink:href", title.logoUrl)

    // the text
    titleInner.append("text")
      .attr("x", title.height)
      .attr("y", title.height * 2/5)
      .attr("dominant-baseline", "middle")
      .style("fill", title.color)
      .style('font-size', title.height * .5 + 'px')
      .text(title.text)

    // the subtext
    titleInner.append("text")
      .attr("x", title.height)
      .attr("y", title.height * 4/5)
      .attr("dominant-baseline", "middle")
      .style("fill", title.color)
      .style('font-size', title.height * .25 + 'px')
      .text(title.subText)

    // credits and detail
    // Author
    titleInner.append("text")
      .attr("x", title.width - title.width/5)
      .attr("y", title.height * 1/8)
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "end")  // set anchor y justification
      .style("fill", title.color)
      .style('font-size', title.height * .25 + 'px')
      .style("font-weight", "bold")
      .text("Author:")

    titleInner.append("text")
      .attr("x", title.width - title.width/5 + 2*padding)
      .attr("y", title.height * 1/8)
      .attr("dominant-baseline", "middle")
      .style("fill", title.color)
      .style('font-size', title.height * .25 + 'px')
      .text(title.author)

      // Company
    titleInner.append("text")
      .attr("x", title.width - title.width/5)
      .attr("y", title.height * 3/8)
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "end")  // set anchor y justification
      .style("fill", title.color)
      .style('font-size', title.height * .25 + 'px')
      .style("font-weight", "bold")
      .text("Company:")

    titleInner.append("text")
      .attr("x", title.width - title.width/5 + 2*padding)
      .attr("y", title.height * 3/8)
      .attr("dominant-baseline", "middle")
      .style("fill", title.color)
      .style('font-size', title.height * .25 + 'px')
      .text(title.company)

    // Date
    titleInner.append("text")
      .attr("x", title.width - title.width/5)
      .attr("y", title.height * 5/8)
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "end")  // set anchor y justification
      .style("fill", title.color)
      .style('font-size', title.height * .25 + 'px')
      .style("font-weight", "bold")
      .text("Date:")

    titleInner.append("text")
      .attr("x", title.width - title.width/5 + 2*padding)
      .attr("y", title.height * 5/8)
      .attr("dominant-baseline", "middle")
      .style("fill", title.color)
      .style('font-size', title.height * .25 + 'px')
      .text(title.date)

    // Version
    titleInner.append("text")
      .attr("x", title.width - title.width/5)
      .attr("y", title.height * 7/8)
      .attr("dominant-baseline", "middle")
      .attr("text-anchor", "end")  // set anchor y justification
      .style("fill", title.color)
      .style('font-size', title.height * .25 + 'px')
      .style("font-weight", "bold")
      .text("Version:")

    titleInner.append("text")
      .attr("x", title.width - title.width/5 + 2*padding)
      .attr("y", title.height * 7/8)
      .attr("dominant-baseline", "middle")
      .style("fill", title.color)
      .style('font-size', title.height * .25 + 'px')
      .text(title.version)
  }
}
