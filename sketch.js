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

  console.log("Initial seed:", seed);

  strokeCap(ROUND);
  strokeJoin(ROUND);
  noLoop();
}

function draw() {
  randomSeed(seed);
  noiseSeed(seed);

  background(paper);
  drawPaperTexture();

  try {
    push();

    translate(width / 2, height * 0.648);
    scale(random(1.16, 1.34));

    resetDebugLayout();
    drawTinyHouse();
    drawDebugLayoutOverlay();

    pop();

    drawSubtleInkSpecks();
  } catch (err) {
    try {
      pop();
    } catch (popErr) {
      // Ignore pop errors if the drawing stack was already balanced.
    }

    console.error("Render failed on seed:", seed);
    console.error(err);

    push();
    fill(ink);
    noStroke();
    textSize(18);
    textAlign(CENTER, CENTER);
    text("Render failed", width / 2, height / 2 - 18);
    textSize(13);
    text("Seed: " + seed, width / 2, height / 2 + 8);
    pop();
  }
}

function keyPressed() {
  if (key === " ") {
    seed = floor(random(999999));
    console.log("New seed:", seed);
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
    console.log("DEBUG_LAYOUT:", DEBUG_LAYOUT);
    redraw();
  }
}

function drawTinyHouse() {
  stroke(ink);
  strokeWeight(2.1);
  noFill();

  drawProceduralTinyHouse();
}
