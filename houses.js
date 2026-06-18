const HOUSE_ARCHETYPES = [
  "perspectiveCottage",
  "perspectiveCottage",
  "perspectiveCottage",
  "perspectiveCottage",
  "frontCottage",
  "frontCottage",
  "squatCottage",
  "narrowCabin",
];

const DEBUG_LAYOUT_NAMES = ["door", "window", "sideWindow", "shed", "chimney"];

let debugLayoutRects = [];

function makeRect(x, y, w, h, name = "feature") {
  return { x, y, w, h, name };
}

function rectsOverlap(a, b, padding = 0) {
  return !(
    a.x + a.w + padding <= b.x ||
    b.x + b.w + padding <= a.x ||
    a.y + a.h + padding <= b.y ||
    b.y + b.h + padding <= a.y
  );
}

function canPlace(rect, occupiedRects, padding = 0, ignoreNames = []) {
  return occupiedRects.every((other) => {
    return (
      ignoreNames.includes(other.name) || !rectsOverlap(rect, other, padding)
    );
  });
}

function occupy(occupiedRects, rect) {
  occupiedRects.push(rect);

  if (DEBUG_LAYOUT_NAMES.includes(rect.name)) {
    debugLayoutRects.push({ ...rect });
  }

  return rect;
}

function resetDebugLayout() {
  debugLayoutRects = [];
}

function debugLayoutColor(name) {
  if (name === "door") return [255, 68, 68];
  if (name === "window") return [64, 142, 255];
  if (name === "sideWindow") return [124, 188, 255];
  if (name === "shed") return [88, 222, 137];
  if (name === "chimney") return [255, 127, 80];

  return [255, 255, 255];
}

function drawDebugLayoutOverlay() {
  if (typeof DEBUG_LAYOUT === "undefined" || !DEBUG_LAYOUT) {
    return;
  }

  push();
  textSize(7);
  textAlign(LEFT, BASELINE);

  for (const box of debugLayoutRects) {
    const [r, g, b] = debugLayoutColor(box.name);

    noFill();
    stroke(r, g, b, 180);
    strokeWeight(0.7);
    rect(box.x, box.y, box.w, box.h);

    noStroke();
    fill(r, g, b, 210);
    text(box.name, box.x, box.y - 3);
  }

  pop();
}

function firstSafeRect(
  candidates,
  occupiedRects,
  padding,
  validator = () => true,
  ignoreNames = [],
) {
  for (const rect of candidates) {
    if (
      rect &&
      validator(rect) &&
      canPlace(rect, occupiedRects, padding, ignoreNames)
    ) {
      return rect;
    }
  }

  return null;
}

function rectInFacade(rect, x, y, w, h, inset = 5) {
  return (
    rect.x >= x + inset &&
    rect.x + rect.w <= x + w - inset &&
    rect.y >= y + inset &&
    rect.y + rect.h <= y + h - inset
  );
}

function drawProceduralTinyHouse() {
  const archetype = random(HOUSE_ARCHETYPES);

  const footprint = {
    w: random(158, 218),
    wallH: random(118, 160),
    roofH: random(54, 82),
  };

  if (archetype === "perspectiveCottage") {
    drawPerspectiveCottage(footprint);
    return;
  }

  if (archetype === "frontCottage") {
    drawFrontCottage(footprint);
    return;
  }

  if (archetype === "squatCottage") {
    drawSquatCottage(footprint);
    return;
  }

  if (archetype === "narrowCabin") {
    drawNarrowCabin(footprint);
    return;
  }

  throw new Error("Unknown archetype: " + archetype);
}

/* ==========================================================================
   ARCHETYPES
   ========================================================================== */

