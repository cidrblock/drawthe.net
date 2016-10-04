var drawGridLines = function (svg, drawing) {
  if (drawing.gridLines) {
    function make_x_gridlines() {
      return d3.axisBottom(drawing.xBand)
    }
    function make_y_gridlines() {
      return d3.axisLeft(drawing.yBand)
    }
    // X gridlines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + drawing.height + drawing.y + ")")
      .call(make_x_gridlines()
        .tickSize(-drawing.height)
        .tickFormat("")
        .ticks(drawing.columns)
      )
    // Y gridlines
    svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(" + drawing.x + "," + drawing.y + ")")
    .call(make_y_gridlines()
      .tickSize(-drawing.width)
      .tickFormat("")
      .ticks(drawing.rows)
    )
    // add the X Axis
    svg.append("g")
      .attr("transform", "translate(0," + drawing.height + drawing.y + ")")
      .attr("class", "axisNone")
      .call(d3.axisBottom(drawing.xBand));
    // add the Y Axis
    svg.append("g")
      .attr("transform", "translate(" + drawing.x + ",0)")
      .attr("class", "axisNone")
      .call(d3.axisLeft(drawing.yBand));
  }
}
