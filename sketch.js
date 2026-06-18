var ink;
var paper;
var seed;
var DEBUG_LAYOUT = false;
var exportFolderHandle = null;

function setup() {
  let c = createCanvas(1150, 1536);
  c.parent(document.querySelector(".canvas-wrap"));

  pixelDensity(2);

  ink = color(8, 35, 160);
  paper = color(241, 238, 220);

  seed = floor(random(999999));
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noLoop();
}

function draw() {
  randomSeed(seed);
  noiseSeed(seed);

  background(paper);
  drawPaperTexture();

  push();

  translate(width / 2, height * 0.648);
  scale(random(1.16, 1.34));

  resetDebugLayout();
  drawTinyHouse();
  drawDebugLayoutOverlay();

  pop();

  drawSubtleInkSpecks();
}

function keyPressed() {
  if (key === " ") {
    seed = floor(random(999999));
    redraw();
  }

  if (key === "s" || key === "S") {
    saveSinglePNG();
  }

  if (key === "f" || key === "F") {
    chooseExportFolder();
  }

  if (key === "b" || key === "B") {
    saveBatchToFolder(10);
  }

  if (key === "d" || key === "D") {
    DEBUG_LAYOUT = !DEBUG_LAYOUT;
    redraw();
  }
}

function drawTinyHouse() {
  stroke(ink);
  strokeWeight(2.1);
  noFill();

  drawProceduralTinyHouse();
}
