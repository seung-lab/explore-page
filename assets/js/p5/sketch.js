// Alex Norton
// a^N 
// http://alexnortn.com

// var bodyParser = require('body-parser');

// Load P5js


// Reference to physics world
var physics;

var aLockVert = [],
    aSpringVert = [],
    aSpringArr = [],
    aCounterLockVert = [],
    aCounterSpringVert = [],
    aCounterSpringArr = [],
    nLockVert = [],
    nSpringVert = [],
    nSpringArr = [],
    w,h,
    gravity,
    gravityStrength,
    xOff,
    mousePos,
    scaleFactor,
    nScaleFactor,
    center,
    glyphCenter,
    nOffset,
    phi,
    alphaOpa,
    timeOut,
    timeOut1,
    alphaOpa1,
    buttonFade,
    buttonFade1,
    lineOp,
    glyphOp,
    tempSelection,
    aCenterOffset,
    liveText,
    describeText,
    describeText1,
    hover,
    clockBool,
    bigGlyph,
    interestsArr = [],
    aVerts = [],
    aCounterVerts = [],
    nVerts = [];

// This will be our JSON object for the phys sim
var vertices;
var nudgeAttractor; 
var dashButton;

var descriptiveText  = "This interactive visualization of interest was developed using the P5js framework along with the Toxiclibs physics library."; 
var descriptiveText1 = "Vertices used to construct the character are influenced by an underlying physics system and mapped to extend towards difference areas of my interest.";

function preload() {
  vertices = loadJSON("javascripts/p5/data/verts.json");
}

function setup() {
  noStroke();
  phi = (1 + sqrt(5)) / 2;
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  canvas.parent('interactive');
  w = windowWidth;
  h = windowHeight;
  scaleFunc(w,h);

  /*

    Toggle the clock, scale glyph

  */

      clockBool = true;
      clockBool ? bigGlyph = 0.75 : bigGlyph = 1.25;

  mousePos = createVector();
  xOff = 0;
  alphaOpa = 0;
  alphaOpa1 = 0;
  glyphOp = 0;
  buttonFade = 0;
  buttonFade1 = 0;
  lineOp = 0;
  timeOut = 500;
  timeOut1 = 400;
  hover = false;

  // Address N Scaling
  nScaleFactor = 0.3;
  nOffset = createVector(250, -500);

  // Centering functions
  center = createVector(w/2, h/2);
  glyphCenter = createVector();
  aCenterOffset = createVector();
  centerGlyph(vertices);
  findCenter();

  // Load the arrays
  loadArrays(vertices);

  // Initialize the physics
  physics=new VerletPhysics2D();
  physics.setDrag (0.01);
  gravityStrength = new Vec2D(0,0.5);
  gravity = new GravityBehavior(gravityStrength);
  physics.addBehavior(gravity);

  // Set the world's bounding box
  physics.setWorldBounds(new Rect(0,0,width*1.25,height*1.25));

  // Initiate the physics array
  physInit();
  
  // Make our Node Object
  nudgeAttractor = new Nudge(new Vec2D(width/2,height/2),24,width/2,0.1);

  // Make the button
  dashButton = new MakeButton(0,0,50);

  // Create text node
  liveText = createP().id('interests');
  liveText.parent('interactive');
  liveText.style("opacity", "0");
  describeText = createP(descriptiveText).class('describe');
  describeText.parent('interactive');
  describeText.style("opacity", "0");
  describeText1 = createP(descriptiveText1).class('describe');
  describeText1.parent('interactive');
  describeText1.style("opacity", "0");

  interestsArr.push('Artificial Intelligence','Neuroscience','Game Design','Graphic Design','Architecture','Urban Design','Physics','Computation');

}

