const HOUSE_ARCHETYPES = [
  "objectCottage",
  "objectCottage",
  "objectCottage",
  "plainCottage",
  "plainCottage",
  "plainCottage",
  "narrowCabin",
];

const DEBUG_LAYOUT_NAMES = ["door", "window", "shed", "chimney"];

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
      validator(rect) &&
      canPlace(rect, occupiedRects, padding, ignoreNames)
    ) {
      return rect;
    }
  }

  return null;
}

function rectInFacade(rect, x, y, w, h, inset = 4) {
  return (
    rect.x >= x + inset &&
    rect.x + rect.w <= x + w - inset &&
    rect.y >= y + inset &&
    rect.y + rect.h <= y + h + 2
  );
}

function drawProceduralTinyHouse() {
  const archetype = random(HOUSE_ARCHETYPES);

  const footprint = {
    w: random(160, 218),
    wallH: random(124, 166),
    roofH: random(56, 84),
  };

  if (archetype === "plainCottage") {
    drawPlainCottage(footprint);
    return;
  }

  if (archetype === "narrowCabin") {
    drawNarrowCabin(footprint);
    return;
  }

  if (archetype === "objectCottage") {
    drawObjectCottage(footprint);
    return;
  }

  throw new Error("Unknown archetype: " + archetype);
}

/* ==========================================================================
   COTTAGE ARCHETYPES
   ========================================================================== */

function drawObjectCottage({ w, wallH, roofH }) {
  w *= random(0.88, 1.02);
  wallH *= random(0.86, 1.02);

  const frontW = w * random(0.62, 0.76);
  const sideW = w - frontW;
  const x = -w / 2;
  const y = -wallH;
  const occupied = [];
  const drop = random(12, 22);

  const peak = makePeak(x, y, frontW, roofH * random(0.84, 1.06));
  const backPeak = {
    x: peak.x + sideW * random(0.82, 1.0),
    y: peak.y + drop,
  };

  const leftRoof = {
    x: x - random(16, 23),
    y: y + random(6, 11),
  };

  const frontRight = {
    x: x + frontW + random(13, 20),
    y: y + random(6, 11),
  };

  const sideRight = {
    x: x + frontW + sideW + random(10, 17),
    y: y + drop + random(6, 11),
  };

  drawPerspectiveShell(x, y, frontW, sideW, wallH, drop);
  drawFacadeTexture(x, y, frontW, wallH, random(["quiet", "quiet", "siding"]));
  drawSidePlaneTexture(x + frontW, y + drop, sideW, wallH, drop);
  drawPerspectiveRoofPlane(leftRoof, peak, frontRight, backPeak, sideRight);

  const doorH = random(56, 72);
  const doorW = random(25, 33);

  const door = occupy(
    occupied,
    firstSafeRect(
      [
        makeRect(x + frontW * random(0.48, 0.62), -doorH, doorW, doorH, "door"),
        makeRect(x + frontW * random(0.36, 0.48), -doorH, doorW, doorH, "door"),
        makeRect(x + frontW * random(0.6, 0.7), -doorH, doorW, doorH, "door"),
      ],
      occupied,
      8,
      (rect) => rectInFacade(rect, x, y, frontW, wallH),
    ) || makeRect(x + frontW * 0.52, -doorH, doorW, doorH, "door"),
  );

  drawReferenceDoor(door.x, door.y, door.w, door.h, true);
  drawFeatureHalo(door.x, door.y, door.w, door.h, "door");

  const windowRect = firstSafeRect(
    [
      makeRect(
        x + frontW * random(0.13, 0.3),
        y + wallH * random(0.42, 0.57),
        random(20, 30),
        random(25, 37),
        "window",
      ),
      makeRect(
        x + frontW * random(0.62, 0.78),
        y + wallH * random(0.38, 0.54),
        random(18, 28),
        random(24, 35),
        "window",
      ),
      makeRect(
        x + frontW * random(0.2, 0.36),
        y + wallH * random(0.24, 0.36),
        random(16, 24),
        random(21, 30),
        "window",
      ),
    ],
    occupied,
    8,
    (rect) => rectInFacade(rect, x, y, frontW, wallH),
  );

  if (windowRect) {
    drawReferenceWindow(
      windowRect.x,
      windowRect.y,
      windowRect.w,
      windowRect.h,
      random() < 0.32,
    );
    drawFeatureHalo(
      windowRect.x,
      windowRect.y,
      windowRect.w,
      windowRect.h,
      "window",
    );
    occupy(occupied, windowRect);
  } else {
    drawFallbackFacadeMarks(x, y, frontW, wallH, 7);
  }

  if (random() < 0.24) {
    const chimneyW = random(13, 19);
    const chimneyH = random(38, 54);

    const chimney = firstSafeRect(
      [
        makeRect(
          x + frontW + sideW * random(0.36, 0.68),
          y + drop - chimneyH + random(3, 12),
          chimneyW,
          chimneyH,
          "chimney",
        ),
        makeRect(
          x + frontW * random(0.62, 0.82),
          y - chimneyH + random(3, 10),
          chimneyW,
          chimneyH,
          "chimney",
        ),
      ],
      occupied,
      8,
    );

    if (chimney) {
      drawReferenceChimney(chimney.x, chimney.y, chimney.w, chimney.h);
      occupy(occupied, chimney);
    }
  }

  if (random() < 0.34) {
    drawBaseFallbackDetail(x, 0, w, occupied);
  }

  drawHouseBase(x, 0, w, occupied);
}

