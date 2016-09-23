var drawGridLines = function (svg, drawing, x, y) {

    function make_x_gridlines() {
      return d3.axisBottom(x)
    }
    function make_y_gridlines() {
      return d3.axisLeft(y)
    }
      // X gridlines
      svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${ drawing.height + drawing.y })`)
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
      .attr("transform", `translate(0,${ drawing.height + drawing.y })`)
        .attr("class", "axisNone")
        .call(d3.axisBottom(x));

        // add the Y Axis
      svg.append("g")
      .attr("transform", `translate(${drawing.x},0)`)
        .attr("class", "axisNone")
        .call(d3.axisLeft(y));
}
