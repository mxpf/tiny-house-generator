function drawHouseBody(x, y, w, h) {
  drawRectOpenTop(x, y, w, h);

  strokeWeight(2.35);
  sketchLine(x - 7, y + h + 2, x + w + 7, y + h + random(-1, 1), 0.62);
  strokeWeight(2.1);
}

function drawPerspectiveBody(x, y, w, h, depth, side = 1) {
  let dx = depth * side;
  let dy = random(16, 28);

  sketchLine(x, y, x, y + h);
  sketchLine(x + w, y, x + w, y + h);
  sketchLine(x, y + h, x + w, y + h);

  sketchLine(x + w, y, x + w + dx, y + dy);
  sketchLine(x + w + dx, y + dy, x + w + dx, y + h + dy * 0.45);
  sketchLine(x + w, y + h, x + w + dx, y + h + dy * 0.45);

  return {
    sideX: x + w,
    sideY: y,
    sideW: dx,
    sideH: h,
    sideDy: dy,
  };
}

function drawRectOpenTop(x, y, w, h) {
  sketchLine(x, y, x, y + h);
  sketchLine(x + w, y, x + w, y + h);
  sketchLine(x, y + h, x + w, y + h);
}

function drawRectSketch(x, y, w, h) {
  sketchLine(x, y, x + w, y);
  sketchLine(x + w, y, x + w, y + h);
  sketchLine(x + w, y + h, x, y + h);
  sketchLine(x, y + h, x, y);
}

function drawFilledRectSketch(x, y, w, h, density = 12) {
  drawRectSketch(x, y, w, h);

  for (let i = 0; i < density; i++) {
    let xx = x + random(4, w - 4);
    sketchLine(xx, y + 4, xx + random(-1, 1), y + h - 4, 0.22);
  }
}

function drawGableRoof(x, y, w, h, density = "medium") {
  let peakX = x + w * random(0.43, 0.57);
  let peakY = y - random(48, 84);

  strokeWeight(2.45);
  sketchLine(x - 22, y + 8, peakX, peakY, 0.78);
  sketchLine(peakX, peakY, x + w + 22, y + 8, 0.78);

  strokeWeight(1.65);
  sketchLine(x - 8, y + 20, peakX, peakY + 15, 0.5);
  sketchLine(peakX, peakY + 15, x + w + 8, y + 20, 0.5);

  let hatchCount = 10;
  if (density === "light") hatchCount = 7;
  if (density === "dense") hatchCount = 24;

  for (let i = 0; i < hatchCount; i++) {
    let rx = random(x + 12, x + w - 12);
    let ry = random(y - 48, y - 6);

    if (random() < 0.8) {
      quietDash(rx, ry, random(7, 16), random(PI * 0.36, PI * 0.65));
    }
  }

  strokeWeight(2.1);
}

function drawTiledGableRoof(x, y, w, h, dense = true) {
  let peakX = x + w * random(0.45, 0.55);
  let peakY = y - random(56, 88);

  strokeWeight(2.55);
  sketchLine(x - 23, y + 7, peakX, peakY, 0.8);
  sketchLine(peakX, peakY, x + w + 23, y + 7, 0.8);

  strokeWeight(1.7);
  sketchLine(x - 9, y + 21, peakX, peakY + 15, 0.48);
  sketchLine(peakX, peakY + 15, x + w + 9, y + 21, 0.48);

  let rows = dense ? 9 : 6;

  for (let i = 0; i < rows; i++) {
    let t = i / rows;
    let yy = lerp(peakY + 16, y + 8, t);
    let lx = lerp(peakX, x, t);
    let rx = lerp(peakX, x + w, t);

    brokenLine(lx + 6, yy, rx - 6, yy + random(-1, 1), 0.86, 9);

    let tileCount = floor(map(rx - lx, 20, w, 3, 12));
    for (let j = 0; j < tileCount; j++) {
      let tx = lerp(lx + 8, rx - 8, j / max(1, tileCount - 1));
      quietDash(tx, yy - 2, random(5, 9), HALF_PI + random(-0.1, 0.1));
    }
  }

  strokeWeight(2.1);
}