function drawPlainCottage({ w, wallH, roofH }) {
  w *= random(0.82, 1.0);
  wallH *= random(0.88, 1.04);

  const x = -w / 2;
  const y = -wallH;
  const occupied = [];
  const peak = makePeak(x, y, w, roofH * random(0.86, 1.08));
  const eave = random(17, 25);

  const leftRoof = { x: x - eave, y: y + random(6, 11) };
  const rightRoof = { x: x + w + eave + random(-7, 7), y: y + random(6, 12) };

  drawFacadeShell(x, y, w, wallH);
  drawFacadeTexture(x, y, w, wallH, random(["quiet", "quiet", "siding"]));
  drawGableRoofPlane(peak, leftRoof, rightRoof, random(["tile", "hatch"]));

  const doorH = random(56, 72);
  const doorW = random(25, 33);

  const door = occupy(
    occupied,
    firstSafeRect(
      [
        makeRect(x + w * random(0.44, 0.61), -doorH, doorW, doorH, "door"),
        makeRect(x + w * random(0.62, 0.72), -doorH, doorW, doorH, "door"),
        makeRect(x + w * random(0.28, 0.4), -doorH, doorW, doorH, "door"),
      ],
      occupied,
      8,
      (rect) => rectInFacade(rect, x, y, w, wallH),
    ) || makeRect(x + w * 0.52, -doorH, doorW, doorH, "door"),
  );

  drawReferenceDoor(door.x, door.y, door.w, door.h, true);
  drawFeatureHalo(door.x, door.y, door.w, door.h, "door");

  let placedWindows = 0;

  const firstWindow = firstSafeRect(
    [
      makeRect(
        x + w * random(0.12, 0.26),
        y + wallH * random(0.43, 0.56),
        random(20, 30),
        random(26, 37),
        "window",
      ),
      makeRect(
        x + w * random(0.67, 0.78),
        y + wallH * random(0.44, 0.58),
        random(18, 28),
        random(24, 35),
        "window",
      ),
    ],
    occupied,
    8,
    (rect) => rectInFacade(rect, x, y, w, wallH),
  );

  if (firstWindow) {
    drawReferenceWindow(
      firstWindow.x,
      firstWindow.y,
      firstWindow.w,
      firstWindow.h,
      random() < 0.24,
    );
    drawFeatureHalo(
      firstWindow.x,
      firstWindow.y,
      firstWindow.w,
      firstWindow.h,
      "window",
    );
    occupy(occupied, firstWindow);
    placedWindows++;
  }

  if (random() < 0.28) {
    const secondWindow = firstSafeRect(
      [
        makeRect(
          x + w * random(0.64, 0.8),
          y + wallH * random(0.46, 0.59),
          random(17, 27),
          random(23, 35),
          "window",
        ),
        makeRect(
          x + w * random(0.12, 0.26),
          y + wallH * random(0.5, 0.62),
          random(16, 24),
          random(22, 32),
          "window",
        ),
      ],
      occupied,
      8,
      (rect) => rectInFacade(rect, x, y, w, wallH),
    );

    if (secondWindow) {
      drawReferenceWindow(
        secondWindow.x,
        secondWindow.y,
        secondWindow.w,
        secondWindow.h,
        random() < 0.18,
      );
      drawFeatureHalo(
        secondWindow.x,
        secondWindow.y,
        secondWindow.w,
        secondWindow.h,
        "window",
      );
      occupy(occupied, secondWindow);
      placedWindows++;
    }
  }

  if (placedWindows === 0) {
    drawFallbackFacadeMarks(x, y, w, wallH);
  }

  if (random() < 0.54) {
    const shed = drawAttachedLeanTo(x, y, w, wallH, random([-1, 1]), occupied);

    if (!shed) {
      drawBaseFallbackDetail(x, 0, w, occupied);
    }
  }

  if (random() < 0.22) {
    const chimneyW = random(13, 19);
    const chimneyH = random(38, 54);

    const chimney = firstSafeRect(
      [
        makeRect(
          x + w * random(0.68, 0.84),
          y - chimneyH + random(3, 10),
          chimneyW,
          chimneyH,
          "chimney",
        ),
        makeRect(
          x + w * random(0.2, 0.34),
          y - chimneyH + random(3, 10),
          chimneyW,
          chimneyH,
          "chimney",
        ),
      ],
      occupied,
      8,
    );

    if (chimney) {
      drawReferenceChimney(chimney.x, chimney.y, chimney.w, chimney.h);
      occupy(occupied, chimney);
    }
  }

  drawHouseBase(x, 0, w, occupied);
}