function drawPerspectiveCottage({ w, wallH, roofH }) {
  const side = random() < 0.5 ? -1 : 1;

  w *= random(0.9, 1.04);
  wallH *= random(0.9, 1.03);

  const frontW = w * random(0.58, 0.72);
  const sideW = w * random(0.22, 0.34);
  const x = -frontW / 2;
  const y = -wallH;
  const occupied = [];

  const drop = random(12, 24);
  const sideX = side > 0 ? x + frontW : x - sideW;
  const frontX = x;

  const roof = makePerspectiveRoof(frontX, y, frontW, sideW, roofH, drop, side);

  drawPerspectiveBody(frontX, y, frontW, sideW, wallH, drop, side);
  drawConnectedPerspectiveRoof(roof);
  drawRoofMarksInFrontPlane(roof.front);
  drawRoofMarksInSidePlane(roof.side, side);

  drawSparseWallTexture(frontX, y, frontW, wallH);

  const door = placeFrontDoor(
    frontX,
    y,
    frontW,
    wallH,
    occupied,
    random([0.44, 0.5, 0.56, 0.62]),
  );
  drawPanedDoor(door.x, door.y, door.w, door.h);
  drawFeatureHalo(door.x, door.y, door.w, door.h, "door");

  const mainWindow = placeFrontWindow(
    frontX,
    y,
    frontW,
    wallH,
    occupied,
    door,
    random(["left", "right"]),
  );

  if (mainWindow) {
    drawPanedWindow(mainWindow.x, mainWindow.y, mainWindow.w, mainWindow.h);
    drawFeatureHalo(
      mainWindow.x,
      mainWindow.y,
      mainWindow.w,
      mainWindow.h,
      "window",
    );
    occupy(occupied, mainWindow);
  }

  if (random() < 0.3) {
    const upper = placeUpperVent(frontX, y, frontW, wallH, occupied);

    if (upper) {
      drawTinyPanedWindow(upper.x, upper.y, upper.w, upper.h);
      occupy(occupied, upper);
    }
  }

  if (sideW > 42 && random() < 0.78) {
    const sideWindow = placeSideWindow(
      sideX,
      y + drop,
      sideW,
      wallH,
      drop,
      side,
      occupied,
    );

    if (sideWindow) {
      drawSidePanedWindow(
        sideWindow.x,
        sideWindow.y,
        sideWindow.w,
        sideWindow.h,
        side,
      );
      occupy(occupied, sideWindow);
    }
  }

  if (random() < 0.18) {
    drawSmallChimneyOnRoof(roof.front, occupied);
  }

  if (random() < 0.22) {
    drawBaseObject(frontX, 0, frontW, occupied);
  }

  drawHouseBase(frontX, 0, frontW, occupied, sideW, side);
}

function drawFrontCottage({ w, wallH, roofH }) {
  w *= random(0.82, 0.98);
  wallH *= random(0.9, 1.06);

  const x = -w / 2;
  const y = -wallH;
  const occupied = [];

  const roof = makeFrontRoof(x, y, w, roofH);

  drawFrontBody(x, y, w, wallH);
  drawConnectedFrontRoof(roof);
  drawRoofMarksInFrontPlane(roof);

  drawSparseWallTexture(x, y, w, wallH);

  const door = placeFrontDoor(
    x,
    y,
    w,
    wallH,
    occupied,
    random([0.46, 0.52, 0.58, 0.64]),
  );
  drawPanedDoor(door.x, door.y, door.w, door.h);
  drawFeatureHalo(door.x, door.y, door.w, door.h, "door");

  const firstWindow = placeFrontWindow(
    x,
    y,
    w,
    wallH,
    occupied,
    door,
    door.x > x + w * 0.5 ? "left" : "right",
  );

  if (firstWindow) {
    drawPanedWindow(firstWindow.x, firstWindow.y, firstWindow.w, firstWindow.h);
    drawFeatureHalo(
      firstWindow.x,
      firstWindow.y,
      firstWindow.w,
      firstWindow.h,
      "window",
    );
    occupy(occupied, firstWindow);
  }

  if (random() < 0.22) {
    const secondWindow = placeFrontWindow(
      x,
      y,
      w,
      wallH,
      occupied,
      door,
      firstWindow && firstWindow.x < x + w * 0.5 ? "right" : "left",
    );

    if (secondWindow) {
      drawPanedWindow(
        secondWindow.x,
        secondWindow.y,
        secondWindow.w,
        secondWindow.h,
      );
      drawFeatureHalo(
        secondWindow.x,
        secondWindow.y,
        secondWindow.w,
        secondWindow.h,
        "window",
      );
      occupy(occupied, secondWindow);
    }
  }

  if (random() < 0.45) {
    drawAttachedLeanTo(x, y, w, wallH, random([-1, 1]), occupied);
  }

  if (random() < 0.16) {
    drawSmallChimneyOnFrontRoof(roof, occupied);
  }

  drawHouseBase(x, 0, w, occupied);
}

function drawSquatCottage({ w, wallH, roofH }) {
  w *= random(0.96, 1.16);
  wallH *= random(0.72, 0.86);
  roofH *= random(0.74, 0.92);

  const x = -w / 2;
  const y = -wallH;
  const occupied = [];

  const roof = makeFrontRoof(x, y, w, roofH);
  roof.peak.x += random(-8, 8);

  drawFrontBody(x, y, w, wallH);
  drawConnectedFrontRoof(roof);
  drawRoofMarksInFrontPlane(roof);
  drawSparseWallTexture(x, y, w, wallH);

  const door = placeFrontDoor(
    x,
    y,
    w,
    wallH,
    occupied,
    random([0.44, 0.5, 0.56]),
  );
  drawPanedDoor(door.x, door.y, door.w, door.h);
  drawFeatureHalo(door.x, door.y, door.w, door.h, "door");

  const windowA = placeFrontWindow(x, y, w, wallH, occupied, door, "left");
  if (windowA) {
    drawPanedWindow(windowA.x, windowA.y, windowA.w, windowA.h);
    drawFeatureHalo(windowA.x, windowA.y, windowA.w, windowA.h, "window");
    occupy(occupied, windowA);
  }

  if (random() < 0.36) {
    const windowB = placeFrontWindow(x, y, w, wallH, occupied, door, "right");
    if (windowB) {
      drawPanedWindow(windowB.x, windowB.y, windowB.w, windowB.h);
      drawFeatureHalo(windowB.x, windowB.y, windowB.w, windowB.h, "window");
      occupy(occupied, windowB);
    }
  }

  if (random() < 0.52) {
    drawAttachedLeanTo(x, y, w, wallH, random([-1, 1]), occupied);
  }

  drawHouseBase(x, 0, w, occupied);
}

