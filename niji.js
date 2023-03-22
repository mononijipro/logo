
let pixelFont;

let canvas;
let zoom = 1;
let debug = false;
let inverted = false;
let showLines = false;
let dimensions = {
  w: 1024,
  h: 1024
};
let colours = {}
let symbols = [];
let patterns = [];
let wipe = 0;

function preload() {
  pixelFont = loadFont('data/JF-Dot-jiskan16.ttf');
}

function setup() {
  // createCanvas(512, 512);
  createCanvas(windowWidth, windowHeight);
  pixelDensity(2);
  updateColourScheme();
  canvas = createGraphics(dimensions.w, dimensions.h);
  canvas.pixelDensity(2);
  canvas.textFont(pixelFont);
  canvas.textSize(dimensions.w / 16);
  canvas.textAlign(CENTER);
  textFont(pixelFont);
  textSize(16);
  imageMode(CENTER);
}

function drawPattern( symbol, index ) {
  let pattern = createGraphics(dimensions.w, dimensions.h);
  // pattern.background(map(index, 0, 5, 0, 255), 0, 0); 
  pattern.background(colours.bg);
  const H = 65;
  const V = 33;
  for (var v = 0; v < V; v += 1) {
    for (var h = 0; h < H; h += 1) {
      pattern.noStroke();
      pattern.imageMode(CENTER);
      pattern.image(symbol, h * 16, v * 16, 12, 12);
    }
  }
  let mask = createGraphics(dimensions.w, dimensions.h);
  mask.translate(dimensions.w / 2, dimensions.h / 2);
  mask.noStroke();
  mask.fill(255);
  const R = (pattern.width / 8) * ((7 - index));
  mask.ellipse(0, 0, R, R);
  pattern = pattern.get();
  pattern.mask(mask);
  return pattern;
}

function setupDitheringPatterns() {
   
   symbols = [];
   patterns = [];
  
   const L = 8;
   const HALF_L = L / 2;
   
   // Red
   let symbol1 = createGraphics(L, L);
   symbol1.fill(colours.fg);
   symbol1.noStroke();
   symbol1.ellipse(HALF_L, HALF_L, L);
   symbols.push(symbol1);
   patterns.push(drawPattern(symbol1, 0));
   
   // Orange
   let symbol2 = createGraphics(L, L);
   symbol2.fill(colours.fg);
   symbol2.noStroke();
   symbol2.ellipse(HALF_L, HALF_L, HALF_L);
   symbols.push(symbol2);
   patterns.push(drawPattern(symbol2, 1));
   
   // Yellow
   let symbol3 = createGraphics(L, L);
   symbol3.stroke(colours.fg);
   symbol3.strokeWeight(2);
   symbol3.point(HALF_L, HALF_L);
   symbols.push(symbol3);
   patterns.push(drawPattern(symbol3, 2));
   
   // Green
   let symbol4 = createGraphics(L, L);
   symbol4.fill(colours.fg);
   symbol4.noStroke();
   symbol4.rectMode(CENTER);
   symbol4.rect(HALF_L, HALF_L, HALF_L, HALF_L);
   symbols.push(symbol4);
   patterns.push(drawPattern(symbol4, 3));
   
   // Blue
   let symbol5 = createGraphics(L, L);
   symbol5.fill(colours.fg);
   symbol5.noStroke();
   symbol5.beginShape();
   symbol5.vertex(HALF_L, 0);
   symbol5.vertex(L, HALF_L);
   symbol5.vertex(HALF_L, L);
   symbol5.vertex(0, HALF_L);
   symbol5.endShape();
   symbols.push(symbol5);
   patterns.push(drawPattern(symbol5, 4));
   
   // Purple
   let symbol6 = createGraphics(L, L);
   symbol6.fill(colours.fg);
   symbol6.noStroke();
   symbol6.rect(0, 0, L, L);
   symbols.push(symbol6);
   patterns.push(drawPattern(symbol6, 5));
   
}

function update() {
  canvas.clear();
  canvas.background(colours.bg);
  drawRainbow();
  drawText();
  if (debug) { drawGuides(); }
}

