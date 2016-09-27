function doc_keyUp(e) {
    // this would test for whichever key is 40 and the ctrl key at the same time
    if (e.ctrlKey && e.keyCode == 13) {
        e.preventDefault()
        // call your function to do the thing
        document.getElementById('draw').click();
        return false;
    }
}
// register the handler
document.addEventListener('keyup', doc_keyUp, false);


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