function drawNarrowCabin({ w, wallH, roofH }) {
  w *= random(0.66, 0.78);
  wallH *= random(0.94, 1.08);
  roofH *= random(0.94, 1.08);

  const x = -w / 2;
  const y = -wallH;
  const occupied = [];

  const roof = makeFrontRoof(x, y, w, roofH);
  roof.peak.x += random(-5, 5);

  drawFrontBody(x, y, w, wallH);
  drawConnectedFrontRoof(roof);
  drawRoofMarksInFrontPlane(roof);
  drawSparseWallTexture(x, y, w, wallH);

  const door = placeFrontDoor(
    x,
    y,
    w,
    wallH,
    occupied,
    random([0.48, 0.54, 0.6]),
  );
  drawPanedDoor(door.x, door.y, door.w, door.h);
  drawFeatureHalo(door.x, door.y, door.w, door.h, "door");

  const window = placeFrontWindow(
    x,
    y,
    w,
    wallH,
    occupied,
    door,
    door.x > x + w * 0.5 ? "left" : "right",
  );

  if (window) {
    drawPanedWindow(window.x, window.y, window.w, window.h);
    drawFeatureHalo(window.x, window.y, window.w, window.h, "window");
    occupy(occupied, window);
  }

  if (random() < 0.26) {
    drawAttachedLeanTo(x, y, w, wallH, random([-1, 1]), occupied);
  }

  if (random() < 0.14) {
    drawSmallChimneyOnFrontRoof(roof, occupied);
  }

  drawHouseBase(x, 0, w, occupied);
}

/* ==========================================================================
   ROOF GEOMETRY
   ========================================================================== */

function makeFrontRoof(x, y, w, roofH) {
  const eave = random(17, 25);
  const peak = {
    x: x + w * random(0.43, 0.57),
    y: y - roofH,
  };

  const leftEave = {
    x: x - eave,
    y: y + random(5, 11),
  };

  const rightEave = {
    x: x + w + eave,
    y: y + random(5, 11),
  };

  return {
    peak,
    leftEave,
    rightEave,
    innerLeft: pointBetween(leftEave, peak, 0.12),
    innerRight: pointBetween(rightEave, peak, 0.12),
    baseLeft: { x, y },
    baseRight: { x: x + w, y },
  };
}

function makePerspectiveRoof(x, y, frontW, sideW, roofH, drop, side) {
  const front = makeFrontRoof(x, y, frontW, roofH);

  const sideShift = side * sideW;
  const sidePeak = {
    x: front.peak.x + sideShift * random(0.82, 1.0),
    y: front.peak.y + drop,
  };

  const frontSideEave = side > 0 ? front.rightEave : front.leftEave;
  const backSideEave = {
    x: frontSideEave.x + sideShift,
    y: frontSideEave.y + drop + random(-2, 2),
  };

  return {
    front,
    side: {
      side,
      frontPeak: front.peak,
      backPeak: sidePeak,
      frontEave: frontSideEave,
      backEave: backSideEave,
    },
  };
}

function drawConnectedFrontRoof(roof) {
  strokeWeight(2.48);

  organicLine(
    roof.leftEave.x,
    roof.leftEave.y,
    roof.peak.x,
    roof.peak.y,
    0.48,
    3,
  );
  organicLine(
    roof.peak.x,
    roof.peak.y,
    roof.rightEave.x,
    roof.rightEave.y,
    0.48,
    3,
  );

  strokeWeight(1.28);

  const insetLeftA = pointBetween(roof.leftEave, roof.peak, 0.13);
  const insetLeftB = pointBetween(roof.leftEave, roof.peak, 0.9);
  const insetRightA = pointBetween(roof.rightEave, roof.peak, 0.13);
  const insetRightB = pointBetween(roof.rightEave, roof.peak, 0.9);

  organicLine(
    insetLeftA.x,
    insetLeftA.y + 8,
    insetLeftB.x,
    insetLeftB.y + 12,
    0.32,
    3,
  );
  organicLine(
    insetRightA.x,
    insetRightA.y + 8,
    insetRightB.x,
    insetRightB.y + 12,
    0.32,
    3,
  );

  drawRoofEdgeFringe(roof.leftEave, roof.peak, roof.rightEave);

  strokeWeight(2.1);
}