function draw() {

  // Update the physics world
  physics.update();

  // Update the attractor position
  touchIsDown ? mousePos.set(touchX ,touchY) : mousePos.set(mouseX,mouseY);
  nudgeAttractor.set(mousePos.x ,mousePos.y);

  background(255);
  // motionBlur();

  // Draw the bezier Shapes 
  drawBasicA();
  drawBasicN();

  // Set timeout for loading the clockViz
  if (timeOut > 0) timeOut--;
  if ((timeOut == 0) && (clockBool)) {
    // clockViz(); 
  } 

  if (timeOut1 > 0) timeOut1--;
  if (timeOut1 == 0) {
    fadeInButton();
  } 

  // Display the Physiscs Particles;
  displayPhys();

  // Button Interactivity
  hoverButton1();

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  w = windowWidth;
  scaleFunc(w,h);
  // Empty the Physics Sim
  physEmpty();
  findCenter();
  centerGlyph(vertices);
  // Reload the Arrays
  loadArrays(vertices);
  // Initiate the physics array
  physInit();
}

function drawBezier(vertices) {

  beginShape();
  for (var i = 0; i < vertices.a_vertex.length; i++) {
  if(vertices.a_vertex[i].vertexType == true) {
    bezierVertex(
    vertices.a_vertex[i].x, vertices.a_vertex[i].y,
    vertices.a_vertex[i++].x, vertices.a_vertex[i].y,
    vertices.a_vertex[i++].x, vertices.a_vertex[i].y
    );
  } else {
    vertex(vertices.a_vertex[i].x, vertices.a_vertex[i].y);
  }
  }
  endShape(CLOSE);

}

function drawBasicA(){
  var fadeSpeed = 2;
  if (glyphOp < 255) glyphOp += fadeSpeed;
  noStroke();
  fill(35,35,35,glyphOp);
  beginShape();
  vertex(aSpringVert[0].x, aSpringVert[0].y);
  vertex(aSpringVert[1].x, aSpringVert[1].y);
  bezierVertex(aSpringVert[2].x, aSpringVert[2].y, aSpringVert[3].x, aSpringVert[3].y, aSpringVert[4].x, aSpringVert[4].y);
  bezierVertex(aSpringVert[5].x, aSpringVert[5].y, aSpringVert[6].x, aSpringVert[6].y, aSpringVert[7].x, aSpringVert[7].y);
  bezierVertex(aSpringVert[8].x, aSpringVert[8].y, aSpringVert[9].x, aSpringVert[9].y, aSpringVert[10].x, aSpringVert[10].y);
  bezierVertex(aSpringVert[11].x, aSpringVert[11].y, aSpringVert[12].x, aSpringVert[12].y, aSpringVert[13].x, aSpringVert[13].y);
  bezierVertex(aSpringVert[14].x, aSpringVert[14].y, aSpringVert[15].x, aSpringVert[15].y, aSpringVert[16].x, aSpringVert[16].y);
  bezierVertex(aSpringVert[17].x, aSpringVert[17].y, aSpringVert[18].x, aSpringVert[18].y, aSpringVert[19].x, aSpringVert[19].y);
  vertex(aSpringVert[20].x, aSpringVert[20].y);
  bezierVertex(aSpringVert[21].x, aSpringVert[21].y, aSpringVert[22].x, aSpringVert[22].y, aSpringVert[23].x, aSpringVert[23].y);
  bezierVertex(aSpringVert[24].x, aSpringVert[24].y, aSpringVert[25].x, aSpringVert[25].y, aSpringVert[26].x, aSpringVert[26].y);
  bezierVertex(aSpringVert[27].x, aSpringVert[27].y, aSpringVert[28].x, aSpringVert[28].y, aSpringVert[29].x, aSpringVert[29].y);
  bezierVertex(aSpringVert[30].x, aSpringVert[30].y, aSpringVert[31].x, aSpringVert[31].y, aSpringVert[32].x, aSpringVert[32].y);
  bezierVertex(aSpringVert[33].x, aSpringVert[33].y, aSpringVert[34].x, aSpringVert[34].y, aSpringVert[35].x, aSpringVert[35].y);
  bezierVertex(aSpringVert[36].x, aSpringVert[36].y, aSpringVert[37].x, aSpringVert[37].y, aSpringVert[38].x, aSpringVert[38].y);
  bezierVertex(aSpringVert[39].x, aSpringVert[39].y, aSpringVert[40].x, aSpringVert[40].y, aSpringVert[41].x, aSpringVert[41].y);
  bezierVertex(aSpringVert[42].x, aSpringVert[42].y, aSpringVert[43].x, aSpringVert[43].y, aSpringVert[44].x, aSpringVert[44].y);
  bezierVertex(aSpringVert[45].x, aSpringVert[45].y, aSpringVert[46].x, aSpringVert[46].y, aSpringVert[47].x, aSpringVert[47].y);
  vertex(aSpringVert[48].x, aSpringVert[48].y);
  bezierVertex(aSpringVert[49].x, aSpringVert[49].y, aSpringVert[50].x, aSpringVert[50].y, aSpringVert[51].x, aSpringVert[51].y);
  bezierVertex(aSpringVert[52].x, aSpringVert[52].y, aSpringVert[53].x, aSpringVert[53].y, aSpringVert[54].x, aSpringVert[54].y);
  endShape(CLOSE);
  fill(255);
  beginShape();
  vertex(aCounterSpringVert[0].x, aCounterSpringVert[0].y);
  vertex(aCounterSpringVert[1].x, aCounterSpringVert[1].y);
  bezierVertex(aCounterSpringVert[2].x, aCounterSpringVert[2].y, aCounterSpringVert[3].x, aCounterSpringVert[3].y, aCounterSpringVert[4].x, aCounterSpringVert[4].y);
  bezierVertex(aCounterSpringVert[5].x, aCounterSpringVert[5].y, aCounterSpringVert[6].x, aCounterSpringVert[6].y, aCounterSpringVert[7].x, aCounterSpringVert[7].y);
  bezierVertex(aCounterSpringVert[8].x, aCounterSpringVert[8].y, aCounterSpringVert[9].x, aCounterSpringVert[9].y, aCounterSpringVert[10].x, aCounterSpringVert[10].y);
  bezierVertex(aCounterSpringVert[11].x, aCounterSpringVert[11].y, aCounterSpringVert[12].x, aCounterSpringVert[12].y, aCounterSpringVert[13].x, aCounterSpringVert[13].y);
  endShape(CLOSE);
}