function drawNarrowCabin({ w, wallH, roofH }) {
  w *= random(0.72, 0.86);
  wallH *= random(0.9, 1.04);

  const x = -w / 2;
  const y = -wallH;
  const occupied = [];
  const peak = makePeak(x, y, w, roofH * random(0.94, 1.1));
  const eave = random(17, 24);
  const lean = random(-11, 11);

  const leftRoof = { x: x - eave, y: y + random(6, 11) };
  const rightRoof = { x: x + w + eave + lean, y: y + random(8, 12) };

  drawFacadeShell(x, y, w, wallH);
  drawFacadeTexture(x, y, w, wallH, random(["quiet", "siding"]));
  drawGableRoofPlane(peak, leftRoof, rightRoof, random(["hatch", "tile"]));

  const doorH = random(56, 72);
  const doorW = random(24, 32);

  const door = occupy(
    occupied,
    firstSafeRect(
      [
        makeRect(x + w * random(0.48, 0.62), -doorH, doorW, doorH, "door"),
        makeRect(x + w * random(0.36, 0.48), -doorH, doorW, doorH, "door"),
        makeRect(x + w * random(0.62, 0.72), -doorH, doorW, doorH, "door"),
      ],
      occupied,
      8,
      (rect) => rectInFacade(rect, x, y, w, wallH),
    ) || makeRect(x + w * 0.54, -doorH, doorW, doorH, "door"),
  );

  drawReferenceDoor(door.x, door.y, door.w, door.h, true);
  drawFeatureHalo(door.x, door.y, door.w, door.h, "door");

  const windowRect = firstSafeRect(
    [
      makeRect(
        x + w * random(0.13, 0.28),
        y + wallH * random(0.45, 0.58),
        random(18, 26),
        random(25, 34),
        "window",
      ),
      makeRect(
        x + w * random(0.66, 0.78),
        y + wallH * random(0.38, 0.52),
        random(17, 24),
        random(22, 32),
        "window",
      ),
    ],
    occupied,
    8,
    (rect) => rectInFacade(rect, x, y, w, wallH),
  );

  if (windowRect) {
    drawReferenceWindow(
      windowRect.x,
      windowRect.y,
      windowRect.w,
      windowRect.h,
      false,
    );
    drawFeatureHalo(
      windowRect.x,
      windowRect.y,
      windowRect.w,
      windowRect.h,
      "window",
    );
    occupy(occupied, windowRect);
  } else {
    drawFallbackFacadeMarks(x, y, w, wallH, 7);
  }

  if (random() < 0.42) {
    const shed = drawAttachedLeanTo(x, y, w, wallH, random([-1, 1]), occupied);

    if (!shed) {
      drawBaseFallbackDetail(x, 0, w, occupied);
    }
  }

  if (random() < 0.16) {
    const chimneyW = random(13, 18);
    const chimneyH = random(36, 52);

    const chimney = firstSafeRect(
      [
        makeRect(
          x + w * random(0.64, 0.84),
          y - chimneyH + random(3, 10),
          chimneyW,
          chimneyH,
          "chimney",
        ),
      ],
      occupied,
      8,
    );

    if (chimney) {
      drawReferenceChimney(chimney.x, chimney.y, chimney.w, chimney.h);
      occupy(occupied, chimney);
    }
  }

  drawHouseBase(x, 0, w, occupied);
}