function drawConnectedPerspectiveRoof(roof) {
  drawConnectedFrontRoof(roof.front);

  const s = roof.side;

  strokeWeight(2.24);

  organicLine(
    s.frontPeak.x,
    s.frontPeak.y,
    s.backPeak.x,
    s.backPeak.y,
    0.42,
    2,
  );
  organicLine(
    s.frontEave.x,
    s.frontEave.y,
    s.backEave.x,
    s.backEave.y,
    0.42,
    2,
  );
  organicLine(s.backPeak.x, s.backPeak.y, s.backEave.x, s.backEave.y, 0.42, 2);

  strokeWeight(1.1);

  const innerA = pointBetween(s.frontPeak, s.backPeak, 0.12);
  const innerB = pointBetween(s.frontEave, s.backEave, 0.86);

  organicLine(innerA.x, innerA.y + 12, innerB.x, innerB.y - 2, 0.28, 2);

  strokeWeight(2.1);
}

function drawRoofMarksInFrontPlane(roof) {
  strokeWeight(0.98);

  const marks = floor(random(10, 18));

  for (let i = 0; i < marks; i++) {
    const t = random(0.24, 0.82);
    const leftEdge = pointBetween(roof.peak, roof.leftEave, t);
    const rightEdge = pointBetween(roof.peak, roof.rightEave, t);
    const p = pointBetween(leftEdge, rightEdge, random(0.14, 0.86));

    const roofBottom = lerp(leftEdge.y, rightEdge.y, 0.5);

    if (p.y < roofBottom + 3) {
      quietDash(
        p.x + random(-3, 3),
        p.y + random(1, 5),
        random(4, 10),
        random(PI * 0.42, PI * 0.62),
      );
    }
  }

  const courses = floor(random(1, 3));

  for (let i = 0; i < courses; i++) {
    const t = random(0.48, 0.78);
    const leftEdge = pointBetween(roof.peak, roof.leftEave, t);
    const rightEdge = pointBetween(roof.peak, roof.rightEave, t);
    const start = pointBetween(leftEdge, rightEdge, random(0.12, 0.34));
    const end = pointBetween(leftEdge, rightEdge, random(0.58, 0.88));

    brokenLine(start.x, start.y, end.x, end.y + random(-1, 1), 0.34, 6);
  }

  strokeWeight(2.1);
}

function drawRoofMarksInSidePlane(sideRoof, side) {
  strokeWeight(0.92);

  const marks = floor(random(4, 8));

  for (let i = 0; i < marks; i++) {
    const ridge = pointBetween(
      sideRoof.frontPeak,
      sideRoof.backPeak,
      random(0.22, 0.86),
    );
    const eave = pointBetween(
      sideRoof.frontEave,
      sideRoof.backEave,
      random(0.22, 0.86),
    );
    const p = pointBetween(ridge, eave, random(0.34, 0.72));

    quietDash(
      p.x + random(-2, 2),
      p.y + random(-2, 3),
      random(5, 11),
      HALF_PI + side * random(0.05, 0.16),
    );
  }

  strokeWeight(2.1);
}

function drawRoofEdgeFringe(leftEave, peak, rightEave) {
  strokeWeight(1.08);

  const marks = floor(random(8, 13));

  for (let i = 0; i < marks; i++) {
    const side = random() < 0.5 ? leftEave : rightEave;
    const p = pointBetween(peak, side, random(0.48, 0.94));

    quietDash(
      p.x + random(-1, 1),
      p.y + random(4, 9),
      random(5, 10),
      HALF_PI + random(-0.18, 0.18),
    );
  }

  strokeWeight(2.1);
}

/* ==========================================================================
   BODY GEOMETRY
   ========================================================================== */

function drawFrontBody(x, y, w, h) {
  strokeWeight(2.05);

  organicLine(x, y + 5, x + random(-1.5, 1.5), y + h, 0.46, 3);
  organicLine(x + w, y + 5, x + w + random(-1.5, 1.5), y + h, 0.46, 3);
  organicLine(x, y + h, x + w, y + h + random(-0.7, 0.7), 0.42, 3);

  strokeWeight(2.1);
}

function drawPerspectiveBody(x, y, frontW, sideW, h, drop, side) {
  drawFrontBody(x, y, frontW, h);

  const sideX0 = side > 0 ? x + frontW : x;

  const sideX1 = side > 0 ? x + frontW + sideW : x - sideW;

  strokeWeight(1.6);

  // Back vertical edge of the side wall.

  // Start slightly below the roof so it doesn't create an under-eave stripe.

  organicLine(
    sideX1,

    y + drop + random(5, 9),

    sideX1 + random(-1, 1),

    y + h + drop * 0.34,

    0.34,

    2,
  );

  // Bottom edge of the side wall.

  organicLine(
    sideX0,

    y + h,

    sideX1,

    y + h + drop * 0.34,

    0.34,

    2,
  );

  // Tiny corner hint only — not a full top wall line.

  // This keeps the side plane readable without drawing that horizontal band.

  if (random() < 0.42) {
    const hintLen = random(8, 16);

    organicLine(
      sideX0,

      y + drop + random(5, 8),

      sideX0 + side * hintLen,

      y + drop + random(5, 8),

      0.22,

      1,
    );
  }

  strokeWeight(2.1);
}