function drawBasicN(){
  var fadeSpeed = 2;
  if (glyphOp < 255) glyphOp += fadeSpeed;
  noStroke();
  fill(35,35,35,glyphOp);
  beginShape();
    vertex(nSpringVert[0].x, nSpringVert[0].y);
    vertex(nSpringVert[1].x, nSpringVert[1].y);
    vertex(nSpringVert[2].x, nSpringVert[2].y);
    vertex(nSpringVert[3].x, nSpringVert[3].y);
    vertex(nSpringVert[4].x, nSpringVert[4].y);
    vertex(nSpringVert[5].x, nSpringVert[5].y);
    vertex(nSpringVert[6].x, nSpringVert[6].y);
    vertex(nSpringVert[7].x, nSpringVert[7].y);
    vertex(nSpringVert[8].x, nSpringVert[8].y);
    vertex(nSpringVert[9].x, nSpringVert[9].y);
  endShape(CLOSE);
}

function rayTest2() {
  var springVector = createVector(aSpringVert[5].x, aSpringVert[5].y);
  var lenOffset = springVector.dist(mouseVector);
  var lenMag = 150;
  var rayVector = createVector();
      rayVector.x = mouseVector.x + (mouseVector.x - springVector.x) / lenOffset * lenMag;
      rayVector.y = mouseVector.y + (mouseVector.y - springVector.y) / lenOffset * lenMag;

      ellipse(rayVector.x, rayVector.y, 10, 10);
      strokeWeight(1);
      stroke(0);
      line(springVector.x, springVector.y, rayVector.x, rayVector.y);
}