/* ==========================================================================
   SHAPE / STRUCTURE HELPERS
   ========================================================================== */

function makePeak(x, y, w, roofH) {
  return {
    x: x + w * random(0.42, 0.58),
    y: y - roofH,
  };
}

function organicLine(x1, y1, x2, y2, strength = 0.45, segments = 3) {
  let px = x1;
  let py = y1;

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const nx = lerp(x1, x2, t) + random(-strength, strength) * 2.2;
    const ny = lerp(y1, y2, t) + random(-strength, strength) * 2.2;

    sketchLine(px, py, nx, ny, 0.28);

    px = nx;
    py = ny;
  }
}

function organicRect(x, y, w, h) {
  organicLine(x, y, x + w, y, 0.36, 2);
  organicLine(x + w, y, x + w, y + h, 0.36, 2);
  organicLine(x + w, y + h, x, y + h, 0.36, 2);
  organicLine(x, y + h, x, y, 0.36, 2);
}

function drawFacadeShell(x, y, w, h) {
  strokeWeight(2.22);

  organicLine(x, y + 5, x + random(-1.8, 1.8), y + h, 0.52, 3);
  organicLine(x + w, y + 5, x + w + random(-1.8, 1.8), y + h, 0.52, 3);
  organicLine(x, y + h, x + w, y + h + random(-0.8, 0.8), 0.48, 3);

  strokeWeight(2.1);
}

function drawPerspectiveShell(x, y, frontW, sideW, h, drop) {
  drawFacadeShell(x, y, frontW, h);

  strokeWeight(1.66);
  organicLine(
    x + frontW,
    y + drop,
    x + frontW + sideW,
    y + drop + random(-1, 1),
    0.38,
    2,
  );
  organicLine(
    x + frontW + sideW,
    y + drop,
    x + frontW + sideW + random(-1, 1),
    y + h + drop * 0.34,
    0.38,
    2,
  );
  organicLine(
    x + frontW,
    y + h,
    x + frontW + sideW,
    y + h + drop * 0.34,
    0.38,
    2,
  );
  strokeWeight(2.1);
}

function drawGableRoofPlane(peak, left, right, texture) {
  strokeWeight(2.54);

  organicLine(left.x, left.y, peak.x, peak.y, 0.52, 3);
  organicLine(peak.x, peak.y, right.x, right.y, 0.52, 3);

  strokeWeight(1.36);
  organicLine(left.x + 10, left.y + 12, peak.x, peak.y + 15, 0.38, 3);
  organicLine(peak.x, peak.y + 15, right.x - 10, right.y + 12, 0.38, 3);

  drawLooseRoofTexture(peak, left, right);
  drawRoofEdgeFringe(peak, left, right, 0.7);

  strokeWeight(2.1);
}