/* ==========================================================================
   STRUCTURAL PLACEMENT
   ========================================================================== */

function placeFrontDoor(x, y, w, h, occupied, xRatio = 0.54) {
  const doorH = random(54, 70);
  const doorW = random(24, 32);

  const rect = makeRect(
    constrain(x + w * xRatio - doorW / 2, x + 8, x + w - doorW - 8),
    y + h - doorH,
    doorW,
    doorH,
    "door",
  );

  return occupy(occupied, rect);
}

function placeFrontWindow(x, y, w, h, occupied, door, preferredSide = "left") {
  const winW = random(20, 30);
  const winH = random(24, 34);

  const bandTop = y + h * 0.42;
  const bandBottom = y + h * 0.62;
  const yy = random(bandTop, bandBottom);

  const leftZone = [
    makeRect(x + w * random(0.14, 0.28), yy, winW, winH, "window"),
    makeRect(
      x + w * random(0.24, 0.38),
      yy + random(-4, 4),
      winW,
      winH,
      "window",
    ),
  ];

  const rightZone = [
    makeRect(x + w * random(0.62, 0.78), yy, winW, winH, "window"),
    makeRect(
      x + w * random(0.5, 0.64),
      yy + random(-4, 4),
      winW,
      winH,
      "window",
    ),
  ];

  const candidates =
    preferredSide === "right"
      ? rightZone.concat(leftZone)
      : leftZone.concat(rightZone);

  return firstSafeRect(candidates, occupied, 10, (rect) => {
    if (!rectInFacade(rect, x, y, w, h, 8)) return false;
    if (door && rectsOverlap(rect, door, 18)) return false;
    if (rect.y + rect.h > y + h - 22) return false;
    if (rect.y < y + 22) return false;
    return true;
  });
}

function placeUpperVent(x, y, w, h, occupied) {
  const ventW = random(13, 20);
  const ventH = random(14, 22);

  const rect = makeRect(
    x + w * random(0.4, 0.58),
    y + h * random(0.16, 0.28),
    ventW,
    ventH,
    "window",
  );

  return firstSafeRect([rect], occupied, 8, (r) =>
    rectInFacade(r, x, y, w, h, 10),
  );
}

function placeSideWindow(sideX, y, sideW, h, drop, side, occupied) {
  const winW = random(14, 22);
  const winH = random(20, 30);

  const left =
    side > 0
      ? sideX + sideW * random(0.24, 0.52)
      : sideX + sideW * random(0.42, 0.68);

  const rect = makeRect(
    left,
    y + h * random(0.36, 0.54),
    winW,
    winH,
    "sideWindow",
  );

  return firstSafeRect([rect], occupied, 8, (r) => {
    const minX = side > 0 ? sideX + 6 : sideX + 6;
    const maxX = side > 0 ? sideX + sideW - 6 : sideX + sideW - 6;
    return (
      r.x >= minX && r.x + r.w <= maxX && r.y > y + 18 && r.y + r.h < y + h - 16
    );
  });
}

/* ==========================================================================
   WINDOWS / DOORS
   ========================================================================== */

function drawPanedDoor(x, y, w, h) {
  strokeWeight(1.84);
  organicRect(x, y, w, h);

  strokeWeight(1.15);

  const verticals = floor(random(5, 8));
  for (let i = 0; i < verticals; i++) {
    const xx = x + map(i, 0, verticals - 1, 5, w - 5) + random(-0.8, 0.8);
    organicLine(xx, y + 6, xx + random(-0.8, 0.8), y + h - 7, 0.22, 2);
  }

  if (random() < 0.28) {
    organicLine(
      x + 5,
      y + h * 0.32,
      x + w - 5,
      y + h * 0.32 + random(-1, 1),
      0.2,
      2,
    );
  }

  inkDot(x + w - 6, y + h * random(0.46, 0.58), 2.5);

  strokeWeight(1.08);
  quietDash(x - 5, y + h + 5, w + 10, random(-0.04, 0.04));

  strokeWeight(2.1);
}

function drawPanedWindow(x, y, w, h) {
  strokeWeight(1.62);
  organicRect(x, y, w, h);

  strokeWeight(1.04);
  organicRect(x + 3, y + 3, w - 6, h - 6);

  strokeWeight(1.12);

  const midX = x + w / 2 + random(-0.8, 0.8);
  const midY = y + h / 2 + random(-0.8, 0.8);

  organicLine(midX, y + 4, midX + random(-0.4, 0.4), y + h - 4, 0.2, 2);
  organicLine(x + 4, midY, x + w - 4, midY + random(-0.4, 0.4), 0.2, 2);

  if (random() < 0.34) {
    strokeWeight(0.9);
    quietDash(x + 5, y + h * 0.28, w - 10, random(-0.04, 0.04));
  }

  strokeWeight(1.08);
  quietDash(x - 4, y + h + 5, w + 8, random(-0.04, 0.04));

  strokeWeight(2.1);
}