function drawWipe() {
  canvas.push();
    canvas.fill(colours.bg);
    canvas.beginShape();
    canvas.vertex(canvas.width * cos(PI + wipe), canvas.width * sin(PI + wipe));
    if (wipe < PI) { 
      canvas.vertex(map(wipe, 0, PI, 0, canvas.width / 2), -canvas.height / 2); 
      canvas.vertex(canvas.width / 2, -canvas.height / 2);
      canvas.vertex(canvas.width / 2, 0);
    }
    canvas.vertex(0,0);
    canvas.endShape();
  canvas.pop();
}

function draw() {
  update();
  background(debug ? colours.debug : colours.bg);
  push();
    translate(dimensions.w / -2, dimensions.h / -2);
    translate(width / 2 + dimensions.w / 2, height / 2 + dimensions.h / 2);
    scale(zoom / 2);
    image(canvas, 0, 0);
  pop();
  if (debug) {
    drawDebugOverlay();
  }
}

function drawRainbow() {
  canvas.push();
    canvas.strokeWeight(zoom * 2);
    canvas.imageMode(CENTER);
    canvas.translate(dimensions.w / 2, dimensions.h / 2);
    var radius;
    for (let r = 0; r <= 6; r++) {
      if (r < 6) { canvas.image(patterns[r], 0, 0); }
      if (r === 6) {
        canvas.fill(colours.bg);
        showLines ? canvas.stroke(colours.fg) : canvas.noStroke();
      } else {
        canvas.noFill();
        showLines ? canvas.stroke(colours.fg) : canvas.noStroke();
      }
      radius = (dimensions.w / 8) * (7 - r) ;
      canvas.ellipse(0,0,radius);
    }
    canvas.fill(colours.bg);
    canvas.noStroke();
    canvas.rect(-dimensions.w / 2, 0, dimensions.w, dimensions.h / 2);
    if (wipe < PI) { 
      wipe += 0.04;
      colours.fg.setAlpha(map(wipe, 0, PI, 0, 255));
      drawWipe(); 
    }
  canvas.pop();
}

function drawText() {
  canvas.push();
    canvas.fill(colours.fg);
    canvas.noStroke();
    canvas.text("モノクロームレインボー", canvas.width / 2, canvas.height * 0.60);
    canvas.text("MONOCHROME RAINBOW", canvas.width / 2, canvas.height * 0.70);
  canvas.pop();
}

function drawDebugOverlay() {
  push();
    fill(255);
    noStroke();
    text("SCALE: " + zoom + ", WIPE: " + wipe, 10, 20);
    textAlign(RIGHT);
    text("[D] Toggle Debug Mode\n [S] Toggle Stroke Vsibility\n [I] Invert Colours\n [SPACE] Replay animation\n [ESC] Reset Zoom", width - 10, 20);
    for (let [s, symbol] in symbols) {
      fill(colours.bg);
      //rect(10 + s*20, 32, 16, 16);
      imageMode(CORNER);
      image(symbols[s], 10 + s*20, 32, 16, 16);
    }
    stroke(255);
    strokeWeight(2);
    for (let [p, pattern] in patterns) {
      image(patterns[p], 0, 45 + p * 90, 360, 360);
    }
  pop();
}

function drawGuides() {
  canvas.noFill();
  canvas.stroke(255,0,128);
  canvas.strokeWeight(zoom / 10);
  for (let v = 0; v < dimensions.h; v += 16) {
    for (let h = 0; h < dimensions.w; h += 16) {
      canvas.line(h,0,h,canvas.height);
      canvas.line(0,v,canvas.width,v);
    }
  }
}

function mouseWheel( event ) {
  zoom += event.deltaY / 100;
  if (zoom < 0.32) zoom = 0.32;
}

function keyReleased() {
  if (keyCode === ESCAPE) {
    zoom = 1;
  } else if (keyCode === 68) {
    debug = !debug;
  } else if (keyCode === 73) {
    inverted = !inverted;
    updateColourScheme();
  } else if (keyCode === 32) {
    wipe = 0;
    // saveFrames("niji", "png", 5, 22);
  } else if (keyCode === 83) {
    showLines = !showLines;
  }
}

function updateColourScheme() {
  if (inverted) {
    colours.bg = color(255);
    colours.fg = color(0);
  } else {
    colours.bg = color(0);
    colours.fg = color(255);
  }
  colours.debug = color(255,0,128);
  setupDitheringPatterns();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