function clockDisp(alphaOpa) {
  var interests = 8;
  var tempLoc = createVector();
  var theta = TAU / interests;
  var radLen = ( w < h ? w : h ) / 2.75;
  var fadeSpeed1 = 10;

  for (var i = 0; i < interests; i++) {
    var selection;
    var x = (radLen * sin(theta * i)) + center.x;
    var y = (radLen * cos(theta * i)) + center.y - 50; // 50 = relative y offset

    // Display the clock ellipses
    fill(0,0,0, alphaOpa);
    noStroke();
    ellipse(x, y, 8, 8);

    // Calc distance to local point in clock array
    tempLoc.set(x,y);
    var dist1 = mousePos.dist(tempLoc);
    if (dist1 < 75) {
      // FadeIn content
      cursor(CROSS);
      if (alphaOpa1 < 255) alphaOpa1 += fadeSpeed1;
      tempSelection = i;
      nudgeAttractor.hover();

    } else {
      // FadeOut content
      if (i == tempSelection) {
        while (alphaOpa1 > 30) {
          cursor(ARROW);
          alphaOpa1 -= fadeSpeed1 * 3;  
        } if ((alphaOpa1 < 30) && (alphaOpa1 > 0)) alphaOpa1 -= fadeSpeed1 / 10;  

        nudgeAttractor.away();
      }
    }
    if (i == tempSelection) {
      // Display the proper interest type if hovered
      if (alphaOpa1 > 0) {
        interestDisp(i, x, y, alphaOpa1);
        dashedCircle(x, y, alphaOpa1);
        displayPhys1(x, y, alphaOpa1);
      }
    }
  }

}

function clockViz() {
  var fadeSpeed = 2;
    if ((w > 1000) && (h > 850)) {
      if (alphaOpa < 255) alphaOpa += fadeSpeed;
    } else {
      if (alphaOpa > 0) alphaOpa -= fadeSpeed;
      // Also control button fading as well
      fadeOutButton();
    }
  if (alphaOpa > 0) clockDisp(alphaOpa);
}

function dashedCircle(x,y,opacity) {
  // Dashed line around point using Polar Coordinates
  var circleRad = 12;
  var pointAmount = 25;
  var theta1 = TAU / pointAmount;
  for (var j = 0; j < pointAmount; j++) {
    var x1 = (circleRad * sin(theta1 * j)) + x;
    var y1 = (circleRad * cos(theta1 * j)) + y;
    push();
      fill(0,0,0,opacity);
      ellipse(x1, y1,1,1);
    pop();
  }
}

// Setup the dynamic arrays --> center them on the page
function loadArrays(vertices) {
  // Always set the arrays to zero, in order to center properly
  aVerts.length = 0;
  aCounterVerts.length = 0;
  nVerts.length = 0;
  for(var i in vertices.a_vertex) {
  aVerts.push(createVector(vertices.a_vertex[i].x, vertices.a_vertex[i].y));
    aVerts[i].x *= scaleFactor;
    aVerts[i].x += (glyphCenter.x);
    aVerts[i].y *= scaleFactor;
    aVerts[i].y += (glyphCenter.y);
  }
  for(var j in vertices.counter_vertex) {
  aCounterVerts.push(createVector(vertices.counter_vertex[j].x, vertices.counter_vertex[j].y));
    aCounterVerts[j].x *= scaleFactor;
    aCounterVerts[j].x += (glyphCenter.x);
    aCounterVerts[j].y *= scaleFactor;
    aCounterVerts[j].y += (glyphCenter.y);
  }
  for(var k in vertices.n_vertex) {
  nVerts.push(createVector(vertices.n_vertex[k].x, vertices.n_vertex[k].y));
    nVerts[k].x *= nScaleFactor;
    nVerts[k].x += nOffset.x;
    nVerts[k].x *= scaleFactor;
    nVerts[k].x += glyphCenter.x;
    nVerts[k].y *= nScaleFactor;
    nVerts[k].y += nOffset.y
    nVerts[k].y *= scaleFactor;
    nVerts[k].y += glyphCenter.y;
  }
}