function drawTinyPanedWindow(x, y, w, h) {
  strokeWeight(1.35);
  organicRect(x, y, w, h);

  strokeWeight(0.92);
  organicLine(x + w / 2, y + 3, x + w / 2, y + h - 3, 0.16, 1);
  organicLine(x + 3, y + h / 2, x + w - 3, y + h / 2, 0.16, 1);

  strokeWeight(2.1);
}

function drawSidePanedWindow(x, y, w, h, side) {
  strokeWeight(1.38);

  const skew = side * random(2, 4);

  organicLine(x, y, x + w, y + skew * 0.25, 0.22, 2);
  organicLine(x + w, y + skew * 0.25, x + w, y + h + skew * 0.25, 0.22, 2);
  organicLine(x + w, y + h + skew * 0.25, x, y + h, 0.22, 2);
  organicLine(x, y + h, x, y, 0.22, 2);

  strokeWeight(0.96);
  organicLine(x + w / 2, y + 4, x + w / 2, y + h - 4, 0.16, 1);
  organicLine(x + 4, y + h / 2, x + w - 4, y + h / 2 + skew * 0.2, 0.16, 1);

  strokeWeight(0.9);
  quietDash(x - 3, y + h + 5, w + 7, random(-0.04, 0.04));

  strokeWeight(2.1);
}

function drawFeatureHalo(x, y, w, h, type) {
  strokeWeight(0.86);

  const marks = type === "door" ? floor(random(3, 6)) : floor(random(2, 4));

  for (let i = 0; i < marks; i++) {
    const side = random() < 0.5 ? -1 : 1;
    const xx = x + (side < 0 ? random(-12, -4) : w + random(4, 12));
    const yy = y + h * random(0.2, 0.86);

    quietDash(xx, yy, random(4, 8), random(-0.08, 0.08));
  }

  if (type === "window" && random() < 0.6) {
    quietDash(x - 3, y + h + random(4, 8), w + 6, random(-0.04, 0.04));
  }

  if (type === "door" && random() < 0.7) {
    quietDash(x - 5, y + h + random(6, 10), w + 10, random(-0.04, 0.04));
  }

  strokeWeight(2.1);
}

/* ==========================================================================
   CHIMNEY / ATTACHMENTS / DETAILS
   ========================================================================== */

function drawSmallChimneyOnRoof(roof, occupied) {
  const w = random(12, 18);
  const h = random(34, 50);
  const anchor = pointBetween(
    roof.peak,
    random() < 0.5 ? roof.leftEave : roof.rightEave,
    random(0.28, 0.46),
  );

  const rect = makeRect(anchor.x, anchor.y - h * 0.58, w, h, "chimney");

  if (!canPlace(rect, occupied, 8)) {
    return;
  }

  drawReferenceChimney(rect.x, rect.y, rect.w, rect.h);
  occupy(occupied, rect);
}

function drawSmallChimneyOnFrontRoof(roof, occupied) {
  drawSmallChimneyOnRoof(roof, occupied);
}

function drawReferenceChimney(x, y, w, h) {
  w *= random(0.78, 0.92);
  h *= random(0.72, 0.88);

  strokeWeight(1.35);
  organicRect(x, y + h * 0.12, w, h * 0.88);

  strokeWeight(0.84);
  const rows = floor(random(3, 5));

  for (let i = 0; i < rows; i++) {
    quietDash(
      x + 3,
      y + h * 0.22 + i * ((h * 0.62) / rows),
      w - 6,
      random(-0.04, 0.04),
    );
  }

  if (random() < 0.22) {
    sketchLine(
      x + w * 0.5,
      y + h * 0.08,
      x + w * 0.5 + random(-3, 4),
      y - random(8, 15),
      0.14,
    );
  }

  strokeWeight(2.1);
}

