// Growing Neurons
// Alex Norton :: 2016
// https://github.com/alexnortn/Explore.Eye

// Recursive Neuron (w/ ArrayList)

// Poisson-disc sampler, converting D3 implementation to animated p5js
// Ok, you need to learn this

var width = 960,
    height = 500;

var sample = poissonDiscSampler(width, height, 10); // Ahh, the initialization

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.timer(function() {
  for (var i = 0; i < 10; ++i) { // Run up to 10 concurrent samples
    var s = sample();
    if (!s) return true; // If we already have a sample, return
    svg.append("circle") // Othewise, add a new circle to the simulation
        .attr("cx", s[0])
        .attr("cy", s[1])
        .attr("r", 0)
      .transition()      // Do a nice transition
        .attr("r", 2);
  }
});

// Based on https://www.jasondavies.com/poisson-disc/
function poissonDiscSampler(width, height, radius) {
  // This is a closure, only initialized once, then returns a function
  var k = 30, // maximum number of samples before rejection
      radius2 = radius * radius,
      R = 3 * radius2,
      cellSize = radius * Math.SQRT1_2,
      gridWidth = Math.ceil(width / cellSize),
      gridHeight = Math.ceil(height / cellSize),
      grid = new Array(gridWidth * gridHeight),
      queue = [],
      queueSize = 0,
      sampleSize = 0;

  return function() {
     // If we're just starting or wrapping up
     // Make a new sample, at a random location
    if (!sampleSize) return makeSample(Math.random() * width, Math.random() * height);

    // Pick a random existing sample and remove it from the queue.
    while (queueSize) {
      var i = Math.random() * queueSize | 0, // Return integer
          s = queue[i];

      // Make a new candidate between [radius, 2 * radius] from the existing sample.
      for (var j = 0; j < k; ++j) {
        var a = 2 * Math.PI * Math.random(),
            r = Math.sqrt(Math.random() * R + radius2),
            x = s[0] + r * Math.cos(a), // Polar Coordinates around existing sample 
            y = s[1] + r * Math.sin(a); // Polar Coordinates around existing sample

        // Reject candidates that are outside the allowed extent,
        // or closer than 2 * radius to any existing sample.
        if (0 <= x && x < width && 0 <= y && y < height && far(x, y)) return sample(x, y);
      }

      queue[i] = queue[--queueSize];
      queue.length = queueSize;
    }
  };

  function far(x, y) {  // Given sample location
    var i = x / cellSize | 0, // Locate self within grid
        j = y / cellSize | 0, // Locate self within grid
        i0 = Math.max(i - 2, 0),
        j0 = Math.max(j - 2, 0),
        i1 = Math.min(i + 3, gridWidth),
        j1 = Math.min(j + 3, gridHeight);

    for (j = j0; j < j1; ++j) {
      var o = j * gridWidth;
      for (i = i0; i < i1; ++i) {
        if (s = grid[o + i]) {
          var s,
              dx = s[0] - x,
              dy = s[1] - y;
          if (dx * dx + dy * dy < radius2) return false;
        }
      }
    }

    return true;
  }

  function makeSample(x, y) {
    var s = [x, y];
    queue.push(s);
    grid[gridWidth * (y / cellSize | 0) + (x / cellSize | 0)] = s; // Locate self within grid
    ++sampleSize;
    ++queueSize;
    return s;
  }
}