function displayPhys() {
    for(var i in aVerts) {
        strokeWeight(scaleFactor);
        var aVertPos = createVector(aLockVert[i].x, aLockVert[i].y);
        var trans = map(aVertPos.dist(mousePos), 0, center.x/2, 100, 0);
        var strokeCol = color(255,0,0,trans);
        fill(strokeCol);
        stroke(strokeCol);
        ellipse(aLockVert[i].x,aLockVert[i].y,scaleFactor,scaleFactor);
        line(aLockVert[i].x,aLockVert[i].y,aSpringVert[i].x,aSpringVert[i].y);
        aLockVert[i].display();
        aSpringVert[i].display();
    }
    // Display and draw line between the 'a counter' vertices
    for(var i in aCounterVerts) {
        strokeWeight(scaleFactor);
        var aVertPos = createVector(aCounterLockVert[i].x, aCounterLockVert[i].y);
        var trans = map(aVertPos.dist(mousePos), 0, center.x/2, 100, 0);
        var strokeCol = color(255,0,0,trans);
        stroke(strokeCol);
        fill(strokeCol);
        ellipse(aCounterLockVert[i].x,aCounterLockVert[i].y,scaleFactor,scaleFactor);
        line(aCounterLockVert[i].x,aCounterLockVert[i].y,aCounterSpringVert[i].x,aCounterSpringVert[i].y);
        aCounterLockVert[i].display();
        aCounterSpringVert[i].display();
    }
    // Display and draw line between the 'N' vertices
    for(var i in nVerts) {
        strokeWeight(scaleFactor);
        var aVertPos = createVector(nLockVert[i].x, nLockVert[i].y);
        var trans = map(aVertPos.dist(mousePos), 0, center.x/2, 100, 0);
        var strokeCol = color(255,0,0,trans);
        stroke(strokeCol);
        fill(strokeCol);
        ellipse(nLockVert[i].x,nLockVert[i].y,scaleFactor,scaleFactor);
        line(nLockVert[i].x,nLockVert[i].y,nSpringVert[i].x,nSpringVert[i].y);
        nLockVert[i].display();
        nSpringVert[i].display();
    }
}

function displayPhys1(x, y, alphaOpa1) {
    strokeWeight(scaleFactor);
    var locConverge = createVector(x,y);
    for(var i in aVerts) {
        var aVertPos = createVector(aSpringVert[i].x, aSpringVert[i].y);
        var trans = map(aVertPos.dist(locConverge), 0, center.x, 100, 0);
        var strokeCol = color(255,0,0,trans);
        fill(strokeCol);
        stroke(strokeCol);
        ellipse(aSpringVert[i].x,aSpringVert[i].y,scaleFactor,scaleFactor);
        line(aSpringVert[i].x,aSpringVert[i].y,locConverge.x,locConverge.y);
    }
    // Display and draw line between the 'a counter' vertices
    for(var i in aCounterVerts) {
        strokeWeight(scaleFactor);
        var aVertPos = createVector(aCounterSpringVert[i].x, aCounterSpringVert[i].y);
        var trans = map(aVertPos.dist(locConverge), 0, center.x, 100, 0);
        var strokeCol = color(255,0,0,trans);
        stroke(strokeCol);
        fill(strokeCol);
        ellipse(aCounterSpringVert[i].x,aCounterSpringVert[i].y,scaleFactor,scaleFactor);
        line(locConverge.x,locConverge.y,aCounterSpringVert[i].x,aCounterSpringVert[i].y);
    }
    // Display and draw line between the 'N' vertices
    for(var i in nVerts) {
        strokeWeight(scaleFactor);
        var aVertPos = createVector(nSpringVert[i].x, nSpringVert[i].y);
        var trans = map(aVertPos.dist(locConverge), 0, center.x, 100, 0);
        var strokeCol = color(255,0,0,trans);
        stroke(strokeCol);
        fill(strokeCol);
        ellipse(nSpringVert[i].x,nSpringVert[i].y,scaleFactor,scaleFactor);
        line(locConverge.x,locConverge.y,nSpringVert[i].x,nSpringVert[i].y);
    }
}