function drawAttachedLeanTo(x, y, w, h, preferredSide, occupied = []) {
  const candidates = [
    makeLeanToCandidate(x, y, w, h, preferredSide),
    makeLeanToCandidate(x, y, w, h, -preferredSide),
  ];

  const safe = firstSafeRect(
    candidates.map((candidate) => candidate.bounds),
    occupied,
    5,
  );

  if (!safe) {
    return null;
  }

  const shed = candidates.find((candidate) => candidate.bounds === safe);

  strokeWeight(1.52);

  organicLine(shed.x, shed.y, shed.x, shed.y + shed.h, 0.32, 2);
  organicLine(
    shed.x + shed.w,
    shed.y,
    shed.x + shed.w + random(-1, 1),
    shed.y + shed.h,
    0.32,
    2,
  );
  organicLine(
    shed.x,
    shed.y + shed.h,
    shed.x + shed.w,
    shed.y + shed.h + random(-0.6, 0.6),
    0.32,
    2,
  );

  const roofAttachY = shed.y - shed.roofLift + random(-1, 2);
  const roofOuterY = shed.y + random(4, 9);

  organicLine(shed.innerX, roofAttachY, shed.outerX, roofOuterY, 0.38, 2);

  if (random() < 0.7) {
    organicLine(
      shed.innerX,
      roofAttachY + random(9, 14),
      shed.outerX,
      roofOuterY + random(9, 14),
      0.28,
      2,
    );
  }

  strokeWeight(0.88);
  const rows = floor(random(2, 4));
  for (let i = 0; i < rows; i++) {
    const yy = shed.y + 14 + i * ((shed.h - 20) / max(1, rows));
    brokenLine(
      shed.x + 6,
      yy,
      shed.x + shed.w - 7,
      yy + random(-1, 1),
      0.34,
      6,
    );
  }

  if (random() < 0.34) {
    const windowRect = makeRect(
      shed.x + shed.w * random(0.3, 0.55),
      shed.y + shed.h * random(0.38, 0.54),
      random(12, 18),
      random(16, 23),
      "window",
    );

    drawSidePanedWindow(
      windowRect.x,
      windowRect.y,
      windowRect.w,
      windowRect.h,
      shed.side || 1,
    );
  } else if (random() < 0.18) {
    drawTinyVent(
      shed.x + shed.w * random(0.32, 0.62),
      shed.y + shed.h * random(0.38, 0.55),
    );
  }

  occupy(occupied, safe);
  strokeWeight(2.1);

  return safe;
}

function makeLeanToCandidate(x, y, w, h, side) {
  const shedW = random(36, 58);
  const shedH = h * random(0.3, 0.46);
  const baseY = y + h + random(-1.5, 1.5);
  const tuck = random(8, 16);
  const shedX = side < 0 ? x - shedW + tuck : x + w - tuck;
  const shedY = baseY - shedH;
  const roofLift = random(10, 19);
  const roofRun = random(8, 15);
  const innerX = side < 0 ? shedX + shedW - random(1, 5) : shedX + random(1, 5);
  const outerX = side < 0 ? shedX - roofRun : shedX + shedW + roofRun;
  const left = min(shedX, outerX) - 5;
  const right = max(shedX + shedW, outerX) + 5;

  return {
    x: shedX,
    y: shedY,
    w: shedW,
    h: shedH,
    side,
    innerX,
    outerX,
    roofLift,
    bounds: makeRect(
      left,
      shedY - roofLift - 4,
      right - left,
      shedH + roofLift + 8,
      "shed",
    ),
  };
}

function drawTinyVent(x, y) {
  strokeWeight(0.92);

  quietDash(x - 6, y - 3, random(8, 12), random(-0.05, 0.05));
  quietDash(x - 5, y + 2, random(7, 11), random(-0.05, 0.05));
  quietDash(x - 4, y + 7, random(6, 10), random(-0.05, 0.05));

  strokeWeight(2.1);
}

/* ==========================================================================
   TEXTURE / BASE
   ========================================================================== */

function drawSparseWallTexture(x, y, w, h) {
  strokeWeight(0.86);

  const marks = floor(random(6, 11));

  for (let i = 0; i < marks; i++) {
    const xx = random(x + 12, x + w - 12);
    const yy = random(y + h * 0.26, y + h * 0.82);

    quietDash(xx, yy, random(3, 8), random(-0.08, 0.08));
  }

  strokeWeight(0.9);

  const edgeMarks = floor(random(2, 4));
  for (let i = 0; i < edgeMarks; i++) {
    const yy = y + random(24, h - 16);
    quietDash(x - 4, yy, random(6, 12), random(-0.04, 0.04));
    quietDash(
      x + w - random(8, 12),
      yy + random(-1, 1),
      random(6, 12),
      random(-0.04, 0.04),
    );
  }

  strokeWeight(2.1);
}

function drawBaseObject(x, baseY, w, occupied = []) {
  const options = [
    {
      rect: makeRect(
        x + w * random(0.08, 0.22),
        baseY + 3,
        random(28, 40),
        20,
        "fence",
      ),
      draw: (box) => drawLowFenceDetail(box.x, baseY + 3, box.w),
    },
    {
      rect: makeRect(x + w * random(0.74, 0.9), baseY - 20, 17, 24, "pot"),
      draw: (box) => drawSmallPot(box.x, baseY - 1),
    },
    {
      rect: makeRect(x + w * random(0.13, 0.28), baseY - 14, 26, 24, "crate"),
      draw: (box) => drawSmallCrateStack(box.x, baseY + 8),
    },
  ];

  const start = floor(random(options.length));

  for (let i = 0; i < options.length; i++) {
    const detail = options[(start + i) % options.length];

    if (canPlace(detail.rect, occupied, 4)) {
      detail.draw(detail.rect);
      occupy(occupied, detail.rect);
      return true;
    }
  }

  return false;
}