function drawPerspectiveRoofPlane(left, peak, frontRight, backPeak, sideRight) {
  strokeWeight(2.54);

  organicLine(left.x, left.y, peak.x, peak.y, 0.52, 3);
  organicLine(peak.x, peak.y, frontRight.x, frontRight.y, 0.52, 3);
  organicLine(peak.x, peak.y, backPeak.x, backPeak.y, 0.42, 2);
  organicLine(frontRight.x, frontRight.y, sideRight.x, sideRight.y, 0.42, 2);
  organicLine(backPeak.x, backPeak.y, sideRight.x, sideRight.y, 0.42, 2);

  strokeWeight(1.08);
  drawLooseRoofTexture(peak, left, frontRight);
  drawRoofEdgeFringe(peak, left, frontRight, 0.58);

  for (let i = 0; i < 5; i++) {
    const t = (i + 0.4) / 5;
    const a = pointBetween(peak, backPeak, t);
    quietDash(
      a.x + random(-2, 2),
      a.y + random(8, 20),
      random(6, 13),
      HALF_PI + random(-0.16, 0.16),
    );
  }

  strokeWeight(2.1);
}

function drawLooseRoofTexture(peak, left, right) {
  strokeWeight(1.02);

  const clusters = floor(random(12, 21));

  for (let i = 0; i < clusters; i++) {
    const t = random() < 0.34 ? random(0.22, 0.42) : random(0.42, 0.88);
    const a = pointBetween(peak, left, t);
    const b = pointBetween(peak, right, t);
    const p = pointBetween(a, b, random(0.14, 0.86));

    if (random() < 0.58) {
      quietDash(
        p.x + random(-5, 5),
        p.y + random(-3, 3),
        random(5, 10),
        random(PI * 0.42, PI * 0.62),
      );
    } else {
      quietDash(
        p.x + random(-5, 5),
        p.y + random(-3, 3),
        random(4, 8),
        random(-0.08, 0.08),
      );
    }
  }

  for (let i = 0; i < floor(random(1, 4)); i++) {
    const t = random(0.34, 0.78);
    const a = pointBetween(peak, left, t);
    const b = pointBetween(peak, right, t);
    const start = pointBetween(a, b, random(0.1, 0.34));
    const end = pointBetween(a, b, random(0.55, 0.9));

    brokenLine(
      start.x,
      start.y + random(-1, 1),
      end.x,
      end.y + random(-1, 1),
      0.4,
      7,
    );
  }

  strokeWeight(2.1);
}

function drawRoofEdgeFringe(peak, left, right, density = 1) {
  strokeWeight(1.12);

  const marks = floor(11 * density);

  for (let i = 0; i < marks; i++) {
    const side = random() < 0.5 ? left : right;
    const p = pointBetween(peak, side, random(0.44, 0.94));

    quietDash(
      p.x + random(-1, 1),
      p.y + random(5, 10),
      random(5, 11),
      HALF_PI + random(-0.18, 0.18),
    );
  }

  strokeWeight(2.1);
}

/* ==========================================================================
   DETAILS
   ========================================================================== */

function drawReferenceDoor(x, y, w, h, dark) {
  strokeWeight(1.9);
  organicRect(x, y, w, h);

  if (dark) {
    strokeWeight(1.2);

    const strokes = floor(random(8, 12));

    for (let i = 0; i < strokes; i++) {
      const xx = x + random(5, w - 5);

      organicLine(
        xx,
        y + random(5, 10),
        xx + random(-1.2, 1.2),
        y + h - random(5, 9),
        0.28,
        2,
      );
    }
  } else if (random() < 0.72) {
    organicRect(x + 6, y + 8, w - 12, h - 16);
  }

  strokeWeight(1.22);
  quietDash(x - 4, y + h + 5, w + 8, random(-0.04, 0.04));

  inkDot(x + w - 7, y + h * 0.52, 3.0);
  strokeWeight(2.1);
}