function drawPerspectiveRoof(x, y, w, h, depth, side = 1) {
  let dx = depth * side;
  let peakX = x + w * random(0.43, 0.54);
  let peakY = y - random(46, 76);
  let backPeakX = peakX + dx;
  let backPeakY = peakY + random(16, 26);

  strokeWeight(2.55);
  sketchLine(x - 20, y + 7, peakX, peakY, 0.78);
  sketchLine(peakX, peakY, x + w + 18, y + 7, 0.78);

  sketchLine(peakX, peakY, backPeakX, backPeakY, 0.72);
  sketchLine(x + w + 18, y + 7, x + w + dx + 16, y + random(20, 31), 0.72);
  sketchLine(backPeakX, backPeakY, x + w + dx + 16, y + random(20, 31), 0.72);

  strokeWeight(1.65);

  for (let i = 0; i < 8; i++) {
    let t = i / 8;
    let yy = lerp(peakY + 12, y + 8, t);
    let lx = lerp(peakX, x, t);
    let rx = lerp(peakX, x + w, t);
    brokenLine(lx + 8, yy, rx - 6, yy + random(-1, 1), 0.7, 7);
  }

  for (let i = 0; i < 8; i++) {
    let t = i / 8;
    let ax = lerp(peakX, backPeakX, t);
    let ay = lerp(peakY, backPeakY, t);
    quietDash(
      ax,
      ay + random(8, 28),
      random(10, 18),
      HALF_PI + random(-0.2, 0.2),
    );
  }

  strokeWeight(2.1);
}

function drawLowRoof(x, y, w, h) {
  let peakX = x + w * random(0.44, 0.56);
  let peakY = y - random(36, 66);

  strokeWeight(2.35);
  sketchLine(x - 18, y + 6, peakX, peakY, 0.72);
  sketchLine(peakX, peakY, x + w + 18, y + 6, 0.72);

  strokeWeight(1.55);
  sketchLine(x - 8, y + 17, peakX, peakY + 13, 0.42);
  sketchLine(peakX, peakY + 13, x + w + 8, y + 17, 0.42);

  for (let i = 0; i < 8; i++) {
    quietDash(
      random(x + 14, x + w - 14),
      random(y - 38, y - 8),
      random(6, 13),
      HALF_PI + random(-0.22, 0.22),
    );
  }

  strokeWeight(2.1);
}

function drawTileRoof(x, y, w, h) {
  drawTiledGableRoof(x, y, w, h, true);
}

function drawSlantedRoof(x, y, w, h) {
  let leftY = y + random(2, 12);
  let rightY = y - random(24, 42);

  if (random() < 0.5) {
    leftY = y - random(24, 42);
    rightY = y + random(2, 12);
  }

  strokeWeight(2.35);
  sketchLine(x - 16, leftY, x + w + 16, rightY, 0.7);

  strokeWeight(1.55);
  sketchLine(x - 6, leftY + 12, x + w + 6, rightY + 12, 0.36);

  for (let i = 0; i < 7; i++) {
    let tx = random(x + 10, x + w - 10);
    quietDash(
      tx,
      lerp(leftY, rightY, (tx - x) / w) + random(2, 12),
      random(6, 12),
      HALF_PI,
    );
  }

  strokeWeight(2.1);
}

function drawChimney(x, y, w, h) {
  strokeWeight(2.05);
  drawRectSketch(x, y, w, h);

  sketchLine(x - 4, y, x + w + 4, y, 0.5);
  sketchLine(x - 2, y + 5, x + w + 2, y + 5, 0.5);

  for (let i = 0; i < 7; i++) {
    let yy = y + 8 + i * ((h - 14) / 7);
    quietDash(x + 4, yy, w - 8, 0);
  }

  for (let i = 0; i < 18; i++) {
    let mx = x + random(2, w - 2);
    let my = y + random(6, h - 4);
    inkDot(mx, my, random(0.9, 1.7));
  }

  if (random() < 0.68) {
    for (let i = 0; i < 2; i++) {
      let sx = x + w / 2 + random(-5, 5);
      let sy = y - 8 - i * 18;

      sketchLine(sx, sy, sx + random(-5, 5), sy - random(9, 15), 0.28);
    }
  }

  strokeWeight(2.1);
}