function physInit() {
    var springStrength = 0.00035,
        springLength   = 0.05;

      // Make our ToxiParticles for 'a'
      for(var i in aVerts) {
          aLockVert.push(new Particle(new Vec2D(aVerts[i].x, aVerts[i].y)));
              aLockVert[i].lock();
          aSpringVert.push(new Particle(new Vec2D(aVerts[i].x, aVerts[i].y)));
          aSpringArr.push(new VerletSpring2D(aLockVert[i], aSpringVert[i],springLength, springStrength));
              physics.addParticle(aLockVert[i]);
              physics.addParticle(aSpringVert[i]);
              physics.addSpring(aSpringArr[i]);
    }

    // Make our ToxiParticles for 'a counter'
    for(var i in aCounterVerts) {
        aCounterLockVert.push(new Particle(new Vec2D(aCounterVerts[i].x, aCounterVerts[i].y)));
            aCounterLockVert[i].lock();
        aCounterSpringVert.push(new Particle(new Vec2D(aCounterVerts[i].x, aCounterVerts[i].y)));
        aCounterSpringArr.push(new VerletSpring2D(aCounterLockVert[i], aCounterSpringVert[i],springLength, springStrength));
            physics.addParticle(aCounterLockVert[i]);
            physics.addParticle(aCounterSpringVert[i]);
            physics.addSpring(aCounterSpringArr[i]);
    }

    // Make our ToxiParticles for 'N'
    for(var i in nVerts) {
        nLockVert.push(new Particle(new Vec2D(nVerts[i].x, nVerts[i].y)));
            nLockVert[i].lock();
        nSpringVert.push(new Particle(new Vec2D(nVerts[i].x, nVerts[i].y)));
        nSpringArr.push(new VerletSpring2D(nLockVert[i], nSpringVert[i],springLength, springStrength));
            physics.addParticle(nLockVert[i]);
            physics.addParticle(nSpringVert[i]);
            physics.addSpring(nSpringArr[i]);
    }
}

function physEmpty() {
  if (aSpringArr.length == aVerts.length) {
    for(var i in aSpringArr) {
      physics.removeSpringElements(aSpringArr[i]);
    } 
    aSpringArr.length  = 0;
    aLockVert.length   = 0;
    aSpringVert.length = 0;
  }
  if (aCounterSpringArr.length == aCounterVerts.length) {
    for(var i in aCounterSpringArr) {
      physics.removeSpringElements(aCounterSpringArr[i]);
    }
    aCounterSpringArr.length  = 0;
    aCounterLockVert.length   = 0;
    aCounterSpringVert.length = 0;
  }

  if (nSpringArr.length == nVerts.length) {
    for(var i in nSpringArr) {
      physics.removeSpringElements(nSpringArr[i]);
    }
    nSpringArr.length  = 0;
    nLockVert.length   = 0;
    nSpringVert.length = 0;
  }
}

function findCenter() {
  w = windowWidth;
  h = windowHeight;
  center.set(w/2, h/2);
  var glyphCenterX = center.x - aCenterOffset.x; 
  var glyphCenterY = center.y + aCenterOffset.y - 75; 
  glyphCenter.set(glyphCenterX, glyphCenterY);
}

function centerGlyph(vertices) {
  var xArray = [];
  var yArray = [];
  var xArrayN = [];
  var yArrayN = [];

  for (var i in vertices.a_vertex) xArray.push(vertices.a_vertex[i].x * scaleFactor);
  for (var i in vertices.a_vertex) yArray.push(vertices.a_vertex[i].y * scaleFactor);
  for (var i in vertices.n_vertex) xArrayN.push(vertices.n_vertex[i].x * scaleFactor * nScaleFactor);
  for (var i in vertices.n_vertex) yArrayN.push(vertices.n_vertex[i].y * scaleFactor * nScaleFactor);

  var xMin = arrayMin(xArray);
  var yMin = arrayMin(yArray);
  var xMax = arrayMax(xArray);
  var yMax = arrayMax(yArray);
  var xMinN = arrayMin(xArrayN);
  var yMinN = arrayMin(yArrayN);
  var xMaxN = arrayMax(xArrayN);
  var yMaxN = arrayMax(yArrayN);

  var xCenter = ((xMaxN + xMax) - (xMinN +xMin)) / 2;
  var yCenter = (((yMaxN+ yMax) - (yMinN + yMin)) / 2) - 75;

  aCenterOffset.set(xCenter, yCenter);
  return aCenterOffset;

}