function drawHouseBase(x, baseY, w, occupied = [], sideW = 0, side = 1) {
  const totalLeft = side < 0 ? x - sideW : x;
  const totalRight = side > 0 ? x + w + sideW : x + w;

  strokeWeight(1.14);
  sketchLine(
    totalLeft - 10,
    baseY + 1,
    totalRight + 10,
    baseY + random(-0.8, 0.8),
    0.32,
  );

  const protectedBaseRects = occupied.filter((rect) => rect.name === "door");
  const shrubs = floor(random(5, 8));

  for (let i = 0; i < shrubs; i++) {
    const size = random(11, 23);
    const shrubX =
      random() < 0.45
        ? random(totalLeft - 8, totalLeft + 18)
        : random(totalRight - 18, totalRight + 8);

    const shrubRect = makeRect(
      shrubX - size * 0.72,
      baseY - size * 0.72,
      size * 1.44,
      size * 0.98,
      "shrub",
    );

    if (canPlace(shrubRect, protectedBaseRects, -3)) {
      drawSketchShrub(shrubX, baseY + random(-2, 6), size);
    }
  }

  for (let i = 0; i < 13; i++) {
    const gx = randomGaussian(x + w * 0.5, w * 0.28);
    const gy = randomGaussian(baseY + 23, 10);

    if (gy > baseY - 2 && gy < baseY + 45) {
      terrainMark(gx, gy, random(3, 10));
    }
  }

  if (random() < 0.18) {
    drawBaseObject(x, baseY, w, occupied);
  }

  strokeWeight(2.1);
}

function drawSketchShrub(x, y, size) {
  strokeWeight(random(1.0, 1.42));

  const clumps = floor(random(2, 4));

  for (let c = 0; c < clumps; c++) {
    const cx = x + random(-size * 0.42, size * 0.42);
    const cy = y + random(-2, 3);
    const branches = floor(random(5, 8));

    for (let i = 0; i < branches; i++) {
      const a = random(PI * 1.05, TWO_PI - 0.12);
      const len = random(size * 0.18, size * 0.64);

      sketchLine(cx, cy, cx + cos(a) * len, cy + sin(a) * len, 0.18);
    }

    for (let i = 0; i < floor(random(3, 6)); i++) {
      inkDot(
        cx + random(-size * 0.42, size * 0.42),
        cy - random(2, size * 0.45),
        random(0.75, 1.5),
      );
    }
  }

  strokeWeight(1.0);
  if (random() < 0.6) {
    quietDash(
      x - size * 0.42,
      y + random(0, 4),
      size * random(0.32, 0.68),
      random(-0.06, 0.06),
    );
  }

  strokeWeight(2.1);
}

function drawLowFenceDetail(x, y, w) {
  strokeWeight(1.08);
  quietDash(x, y, w, random(-0.04, 0.04));
  quietDash(x + 3, y + 8, w - 6, random(-0.04, 0.04));

  const posts = floor(random(3, 5));
  for (let i = 0; i < posts; i++) {
    const px = x + 4 + i * ((w - 8) / max(1, posts - 1));
    sketchLine(px, y - 5, px + random(-1, 1), y + 12, 0.14);
  }

  strokeWeight(2.1);
}

function drawSmallPot(x, y) {
  const potW = random(10, 16);
  const potH = random(8, 13);

  strokeWeight(1.1);
  drawRectSketch(x, y - potH, potW, potH);

  for (let i = 0; i < floor(random(4, 7)); i++) {
    sketchLine(
      x + potW / 2,
      y - potH,
      x + potW / 2 + random(-9, 9),
      y - potH - random(7, 17),
      0.2,
    );
  }

  strokeWeight(2.1);
}

function drawSmallCrateStack(x, y) {
  strokeWeight(1.08);
  const w = random(13, 18);
  const h = random(9, 13);

  drawRectSketch(x, y - h, w, h);
  quietDash(x + 3, y - h * 0.5, w - 6, 0);

  if (random() < 0.48) {
    drawRectSketch(
      x + random(8, 13),
      y - h - random(8, 12),
      w * random(0.72, 0.9),
      h * random(0.72, 0.9),
    );
  }

  strokeWeight(2.1);
}

/* ==========================================================================
   LINE HELPERS
   ========================================================================== */

function organicLine(x1, y1, x2, y2, strength = 0.45, segments = 3) {
  let px = x1;
  let py = y1;

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const nx = lerp(x1, x2, t) + random(-strength, strength) * 2.0;
    const ny = lerp(y1, y2, t) + random(-strength, strength) * 2.0;

    sketchLine(px, py, nx, ny, 0.26);

    px = nx;
    py = ny;
  }
}

function organicRect(x, y, w, h) {
  organicLine(x, y, x + w, y, 0.3, 2);
  organicLine(x + w, y, x + w, y + h, 0.3, 2);
  organicLine(x + w, y + h, x, y + h, 0.3, 2);
  organicLine(x, y + h, x, y, 0.3, 2);
}

function pointBetween(a, b, t) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}
