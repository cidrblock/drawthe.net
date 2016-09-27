var drawObjects = function (svg, objects) {
  var deviceCellsAll = svg.selectAll("cells")
    .data(d3.entries(objects))
    .enter()

  var cells = deviceCellsAll.append("g")
    .attr("transform", function(d) { return "translate(" + diagram.xBand(d.value.x) + "," + diagram.yBand(d.value.y) + ")" })

  var cellFill = cells
    .append("rect")
    .attr("rx", function(d) { return d.value.rx })
    .attr("ry", function(d) { return d.value.ry })
    .attr("width", function(d) { return d.value.width })
    .attr("height", function(d) { return d.value.height })
    .attr("id", function(d) { return d.key })
    .attr("fill", function(d) { return d.value.backgroundColor })
    .style("stroke", function(d) { return d.value.borderColor || 'none' })

  var cellText = cells
    .append("text")
    .text( function (d) { return d.key })
    .attr("x", function(d) { return d.value.width/2 })
    .attr("y", function(d) { return d.value.height * .95})
    .attr("text-anchor", "middle")
    .style("font-size", function(d) { return Math.min(d.value.width*.9 / this.getComputedTextLength() * 12, d.value.height/3/2) + "px"; })
    .attr('fill', function(d) { return d.value.color || "white"} )

  var icon = cells
    .append('text')
    .attr("x", function(d) { return d.value.width/2 })
    .attr("y", function(d) { return d.value.height * .7})
    .attr('text-anchor', 'middle')
    .style('font-family', function(d) { return d.value.font })
    .style('font-size', function(d) { return Math.min(d.value.width*.9,d.value.height*.8*.9)  + 'px' })
    .style("dominant-baseline", "alphabetic")
    .attr('fill', function(d) { return d.value.iconColor || "white"} )
    .text(function (d) {
         return fonts[d.value.font][d.value.type];
      });
}

// Create a blank canvas (by not filling a background color).
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// Fill it with some coloured text.. (black is default)
ctx.font = "48px serif";
ctx.textBaseline = "hanging";
ctx.fillText("Hello world", 0, 0);

// Remove the surrounding transparent pixels
// result is an actual canvas element
var result = trim(canvas);

// you could query it's width, draw it, etc..
document.body.appendChild(result);

// get the height of the trimmed area
console.log(result.height);

// Trim Canvas Pixels Method
// https://gist.github.com/remy/784508
function bounds(c) {

  var ctx = c.getContext('2d'),

    // create a temporary canvas in which we will draw back the trimmed text
    copy = document.createElement('canvas').getContext('2d'),

    // Use the Canvas Image Data API, in order to get all the
    // underlying pixels data of that canvas. This will basically
    // return an array (Uint8ClampedArray) containing the data in the
    // RGBA order. Every 4 items represent one pixel.
    pixels = ctx.getImageData(0, 0, c.width, c.height),

    // total pixels
    l = pixels.data.length,

    // main loop counter and pixels coordinates
    i, x, y,

    // an object that will store the area that isn't transparent
    bound = { top: null, left: null, right: null, bottom: null };

  // for every pixel in there
  for (i = 0; i < l; i += 4) {

    // if the alpha value isn't ZERO (transparent pixel)
    if (pixels.data[i+3] !== 0) {

      // find it's coordinates
      x = (i / 4) % c.width;
      y = ~~((i / 4) / c.width);

      // store/update those coordinates
      // inside our bounding box Object

      if (bound.top === null) {
        bound.top = y;
      }

      if (bound.left === null) {
        bound.left = x;
      } else if (x < bound.left) {
        bound.left = x;
      }

      if (bound.right === null) {
        bound.right = x;
      } else if (bound.right < x) {
        bound.right = x;
      }

      if (bound.bottom === null) {
        bound.bottom = y;
      } else if (bound.bottom < y) {
        bound.bottom = y;
      }
    }
  }

  // actual height and width of the text
  // (the zone that is actually filled with pixels)
  var trimHeight = bound.bottom - bound.top,
      trimWidth = bound.right - bound.left,

      // get the zone (trimWidth x trimHeight) as an ImageData
      // (Uint8ClampedArray of pixels) from our canvas
      trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);

  // Draw back the ImageData into the canvas
  return trimmed
}