//  Calculation Min/Max of any array

function arrayMin(arr) {
  return arr.reduce(function (p, v) {
    return ( p < v ? p : v );
  });
}

function arrayMax(arr) {
  return arr.reduce(function (p, v) {
    return ( p > v ? p : v );
  });
}

// Scaling function

function scaleFunc(w,h) {
  var dynamicScale = ((w < 1000) || (h < 850)) ?  1.25 : 1.15;
  scaleFactor = w / (1920 / dynamicScale);
}

// A little too much interaction, if you ask me! Might be useful later
/*
function mouseClicked() {
  physics.removeBehavior(gravity);
  // Use perlin noise to achieve a similar* gravity vector
  xOff += 0.5;
  // Horizontal + Vertical leaping may be too much...
  // gravityStrength.x = noise(xOff) * 0.75;
  gravityStrength.y *= -1;
  gravity = new GravityBehavior(gravityStrength);
  physics.addBehavior(gravity);
  // prevent default
  return false;
}
*/

function motionBlur() {
  push();
    fill(255, 100);
    rect(0,0,width,height);
  pop();
}

// Display typography on hover
function interestDisp(i, x, y, opacity) {

  i < 5 ? liveText.style("text-align", "left") : liveText.style("text-align", "right");
  // X offset from point
  i < 5 ? (x += 30) : (x -= 125);
  if (i > 4) y -= 3;
  if (i == 6) x += 45;
  var textOpacity = map(opacity, 0, 255, 0, 1);
  liveText.style("opacity", textOpacity);
  liveText.html(interestsArr[i]);
  liveText.position(x,y-7);

}

// Hover button interactivity
function hoverButton() {
  var fadeSpeed = 20;
  var mousey = createVector(dashButton.loc().x, dashButton.loc().y);
  var overButton = mousey.dist(mousePos);
  var lineOffset = 60;
  var lineLoc;
  var opacity;

  lineLoc = map(buttonFade, 0, 255, 0, lineOffset);
  opacity = norm(buttonFade, 0, 255);

  // Position the descriptive text along with the button
  describeText.position(mousey.x, mousey.y -95);
  describeText.style("opacity", opacity);
  describeText1.position(mousey.x, mousey.y -35);
  describeText1.style("opacity", opacity);

 push();
    stroke(0,0,0,lineOp);
    fill(0,0,0,lineOp);
    strokeWeight(1);
    if (timeOut == 0) {
      line (mousey.x, mousey.y, mousey.x, mousey.y - lineLoc);
      line (mousey.x, mousey.y, mousey.x, mousey.y + lineLoc);
    }
  pop();

  if (overButton < 50) { 
    lineOp = 255;
    cursor(HAND);
    dashButton.hover(width,height);
     if (buttonFade < 255) buttonFade += fadeSpeed;
     if (alphaOpa > 0) alphaOpa -= fadeSpeed;
  } else {
    dashButton.display(width,height);
    if (buttonFade > 60) {
      buttonFade -= fadeSpeed * 4;
      cursor(ARROW);
    } else  if (buttonFade > 0) buttonFade -= fadeSpeed / 2;
  }

}

// Hover button interactivity
function hoverButton1() {
  var fadeSpeed = 20;
  var opacity;

  opacity = norm(buttonFade, 0, 255);

  var element = getElement('cross-circle');

  element.mouseOver(function() {
    hover = true;
  });

    element.mouseOut(function() {
    hover = false;
  });

  if (hover) { 
    lineOp = 255;
     if (buttonFade < 255) buttonFade += fadeSpeed;
     if (alphaOpa > 0) alphaOpa -= fadeSpeed;
  } else {
    if (buttonFade > 60) {
      buttonFade -= fadeSpeed * 4;
    } else  if (buttonFade > 0) buttonFade -= fadeSpeed / 2;
  }

}