function drawReferenceWindow(x, y, w, h, dark) {
  strokeWeight(1.68);
  organicRect(x, y, w, h);

  if (dark) {
    strokeWeight(0.95);

    for (let i = 0; i < 5; i++) {
      const xx = x + random(4, w - 4);
      quietDash(xx, y + 5, h - 10, HALF_PI + random(-0.08, 0.08));
    }
  }

  strokeWeight(1.18);
  organicLine(
    x + w / 2,
    y + 4,
    x + w / 2 + random(-0.5, 0.5),
    y + h - 4,
    0.28,
    2,
  );

  if (random() < 0.78) {
    organicLine(
      x + 4,
      y + h / 2,
      x + w - 4,
      y + h / 2 + random(-0.5, 0.5),
      0.28,
      2,
    );
  }

  if (random() < 0.5) {
    quietDash(x - 4, y + h + 5, w + 8, random(-0.04, 0.04));
  }

  strokeWeight(2.1);
}

function drawFeatureHalo(x, y, w, h, type) {
  strokeWeight(0.9);

  const marks = type === "door" ? floor(random(3, 6)) : floor(random(2, 5));

  for (let i = 0; i < marks; i++) {
    const side = random() < 0.5 ? -1 : 1;
    const xx = x + (side < 0 ? random(-12, -4) : w + random(4, 12));
    const yy = y + h * random(0.18, 0.9);

    quietDash(xx, yy, random(4, 9), random(-0.08, 0.08));
  }

  if (type === "window" && random() < 0.65) {
    quietDash(x - 3, y + h + random(4, 8), w + 6, random(-0.04, 0.04));
  }

  if (type === "door" && random() < 0.7) {
    quietDash(x - 5, y + h + random(6, 10), w + 10, random(-0.04, 0.04));
  }

  strokeWeight(2.1);
}