function drawDoor(x, y, w, h, filled = false) {
  if (filled) {
    drawFilledRectSketch(x, y, w, h, 14);
  } else {
    drawRectSketch(x, y, w, h);

    if (random() < 0.7) {
      drawRectSketch(x + 6, y + 8, w - 12, h - 16);
    }
  }

  if (random() < 0.5) {
    for (let i = 0; i < 4; i++) {
      quietDash(x + 6, y + 9 + i * ((h - 18) / 4), w - 12, 0);
    }
  }

  fill(ink);
  noStroke();
  circle(x + w - 7, y + h * 0.55, 3.2);
  noFill();
  stroke(ink);
}

function drawSmallWindow(x, y, w, h, dark = false) {
  if (dark) {
    drawFilledRectSketch(x, y, w, h, 10);
  } else {
    drawRectSketch(x, y, w, h);
  }

  sketchLine(x + w / 2, y + 4, x + w / 2, y + h - 4, 0.42);

  if (random() < 0.86) {
    sketchLine(x + 4, y + h / 2, x + w - 4, y + h / 2, 0.42);
  }

  if (random() < 0.56) {
    for (let i = 0; i < 3; i++) {
      quietDash(x + 4, y + 5 + i * 5, w - 8, 0);
    }
  }
}

function drawTinyAtticWindow(x, y, w) {
  drawSmallWindow(
    x + w * random(0.43, 0.53),
    y - random(16, 28),
    random(16, 24),
    random(18, 26),
    random() < 0.4,
  );
}

function drawStorefrontWindow(x, y, w, h) {
  drawRectSketch(x, y, w, h);

  if (random() < 0.86) {
    sketchLine(x + w / 2, y + 4, x + w / 2, y + h - 4, 0.35);
  }

  if (random() < 0.75) {
    for (let i = 0; i < 5; i++) {
      quietDash(x + 6, y + 6 + i * 6, w - 12, 0);
    }
  }

  if (random() < 0.45) {
    for (let i = 0; i < 12; i++) {
      inkDot(x + random(5, w - 5), y + random(5, h - 5), random(0.8, 1.6));
    }
  }
}

function drawAwning(x, y, w, h) {
  drawRectSketch(x, y, w, h);

  for (let i = 0; i < 7; i++) {
    let xx = x + i * (w / 7);
    sketchLine(xx, y + 3, xx + random(-2, 2), y + h - 3, 0.36);
  }
}

function drawWallTexture(x, y, w, h, mode) {
  if (mode === "siding") {
    let count = floor(random(7, 11));

    for (let i = 0; i < count; i++) {
      let yy = y + 18 + i * random(12, 17);

      if (yy < y + h - 10) {
        brokenLine(x + 8, yy, x + w - 8, yy + random(-1, 1), 0.7, 8);
      }
    }
  }

  if (mode === "broken") {
    for (let i = 0; i < 28; i++) {
      let mx = random(x + 10, x + w - 10);
      let my = random(y + 16, y + h - 12);
      quietDash(mx, my, random(4, 14), random(-0.08, 0.08));
    }
  }

  if (mode === "quiet") {
    for (let i = 0; i < 20; i++) {
      let mx = random(x + 10, x + w - 10);
      let my = random(y + 16, y + h - 12);

      if (random() < 0.7) {
        quietDash(mx, my, random(3, 9), random(-0.08, 0.08));
      } else {
        inkDot(mx, my, random(1, 1.9));
      }
    }
  }

  if (mode === "stucco") {
    for (let i = 0; i < 46; i++) {
      inkDot(
        random(x + 8, x + w - 8),
        random(y + 14, y + h - 10),
        random(0.8, 1.8),
      );
    }
  }

  if (random() < 0.78) {
    drawCornerMarks(x, y, w, h);
  }
}

function drawCornerMarks(x, y, w, h) {
  let count = floor(random(4, 7));

  for (let i = 0; i < count; i++) {
    let yy = y + 15 + i * random(16, 23);

    quietDash(x - 4, yy, 13, 0);
    quietDash(x + w - 8, yy + random(-1, 1), 13, 0);
  }
}

function drawNorenCurtain(x, y, w, h) {
  drawRectSketch(x, y, w, h);

  let panels = floor(random(3, 5));
  for (let i = 1; i < panels; i++) {
    let px = x + (w * i) / panels;
    sketchLine(px, y + 3, px + random(-1, 1), y + h - 3, 0.3);
  }

  for (let i = 0; i < panels; i++) {
    let cx = x + (w * (i + 0.5)) / panels;
    quietDash(cx - 4, y + h * 0.52, random(7, 13), 0);
    quietDash(cx, y + h * 0.26, random(5, 10), HALF_PI);
  }
}