function fadeInButton() {
  var fadeSpeed = 5;
  if (buttonFade1 < 255) buttonFade1 += fadeSpeed;
  dashButton.opa(buttonFade1);
}

function fadeOutButton() {
  var fadeSpeed = 5;
  if (buttonFade1 > 0) buttonFade1 -= fadeSpeed;
  dashButton.opa(buttonFade1);
}

/*
      Class repository
      /////////////////////////////////////////////////////////////////////////////////////////
*/

/*

  MakeButton Class (object)

*/

function MakeButton(_x, _y, _buttonWidth) {
  this.x = _x;
  this.y = _y;
  var xPos;
  var yPos;
  var opacity = 0;
  this.buttonWidth = _buttonWidth;

  var sizeOffset = this.buttonWidth / 2;

  this.display = function(_x, _y) {
    this.x = _x;
    this.y = _y;

    xPos = (50);
    yPos = this.y - (this.y / 2);

    // Center ellipse
    fill(0,0,0,opacity);
    ellipseMode(CENTER);
    ellipse(xPos,yPos,25,25);

    // Center Cross
    stroke(255,255,255);
    strokeWeight(2);
    line(xPos, yPos+2.5, xPos, yPos-2.5);
    line(xPos-2.5, yPos, xPos+2.5, yPos);

    // Dashed Borders
    /*
    fill(0,0,0);
    noStroke();
    var r = 1;
    var spaces = 30;
    var spacing = this.buttonWidth / spaces;
    for(var i = 0; i < spaces; i+= spacing) {
      ellipse(((xPos - sizeOffset) + (i * spacing)), (yPos - sizeOffset), r, r);
      ellipse(((xPos - sizeOffset) + (i * spacing)), (yPos + sizeOffset), r, r);
      ellipse((xPos - sizeOffset), ((yPos + sizeOffset) - (i * spacing)), r, r);
      ellipse((xPos + sizeOffset), ((yPos + sizeOffset) - (i * spacing)), r, r);
    }
    */
  }

  this.hover = function(_x, _y) {
    this.x = _x;
    this.y = _y;

    xPos = (50);
    yPos = this.y - (this.y / 2);

    // Center ellipse
    fill(0,0,0);
    ellipseMode(CENTER);
    ellipse(xPos,yPos,25,25);

    // Center Cross
    stroke(255,255,255);
    strokeWeight(2);
    line(xPos-2.5, yPos, xPos+2.5, yPos);
  }

  this.loc = function() {
    var loc = createVector(xPos, yPos);
    return loc;
  }

  this.opa = function(_opacity) {
    opacity = _opacity;
  }
}

  MakeButton.prototype.constructor = MakeButton;

/*

  Nudge Attractor Class (object)

*/

// Child class constructor
function Nudge(position, radius, range, strength) {
  VerletParticle2D.call(this,position);
  var attractForce = new AttractionBehavior(this, range, strength);
  this.r = radius;
  physics.addParticle(this);
  physics.addBehavior(attractForce);

  // // Override the display method
  this.display = function(){
    fill(127);
    stroke(200);
    strokeWeight(2);
    ellipse(this.x,this.y,this.r*2,this.r*2);
  }

  this.hover = function() {
    attractForce.setStrength(0.5);
  }

  this.away = function() {
    attractForce.setStrength(0.1);
  }

  this.press = function() {
    var newOpStrength = attractForce.getStrength() * -25;
    attractForce.setStrength(newOpStrength);
  }
}

// Inherit from the parent class
Nudge.prototype = Object.create(VerletParticle2D.prototype);
Nudge.prototype.constructor = Nudge;


/*

  Particle Class (object)

*/

// Child class constructor
function Particle(position) {
  VerletParticle2D.call(this,position);

  // Override the display method
  this.display = function(){
    fill(255,0,0);
    // stroke(200);
    // strokeWeight(2);
    noStroke();
    // ellipse(this.x,this.y,1,1);
  }
}

// Inherit from the parent class
Particle.prototype = Object.create(VerletParticle2D.prototype);
Particle.prototype.constructor = Particle;