function drawReferenceChimney(x, y, w, h) {
  w *= random(0.74, 0.88);
  h *= random(0.68, 0.82);

  strokeWeight(1.5);
  organicRect(x, y + h * 0.12, w, h * 0.88);

  strokeWeight(0.9);
  const rows = floor(random(3, 5));

  for (let i = 0; i < rows; i++) {
    quietDash(
      x + 3,
      y + h * 0.22 + i * ((h * 0.62) / rows),
      w - 6,
      random(-0.04, 0.04),
    );
  }

  if (random() < 0.24) {
    strokeWeight(0.85);
    sketchLine(
      x + w * 0.5,
      y + h * 0.1,
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

  strokeWeight(1.66);
  organicLine(shed.x, shed.y, shed.x, shed.y + shed.h, 0.36, 2);
  organicLine(
    shed.x + shed.w,
    shed.y,
    shed.x + shed.w + random(-1, 1),
    shed.y + shed.h,
    0.36,
    2,
  );
  organicLine(
    shed.x,
    shed.y + shed.h,
    shed.x + shed.w,
    shed.y + shed.h + random(-0.6, 0.6),
    0.36,
    2,
  );

  const roofAttachY = shed.y - shed.roofLift + random(-1, 2);
  const roofOuterY = shed.y + random(4, 10);

  organicLine(shed.innerX, roofAttachY, shed.outerX, roofOuterY, 0.42, 2);

  if (random() < 0.72) {
    organicLine(
      shed.innerX,
      roofAttachY + random(10, 15),
      shed.outerX,
      roofOuterY + random(10, 15),
      0.3,
      2,
    );
  }

  strokeWeight(0.96);
  const rows = floor(random(3, 5));
  for (let i = 0; i < rows; i++) {
    const yy = shed.y + 14 + i * ((shed.h - 20) / max(1, rows));
    brokenLine(shed.x + 6, yy, shed.x + shed.w - 7, yy + random(-1, 1), 0.4, 6);
  }

  if (random() < 0.22) {
    const windowRect = makeRect(
      shed.x + shed.w * random(0.28, 0.5),
      shed.y + shed.h * random(0.38, 0.54),
      random(13, 20),
      random(17, 25),
      "window",
    );

    drawReferenceWindow(
      windowRect.x,
      windowRect.y,
      windowRect.w,
      windowRect.h,
      random() < 0.18,
    );
    drawFeatureHalo(
      windowRect.x,
      windowRect.y,
      windowRect.w,
      windowRect.h,
      "window",
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

/* ==========================================================================
   TEXTURE / BASE
   ========================================================================== */

function drawFacadeTexture(x, y, w, h, mode) {
  if (mode === "siding") {
    strokeWeight(0.96);

    const rows = floor(random(4, 6));

    for (let i = 0; i < rows; i++) {
      const yy = y + h * 0.27 + i * ((h * 0.48) / max(1, rows));
      brokenLine(x + 11, yy, x + w - 11, yy + random(-1, 1), 0.34, 7);
    }
  }

  if (mode === "quiet") {
    strokeWeight(0.92);

    for (let i = 0; i < 9; i++) {
      if (random() < 0.72) {
        quietDash(
          random(x + 10, x + w - 10),
          random(y + 20, y + h - 12),
          random(3, 8),
          random(-0.08, 0.08),
        );
      } else {
        inkDot(
          random(x + 10, x + w - 10),
          random(y + 20, y + h - 12),
          random(0.8, 1.45),
        );
      }
    }
  }

  strokeWeight(0.96);
  for (let i = 0; i < 3; i++) {
    const yy = y + 18 + i * random(20, 28);
    quietDash(x - 4, yy, random(7, 12), 0);
    quietDash(x + w - random(8, 12), yy + random(-1, 1), random(7, 12), 0);
  }

  strokeWeight(2.1);
}

function drawSidePlaneTexture(x, y, w, h, drop) {
  strokeWeight(0.92);

  const rows = floor(random(3, 5));

  for (let i = 0; i < rows; i++) {
    const yy = y + 15 + i * ((h - 24) / max(1, rows));
    brokenLine(x + 6, yy, x + w - 8, yy + drop * 0.18 + random(-1, 1), 0.34, 6);
  }

  strokeWeight(2.1);
}

function drawFallbackFacadeMarks(x, y, w, h, count = 8) {
  strokeWeight(0.92);

  for (let i = 0; i < count; i++) {
    const cluster = random() < 0.55 ? random(0.16, 0.38) : random(0.6, 0.84);
    const xx = x + w * cluster + random(-7, 7);
    const yy = y + h * random(0.32, 0.78);

    quietDash(xx, yy, random(4, 8), random(-0.08, 0.08));
  }

  strokeWeight(2.1);
}

function drawBaseFallbackDetail(x, baseY, w, occupied = []) {
  const details = [
    {
      rect: makeRect(
        x + w * random(0.08, 0.22),
        baseY + 3,
        random(30, 44),
        20,
        "fence",
      ),
      draw: (box) => drawLowFenceDetail(box.x, baseY + 3, box.w),
    },
    {
      rect: makeRect(x + w * random(0.76, 0.92), baseY - 22, 18, 25, "pot"),
      draw: (box) => drawSmallPot(box.x, baseY - 1),
    },
    {
      rect: makeRect(x + w * random(0.13, 0.28), baseY - 16, 28, 26, "crate"),
      draw: (box) => drawSmallCrateStack(box.x, baseY + 9),
    },
  ];

  const start = floor(random(details.length));

  for (let i = 0; i < details.length; i++) {
    const detail = details[(start + i) % details.length];

    if (canPlace(detail.rect, occupied, 4)) {
      detail.draw(detail.rect);
      occupy(occupied, detail.rect);
      return true;
    }
  }

  drawSketchShrub(x + w * random(0.08, 0.92), baseY + 3, random(13, 21));
  return false;
}

function drawHouseBase(x, baseY, w, occupied = []) {
  strokeWeight(1.18);
  sketchLine(x - 13, baseY + 1, x + w + 13, baseY + random(-0.8, 0.8), 0.34);

  const protectedBaseRects = occupied.filter((rect) => rect.name === "door");
  const shrubs = floor(random(5, 9));

  for (let i = 0; i < shrubs; i++) {
    const sideBias =
      i < shrubs * 0.46 ? random(-16, 20) : random(w - 20, w + 16);
    const centerBias = random() < 0.12 ? random(w * 0.18, w * 0.82) : sideBias;
    const size = random(11, 24);
    const shrubX = x + centerBias;
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

  for (let i = 0; i < 14; i++) {
    const gx = randomGaussian(x + w * 0.5, w * 0.3);
    const gy = randomGaussian(baseY + 23, 10);

    if (gy > baseY - 2 && gy < baseY + 46) {
      terrainMark(gx, gy, random(3, 10));
    }
  }

  if (random() < 0.18) {
    const bench = makeRect(
      x + w * random(0.14, 0.32),
      baseY + random(10, 18),
      random(31, 42),
      22,
      "bench",
    );

    if (canPlace(bench, occupied, 5)) {
      drawLittleBench(bench.x, bench.y, bench.w);
    }
  }

  strokeWeight(2.1);
}

function drawSketchShrub(x, y, size) {
  strokeWeight(random(1.0, 1.48));

  const clumps = floor(random(2, 4));

  for (let c = 0; c < clumps; c++) {
    const cx = x + random(-size * 0.45, size * 0.45);
    const cy = y + random(-2, 3);
    const branches = floor(random(5, 8));

    for (let i = 0; i < branches; i++) {
      const a = random(PI * 1.05, TWO_PI - 0.12);
      const len = random(size * 0.18, size * 0.66);

      sketchLine(cx, cy, cx + cos(a) * len, cy + sin(a) * len, 0.18);
    }

    for (let i = 0; i < floor(random(3, 7)); i++) {
      inkDot(
        cx + random(-size * 0.42, size * 0.42),
        cy - random(2, size * 0.45),
        random(0.75, 1.55),
      );
    }
  }

  strokeWeight(1.05);
  if (random() < 0.62) {
    quietDash(
      x - size * 0.45,
      y + random(0, 4),
      size * random(0.32, 0.7),
      random(-0.06, 0.06),
    );
  }

  strokeWeight(2.1);
}

function drawTinyVent(x, y) {
  strokeWeight(1.0);

  quietDash(x - 6, y - 3, random(8, 12), random(-0.05, 0.05));
  quietDash(x - 5, y + 2, random(7, 11), random(-0.05, 0.05));
  quietDash(x - 4, y + 7, random(6, 10), random(-0.05, 0.05));

  strokeWeight(2.1);
}

function drawLowFenceDetail(x, y, w) {
  strokeWeight(1.12);
  quietDash(x, y, w, random(-0.04, 0.04));
  quietDash(x + 3, y + 8, w - 6, random(-0.04, 0.04));

  const posts = floor(random(3, 5));
  for (let i = 0; i < posts; i++) {
    const px = x + 4 + i * ((w - 8) / max(1, posts - 1));
    sketchLine(px, y - 5, px + random(-1, 1), y + 12, 0.14);
  }

  strokeWeight(2.1);
}

function drawLittleBench(x, y, forcedW = null) {
  strokeWeight(1.2);
  const benchW = forcedW || random(31, 42);
  quietDash(x, y, benchW, random(-0.04, 0.04));
  quietDash(x + 3, y + 8, benchW * random(0.76, 0.9), random(-0.04, 0.04));
  sketchLine(x + 7, y + 8, x + 4, y + 20, 0.16);
  sketchLine(x + benchW - 8, y + 8, x + benchW - 5, y + 20, 0.16);
  strokeWeight(2.1);
}

function drawSmallPot(x, y) {
  const potW = random(10, 16);
  const potH = random(8, 13);

  strokeWeight(1.2);
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
  strokeWeight(1.15);
  const w = random(13, 18);
  const h = random(9, 13);

  drawRectSketch(x, y - h, w, h);
  quietDash(x + 3, y - h * 0.5, w - 6, 0);

  if (random() < 0.5) {
    drawRectSketch(
      x + random(8, 13),
      y - h - random(8, 12),
      w * random(0.72, 0.9),
      h * random(0.72, 0.9),
    );
  }

  strokeWeight(2.1);
}

function pointBetween(a, b, t) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}