function drawTinyGlyph(x, y) {
  quietDash(x, y - 5, random(7, 12), 0);
  quietDash(x + random(2, 5), y - 8, random(8, 14), HALF_PI);
  if (random() < 0.45) {
    quietDash(x - 1, y + 1, random(6, 10), 0);
  }
}

function drawAttachedRoom(x, y, w, h, side) {
  let ew = random(52, 84);
  let eh = random(56, 88);
  let ex = side === -1 ? x - ew + random(6, 16) : x + w - random(6, 16);
  let ey = y + h - eh;

  drawRectOpenTop(ex, ey, ew, eh);

  let peakX = ex + ew * random(0.43, 0.57);
  let peakY = ey - random(20, 36);

  sketchLine(ex - 9, ey + 6, peakX, peakY, 0.52);
  sketchLine(peakX, peakY, ex + ew + 9, ey + 6, 0.52);

  if (random() < 0.74) {
    drawSmallWindow(
      ex + ew * random(0.32, 0.52),
      ey + eh * random(0.36, 0.52),
      random(17, 26),
      random(22, 33),
      random() < 0.35,
    );
  }

  if (random() < 0.58) {
    for (let i = 0; i < 4; i++) {
      let yy = ey + 14 + i * 13;
      brokenLine(ex + 7, yy, ex + ew - 7, yy + random(-1, 1), 0.58, 6);
    }
  }
}

function drawBaseDetails(x, y, w, h) {
  drawCloseBaseTexture(x, y, w, h);
}

function drawGroundBase() {
  stroke(ink);
  strokeWeight(1.25);

  for (let i = 0; i < 8; i++) {
    let gx = randomGaussian(0, 95);
    let gy = randomGaussian(78, 24);

    if (random() < 0.7) {
      terrainMark(gx, gy, random(6, 16));
    } else {
      tinyDotCluster(gx, gy);
    }
  }

  strokeWeight(2.1);
}

function drawCloseBaseTexture(x, y, w, h) {
  let baseY = y + h;

  stroke(ink);

  for (let i = 0; i < 9; i++) {
    let px = random(x - 28, x + w + 28);
    let py = baseY + random(-5, 8);
    drawShrub(px, py, random(16, 34));
  }

  strokeWeight(1.35);

  for (let i = 0; i < 50; i++) {
    let gx = randomGaussian(x + w / 2, w * 0.45);
    let gy = randomGaussian(baseY + 36, 22);

    if (gy > baseY - 4 && gy < baseY + 92) {
      terrainMark(gx, gy, random(5, 17));
    }
  }

  for (let i = 0; i < 18; i++) {
    tinyDotCluster(random(x - 28, x + w + 28), baseY + random(4, 54));
  }

  if (random() < 0.4) {
    drawLittleStone(x + random(-14, w + 10), baseY + random(12, 24));
  }

  if (random() < 0.42) {
    drawLowFence(x, baseY + random(4, 12), w);
  }

  strokeWeight(2.1);
}

function drawShrub(x, y, size) {
  strokeWeight(random(1.55, 2.25));

  let branches = floor(random(11, 20));

  for (let i = 0; i < branches; i++) {
    let a = random(PI, TWO_PI);
    let len = random(size * 0.18, size);

    let x2 = x + cos(a) * len;
    let y2 = y + sin(a) * len;

    sketchLine(x, y, x2, y2, 0.42);

    if (random() < 0.52) {
      inkDot(x2, y2, random(1.5, 3.4));
    }
  }

  for (let i = 0; i < 3; i++) {
    quietDash(
      x + random(-size * 0.25, size * 0.25),
      y + random(1, 5),
      random(6, 14),
      random(-0.1, 0.1),
    );
  }

  strokeWeight(2.1);
}

function drawPottedPlant(x, y) {
  let potW = random(14, 22);
  let potH = random(11, 16);

  drawRectSketch(x, y, potW, potH);

  for (let i = 0; i < floor(random(4, 8)); i++) {
    sketchLine(
      x + potW / 2,
      y,
      x + potW / 2 + random(-12, 12),
      y - random(10, 24),
      0.34,
    );
  }
}

function drawLowFence(x, y, w) {
  let fx = x + random(-30, 20);
  let fw = random(w * 0.32, w * 0.64);

  if (random() < 0.5) {
    fx = x + w - fw + random(-20, 28);
  }

  strokeWeight(1.45);

  brokenLine(fx, y, fx + fw, y + random(-1, 1), 0.46, 7);

  for (let i = 0; i < 4; i++) {
    let px = fx + i * (fw / 3);
    sketchLine(px, y - 6, px, y + 5, 0.25);
  }

  strokeWeight(2.1);
}

function drawLittleStone(x, y) {
  strokeWeight(1.35);
  sketchLine(x - 8, y, x + 6, y + random(-1, 1), 0.2);
  sketchLine(x - 5, y - 3, x + 4, y - 3 + random(-1, 1), 0.18);
  strokeWeight(2.1);
}

function drawSmallCrate(x, y) {
  let cw = random(16, 25);
  let ch = random(12, 18);

  drawRectSketch(x, y, cw, ch);
  quietDash(x + 3, y + ch * 0.5, cw - 6, 0);
}

function drawTinyWoodpile(x, y) {
  strokeWeight(1.35);

  for (let i = 0; i < floor(random(4, 7)); i++) {
    let yy = y + i * 3;
    quietDash(x + random(-2, 2), yy, random(22, 36), random(-0.08, 0.08));
  }

  strokeWeight(2.1);
}

function terrainMark(x, y, len) {
  let angle = random(-0.04, 0.04);
  let x2 = x + cos(angle) * len;
  let y2 = y + sin(angle) * len;

  quietLine(x, y, x2, y2, 0.34);
}

function tinyDotCluster(x, y) {
  let n = floor(random(2, 4));

  for (let i = 0; i < n; i++) {
    inkDot(x + random(-4, 4), y + random(-2.5, 2.5), random(1, 2.1));
  }
}

function brokenLine(x1, y1, x2, y2, chance, pieces = 7) {
  for (let i = 0; i < pieces; i++) {
    if (random() < chance) {
      let t1 = i / pieces;
      let t2 = (i + random(0.32, 0.78)) / pieces;

      let ax = lerp(x1, x2, t1);
      let ay = lerp(y1, y2, t1);
      let bx = lerp(x1, x2, t2);
      let by = lerp(y1, y2, t2);

      sketchLine(ax, ay, bx, by, 0.36);
    }
  }
}

function quietDash(x, y, len, angle = 0) {
  let x2 = x + cos(angle) * len;
  let y2 = y + sin(angle) * len;

  quietLine(x, y, x2, y2, 0.24);
}

function quietLine(x1, y1, x2, y2, wobble = 0.32) {
  beginShape();

  let steps = 5;

  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let x = lerp(x1, x2, t) + random(-wobble, wobble);
    let y = lerp(y1, y2, t) + random(-wobble, wobble);

    vertex(x, y);
  }

  endShape();
}

function sketchLine(x1, y1, x2, y2, extraPassChance = 0.45) {
  let passes = random() < extraPassChance ? 2 : 1;

  for (let p = 0; p < passes; p++) {
    beginShape();

    let steps = 10;

    for (let i = 0; i <= steps; i++) {
      let t = i / steps;
      let x = lerp(x1, x2, t);
      let y = lerp(y1, y2, t);

      let wobble = 0.62;

      x += random(-wobble, wobble);
      y += random(-wobble, wobble);

      vertex(x, y);
    }

    endShape();
  }
}

function inkDot(x, y, r) {
  noStroke();
  fill(ink);
  circle(x, y, r);
  noFill();
  stroke(ink);
}

function drawPaperTexture() {
  noStroke();

  for (let i = 0; i < 5200; i++) {
    let x = random(width);
    let y = random(height);
    let a = random(2, 8);

    fill(82, 76, 48, a);
    circle(x, y, random(0.3, 1.3));
  }

  for (let i = 0; i < 420; i++) {
    let x = random(width);
    let y = random(height);

    fill(20, 45, 150, random(3, 8));
    circle(x, y, random(0.25, 0.9));
  }
}

function drawSubtleInkSpecks() {
  noStroke();
  fill(ink);

  for (let i = 0; i < 38; i++) {
    if (random() < 0.55) {
      circle(random(width), random(height), random(0.6, 1.35));
    }
  }
}
