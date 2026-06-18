const HOUSE_ARCHETYPES = [
  "objectCottage",
  "objectCottage",
  "objectCottage",
  "plainCottage",
  "narrowCabin",
  "narrowCabin",
  "narrowCabin",
];

const DEBUG_LAYOUT_NAMES = ["door", "window", "sign", "awning", "shed", "chimney", "display"];

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
    return ignoreNames.includes(other.name) || !rectsOverlap(rect, other, padding);
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
  if (name === "sign") return [255, 196, 54];
  if (name === "awning") return [189, 96, 255];
  if (name === "shed") return [88, 222, 137];
  if (name === "chimney") return [255, 127, 80];
  if (name === "display") return [63, 220, 220];

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

function firstSafeRect(candidates, occupiedRects, padding, validator = () => true, ignoreNames = []) {
  for (const rect of candidates) {
    if (validator(rect) && canPlace(rect, occupiedRects, padding, ignoreNames)) {
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
    w: random(176, 232),
    wallH: random(124, 168),
    roofH: random(56, 86),
  };

  if (archetype === "objectCottage") {
    drawObjectCottage(footprint);
    return;
  }

  if (archetype === "plainCottage") {
    drawPlainCottage(footprint);
    return;
  }

  if (archetype === "narrowCabin") {
    drawNarrowCabin(footprint);
    return;
  }

  drawObjectCottage(footprint);
}

function drawRamenGable({ w, wallH, roofH }) {
  const x = -w / 2;
  const y = -wallH;
  const occupied = [];
  const peak = makePeak(x, y, w, roofH);
  const eave = random(19, 26);
  const leftRoof = { x: x - eave, y: y + random(7, 11) };
  const rightRoof = { x: x + w + eave, y: y + random(7, 11) };

  if (random() < 0.72) {
    const chimneyW = random(17, 23);
    const chimneyH = random(58, 76);
    const chimney = makeRect(
      x + w * random(0.76, 0.88),
      y - chimneyH + random(0, 10),
      chimneyW,
      chimneyH,
      "chimney",
    );

    if (canPlace(chimney, occupied, 8)) {
      drawReferenceChimney(chimney.x, chimney.y, chimney.w, chimney.h);
      occupy(occupied, chimney);
    }
  }

  drawFacadeShell(x, y, w, wallH);
  drawFacadeTexture(x, y, w, wallH, random(["stucco", "quiet", "quiet"]));
  drawGableRoofPlane(peak, leftRoof, rightRoof, random(["tile", "tile", "hatch"]));

  const sign = firstSafeRect(
    [
      makeRect(x + w * random(0.2, 0.27), y + wallH * random(0.24, 0.3), w * random(0.47, 0.57), random(25, 34), "sign"),
      makeRect(x + w * random(0.16, 0.22), y + wallH * random(0.3, 0.36), w * random(0.5, 0.62), random(23, 31), "sign"),
    ],
    occupied,
    8,
    (rect) => rectInFacade(rect, x, y, w, wallH),
  );

  if (sign) {
    drawRamenSign(sign.x, sign.y, sign.w, sign.h);
    occupy(occupied, sign);
  } else {
    drawFallbackFacadeMarks(x, y, w, wallH);
  }

  const doorW = random(27, 36);
  const doorH = random(58, 74);
  const door = occupy(
    occupied,
    firstSafeRect(
      [
        makeRect(x + w * random(0.55, 0.67), -doorH, doorW, doorH, "door"),
        makeRect(x + w * random(0.43, 0.53), -doorH, doorW, doorH, "door"),
        makeRect(x + w * random(0.68, 0.76), -doorH, doorW, doorH, "door"),
      ],
      occupied,
      8,
      (rect) => rectInFacade(rect, x, y, w, wallH),
    ) || makeRect(x + w * 0.58, -doorH, doorW, doorH, "door"),
  );
  drawReferenceDoor(door.x, door.y, door.w, door.h, true);

  let awning = null;

  if (sign && random() < 0.68) {
    const awningH = random(13, 20);
    const candidate = makeRect(
      sign.x - random(3, 8),
      sign.y + sign.h + random(7, 12),
      sign.w + random(6, 14),
      awningH,
      "awning",
    );

    if (canPlace(candidate, occupied, 3)) {
      awning = occupy(occupied, candidate);
      drawShopAwning(awning.x, awning.y, awning.w, awning.h);
    }
  }

  const displayY = max(y + wallH * 0.52, sign ? sign.y + sign.h + (awning ? awning.h + 17 : 12) : y + wallH * 0.42);
  const displayCandidates = [
    makeRect(x + w * 0.13, displayY, random(32, 43), random(30, 40), "display"),
    makeRect(x + w * 0.69, displayY + random(-3, 5), random(28, 38), random(28, 37), "display"),
    makeRect(x + w * 0.28, displayY + random(4, 10), random(30, 40), random(27, 36), "display"),
  ];
  const display = firstSafeRect(displayCandidates, occupied, 7, (rect) => rectInFacade(rect, x, y, w, wallH));
  if (display) {
    drawStorefrontDisplay(display.x, display.y, display.w, display.h);
    occupy(occupied, display);
  } else {
    drawBaseFallbackDetail(x, 0, w, occupied);
  }

  if (random() < 0.4) {
    drawTinyVent(peak.x + random(-8, 8), y + wallH * 0.14);
  }

  drawShopBaseProps(x, 0, w, door.x, occupied);
  drawHouseBase(x, 0, w, occupied);
}

function drawSideShop({ w, wallH, roofH }) {
  w *= random(1.04, 1.18);
  wallH *= random(0.88, 1.02);
  const frontW = w * random(0.57, 0.68);
  const sideW = w - frontW;
  const x = -w / 2;
  const y = -wallH;
  const occupied = [];
  const drop = random(18, 28);
  const peak = makePeak(x, y, frontW, roofH);
  const backPeak = { x: peak.x + sideW, y: peak.y + drop };
  const frontRight = { x: x + frontW + random(16, 22), y: y + random(7, 11) };
  const sideRight = { x: x + frontW + sideW + random(14, 20), y: y + drop + random(7, 11) };

  if (random() < 0.82) {
    const chimneyW = random(17, 23);
    const chimneyH = random(58, 78);
    const chimney = makeRect(
      x + frontW + sideW * random(0.55, 0.76),
      y + drop - chimneyH + random(3, 12),
      chimneyW,
      chimneyH,
      "chimney",
    );

    if (canPlace(chimney, occupied, 8)) {
      drawReferenceChimney(chimney.x, chimney.y, chimney.w, chimney.h);
      occupy(occupied, chimney);
    }
  }

  drawPerspectiveShell(x, y, frontW, sideW, wallH, drop);
  drawFacadeTexture(x, y, frontW, wallH, random(["quiet", "siding"]));
  drawSidePlaneTexture(x + frontW, y + drop, sideW, wallH, drop);
  drawPerspectiveRoofPlane(
    { x: x - random(18, 24), y: y + random(7, 11) },
    peak,
    frontRight,
    backPeak,
    sideRight,
  );

  const sign = firstSafeRect(
    [
      makeRect(x + frontW * random(0.18, 0.25), y + wallH * random(0.27, 0.33), frontW * random(0.54, 0.66), random(24, 33), "sign"),
      makeRect(x + frontW * random(0.12, 0.2), y + wallH * random(0.22, 0.3), frontW * random(0.58, 0.7), random(23, 31), "sign"),
    ],
    occupied,
    8,
    (rect) => rectInFacade(rect, x, y, frontW, wallH),
  );

  if (sign) {
    drawRamenSign(sign.x, sign.y, sign.w, sign.h);
    occupy(occupied, sign);
  } else {
    drawFallbackFacadeMarks(x, y, frontW, wallH);
  }

  const doorH = random(60, 74);
  const doorW = random(27, 35);
  const door = occupy(occupied, firstSafeRect(
    [
      makeRect(x + frontW * random(0.5, 0.64), -doorH, doorW, doorH, "door"),
      makeRect(x + frontW * random(0.34, 0.46), -doorH, doorW, doorH, "door"),
      makeRect(x + frontW * random(0.66, 0.74), -doorH, doorW, doorH, "door"),
    ],
    occupied,
    8,
    (rect) => rectInFacade(rect, x, y, frontW, wallH),
  ) || makeRect(x + frontW * 0.56, -doorH, doorW, doorH, "door"));
  drawReferenceDoor(
    door.x,
    door.y,
    door.w,
    door.h,
    true,
  );

  let awning = null;

  if (sign && random() < 0.82) {
    const candidate = makeRect(
      sign.x - random(3, 7),
      sign.y + sign.h + random(6, 11),
      sign.w + random(6, 16),
      random(13, 20),
      "awning",
    );

    if (canPlace(candidate, occupied, 3)) {
      awning = occupy(occupied, candidate);
      drawShopAwning(awning.x, awning.y, awning.w, awning.h);
    }
  }

  const displayY = max(y + wallH * 0.52, sign ? sign.y + sign.h + (awning ? awning.h + 16 : 12) : y + wallH * 0.43);
  const displayCandidates = [
    makeRect(x + frontW * 0.12, displayY, random(31, 43), random(30, 40), "display"),
    makeRect(x + frontW * 0.7, displayY + random(-2, 5), random(24, 34), random(28, 37), "display"),
    makeRect(x + frontW * 0.25, displayY + random(4, 10), random(28, 38), random(28, 37), "display"),
  ];
  const display = firstSafeRect(displayCandidates, occupied, 7, (rect) => rectInFacade(rect, x, y, frontW, wallH));
  if (display) {
    drawStorefrontDisplay(display.x, display.y, display.w, display.h);
    occupy(occupied, display);
  } else {
    drawBaseFallbackDetail(x, 0, frontW, occupied);
  }

  if (random() < 0.62) {
    const noren = makeRect(
      door.x - random(1, 5),
      door.y - random(4, 8),
      min(random(34, 46), frontW - 12),
      random(18, 28),
      "noren",
    );

    if (rectInFacade(noren, x, y, frontW, wallH, 2) && canPlace(noren, occupied, 3, ["door"])) {
      drawNoren(noren.x, noren.y, noren.w, noren.h);
      occupy(occupied, noren);
    }
  }

  drawShopBaseProps(x, 0, w, door.x, occupied);
  drawHouseBase(x, 0, w, occupied);
}

function drawPlainCottage({ w, wallH, roofH }) {
  w *= random(0.94, 1.08);
  const x = -w / 2;
  const y = -wallH;
  const occupied = [];
  const peak = makePeak(x, y, w, roofH * random(0.9, 1.12));
  const eave = random(18, 25);
  const leftRoof = { x: x - eave, y: y + random(6, 10) };
  const rightRoof = { x: x + w + eave, y: y + random(6, 10) };

  if (random() < 0.68) {
    const chimneyW = random(16, 22);
    const chimneyH = random(54, 76);
    const chimney = makeRect(
      x + w * random(0.7, 0.86),
      y - chimneyH + random(2, 10),
      chimneyW,
      chimneyH,
      "chimney",
    );

    drawReferenceChimney(chimney.x, chimney.y, chimney.w, chimney.h);
    occupy(occupied, chimney);
  }

  drawFacadeShell(x, y, w, wallH);
  drawFacadeTexture(x, y, w, wallH, random(["quiet", "siding", "stucco"]));
  drawGableRoofPlane(peak, leftRoof, rightRoof, random(["tile", "tile", "hatch"]));

  const doorH = random(58, 72);
  const doorW = random(26, 34);
  const door = occupy(occupied, firstSafeRect(
    [
      makeRect(x + w * random(0.44, 0.61), -doorH, doorW, doorH, "door"),
      makeRect(x + w * random(0.62, 0.72), -doorH, doorW, doorH, "door"),
      makeRect(x + w * random(0.28, 0.4), -doorH, doorW, doorH, "door"),
    ],
    occupied,
    8,
    (rect) => rectInFacade(rect, x, y, w, wallH),
  ) || makeRect(x + w * 0.52, -doorH, doorW, doorH, "door"));
  drawReferenceDoor(door.x, door.y, door.w, door.h, true);

  let placedWindows = 0;
  const leftWindow = firstSafeRect(
    [
      makeRect(x + w * random(0.12, 0.25), y + wallH * random(0.43, 0.56), random(22, 31), random(29, 39), "window"),
      makeRect(x + w * random(0.67, 0.78), y + wallH * random(0.44, 0.58), random(20, 29), random(26, 37), "window"),
    ],
    occupied,
    8,
    (rect) => rectInFacade(rect, x, y, w, wallH),
  );

  if (leftWindow) {
    drawReferenceWindow(leftWindow.x, leftWindow.y, leftWindow.w, leftWindow.h, random() < 0.25);
    occupy(occupied, leftWindow);
    placedWindows++;
  }

  if (random() < 0.58) {
    const secondWindow = firstSafeRect(
      [
        makeRect(x + w * random(0.66, 0.8), y + wallH * random(0.46, 0.59), random(18, 29), random(25, 37), "window"),
        makeRect(x + w * random(0.12, 0.26), y + wallH * random(0.5, 0.62), random(18, 26), random(24, 34), "window"),
      ],
      occupied,
      8,
      (rect) => rectInFacade(rect, x, y, w, wallH),
    );

    if (secondWindow) {
      drawReferenceWindow(secondWindow.x, secondWindow.y, secondWindow.w, secondWindow.h, random() < 0.2);
      occupy(occupied, secondWindow);
      placedWindows++;
    }
  }

  if (placedWindows === 0) {
    drawFallbackFacadeMarks(x, y, w, wallH);
  }

  if (random() < 0.72) {
    const shed = drawAttachedLeanTo(x, y, w, wallH, random([-1, 1]), occupied);

    if (!shed) {
      drawBaseFallbackDetail(x, 0, w, occupied);
    }
  }

  drawHouseBase(x, 0, w, occupied);
}

function drawNarrowCabin({ w, wallH, roofH }) {
  w *= random(0.73, 0.86);
  wallH *= random(1.02, 1.18);
  const x = -w / 2;
  const y = -wallH;
  const occupied = [];
  const peak = makePeak(x, y, w, roofH * random(1.05, 1.22));
  const eave = random(18, 24);
  const lean = random(-16, 16);
  const leftRoof = { x: x - eave, y: y + random(6, 10) };
  const rightRoof = { x: x + w + eave + lean, y: y + random(8, 12) };

  if (random() < 0.58) {
    const chimneyW = random(15, 21);
    const chimneyH = random(50, 70);
    const chimney = makeRect(
      x + w * random(0.68, 0.84),
      y - chimneyH + random(2, 10),
      chimneyW,
      chimneyH,
      "chimney",
    );

    drawReferenceChimney(chimney.x, chimney.y, chimney.w, chimney.h);
    occupy(occupied, chimney);
  }

  drawFacadeShell(x, y, w, wallH);
  drawFacadeTexture(x, y, w, wallH, random(["siding", "quiet"]));
  drawGableRoofPlane(peak, leftRoof, rightRoof, random(["hatch", "tile"]));

  const doorH = random(60, 76);
  const doorW = random(25, 33);
  const door = occupy(occupied, firstSafeRect(
    [
      makeRect(x + w * random(0.49, 0.62), -doorH, doorW, doorH, "door"),
      makeRect(x + w * random(0.36, 0.48), -doorH, doorW, doorH, "door"),
      makeRect(x + w * random(0.63, 0.72), -doorH, doorW, doorH, "door"),
    ],
    occupied,
    8,
    (rect) => rectInFacade(rect, x, y, w, wallH),
  ) || makeRect(x + w * 0.54, -doorH, doorW, doorH, "door"));
  drawReferenceDoor(door.x, door.y, door.w, door.h, true);

  const windowRect = firstSafeRect(
    [
      makeRect(x + w * random(0.13, 0.28), y + wallH * random(0.5, 0.6), random(20, 27), random(27, 36), "window"),
      makeRect(x + w * random(0.66, 0.78), y + wallH * random(0.42, 0.54), random(18, 25), random(24, 34), "window"),
    ],
    occupied,
    8,
    (rect) => rectInFacade(rect, x, y, w, wallH),
  );

  if (windowRect) {
    drawReferenceWindow(windowRect.x, windowRect.y, windowRect.w, windowRect.h, false);
    occupy(occupied, windowRect);
  } else {
    drawFallbackFacadeMarks(x, y, w, wallH, 7);
  }

  if (random() < 0.62) {
    const shed = drawAttachedLeanTo(x, y, w, wallH, random([-1, 1]), occupied);

    if (!shed) {
      drawBaseFallbackDetail(x, 0, w, occupied);
    }
  }

  drawHouseBase(x, 0, w, occupied);
}

function makePeak(x, y, w, roofH) {
  return {
    x: x + w * random(0.46, 0.54),
    y: y - roofH,
  };
}

function drawFacadeShell(x, y, w, h) {
  strokeWeight(2.35);
  sketchLine(x, y + 5, x, y + h, 0.72);
  sketchLine(x + w, y + 5, x + w, y + h, 0.72);
  sketchLine(x, y + h, x + w, y + h + random(-0.8, 0.8), 0.72);
  strokeWeight(2.1);
}

function drawPerspectiveShell(x, y, frontW, sideW, h, drop) {
  drawFacadeShell(x, y, frontW, h);

  strokeWeight(1.85);
  sketchLine(x + frontW, y + drop, x + frontW + sideW, y + drop + random(-1, 1), 0.62);
  sketchLine(x + frontW + sideW, y + drop, x + frontW + sideW, y + h + drop * 0.34, 0.62);
  sketchLine(x + frontW, y + h, x + frontW + sideW, y + h + drop * 0.34, 0.62);
  strokeWeight(2.1);
}

function drawGableRoofPlane(peak, left, right, texture) {
  strokeWeight(2.9);
  sketchLine(left.x, left.y, peak.x, peak.y, 0.82);
  sketchLine(peak.x, peak.y, right.x, right.y, 0.82);
  sketchLine(left.x + random(3, 8), left.y + random(3, 7), peak.x + random(-3, 3), peak.y + random(2, 6), 0.38);
  sketchLine(peak.x + random(-3, 3), peak.y + random(2, 6), right.x - random(3, 8), right.y + random(3, 7), 0.38);

  strokeWeight(1.8);
  sketchLine(left.x + 11, left.y + 11, peak.x, peak.y + 15, 0.48);
  sketchLine(peak.x, peak.y + 15, right.x - 11, right.y + 11, 0.48);

  if (texture === "tile") {
    drawGableTiles(peak, left, right);
  } else {
    drawRoofHatching(peak, left, right);
  }

  drawRoofEdgeFringe(peak, left, right);
  strokeWeight(2.1);
}

function drawPerspectiveRoofPlane(left, peak, frontRight, backPeak, sideRight) {
  strokeWeight(2.9);
  sketchLine(left.x, left.y, peak.x, peak.y, 0.82);
  sketchLine(peak.x, peak.y, frontRight.x, frontRight.y, 0.82);
  sketchLine(peak.x, peak.y, backPeak.x, backPeak.y, 0.68);
  sketchLine(frontRight.x, frontRight.y, sideRight.x, sideRight.y, 0.68);
  sketchLine(backPeak.x, backPeak.y, sideRight.x, sideRight.y, 0.68);

  strokeWeight(1.6);
  drawGableTiles(peak, left, frontRight, 7);
  drawRoofEdgeFringe(peak, left, frontRight, 0.6);

  for (let i = 0; i < 8; i++) {
    const t = (i + 0.4) / 8;
    const a = pointBetween(peak, backPeak, t);
    quietDash(a.x + random(-2, 2), a.y + random(8, 24), random(8, 16), HALF_PI + random(-0.16, 0.16));
  }

  strokeWeight(2.1);
}

function drawGableTiles(peak, left, right, rows = 9) {
  strokeWeight(1.42);

  for (let row = 1; row <= rows; row++) {
    const t = row / (rows + 0.8);
    const a = pointBetween(peak, left, t);
    const b = pointBetween(peak, right, t);
    const rowInset = map(t, 0, 1, 2, 9);

    brokenLine(a.x + rowInset, a.y + random(0, 2), b.x - rowInset, b.y + random(-1, 1), random(0.72, 0.94), 10);

    const tiles = floor(map(abs(b.x - a.x), 25, 250, 3, 14, true));
    for (let i = 0; i < tiles; i++) {
      if (random() < 0.22) continue;
      const u = (i + 0.5) / tiles;
      const p = pointBetween(a, b, u);
      quietDash(p.x, p.y - 3, random(4.5, 8), HALF_PI + random(-0.08, 0.08));
    }
  }
}

function drawRoofHatching(peak, left, right) {
  strokeWeight(1.38);

  for (let i = 0; i < 34; i++) {
    const t = random(0.22, 0.95);
    const a = pointBetween(peak, left, t);
    const b = pointBetween(peak, right, t);
    const p = pointBetween(a, b, random(0.12, 0.88));

    quietDash(p.x, p.y, random(6, 15), random(PI * 0.42, PI * 0.62));
  }
}

function drawRoofEdgeFringe(peak, left, right, density = 1) {
  strokeWeight(1.28);

  const marks = floor(12 * density);
  for (let i = 0; i < marks; i++) {
    const side = random() < 0.5 ? left : right;
    const p = pointBetween(peak, side, random(0.42, 0.94));
    quietDash(p.x + random(-1, 1), p.y + random(5, 10), random(6, 14), HALF_PI + random(-0.18, 0.18));
  }
}

function drawRamenSign(x, y, w, h) {
  strokeWeight(1.95);
  drawRectSketch(x, y, w, h);

  const glyphCount = floor(random(4, 7));
  for (let i = 0; i < glyphCount; i++) {
    const gx = x + w * map(i + 0.5, 0, glyphCount, 0.14, 0.86);
    const gy = y + h * random(0.48, 0.6);
    drawExpressiveGlyph(gx, gy, h * random(0.5, 0.68));
  }

  strokeWeight(2.1);
}

function drawStorefrontDisplay(x, y, w, h) {
  strokeWeight(1.95);
  drawRectSketch(x, y, w, h);

  strokeWeight(1.15);
  for (let i = 0; i < 8; i++) {
    if (random() < 0.8) {
      quietDash(x + 5 + i * ((w - 10) / 8), y + 5, h - 10, HALF_PI + random(-0.08, 0.08));
    }
  }

  for (let i = 0; i < 4; i++) {
    quietDash(x + 6, y + 8 + i * ((h - 14) / 4), w - 12, random(-0.05, 0.05));
  }

  strokeWeight(1.28);
  quietDash(x - 5, y + h + 5, w + 10, random(-0.04, 0.04));
  strokeWeight(2.1);
}

function drawShopAwning(x, y, w, h) {
  strokeWeight(1.9);
  drawRectSketch(x, y, w, h);

  strokeWeight(1.2);
  const panels = floor(random(5, 8));
  for (let i = 1; i < panels; i++) {
    const px = x + i * (w / panels);
    sketchLine(px, y + 3, px + random(-2, 2), y + h - 3, 0.28);
  }

  quietDash(x - 4, y + h + 4, w + 8, random(-0.04, 0.04));
  strokeWeight(2.1);
}

function drawNoren(x, y, w, h) {
  strokeWeight(1.55);
  const panels = floor(random(3, 5));
  sketchLine(x, y, x + w, y, 0.36);

  for (let i = 0; i < panels; i++) {
    const panelX = x + i * (w / panels);
    drawRectSketch(panelX, y, w / panels + random(-1, 1), h + random(-2, 2));
    if (random() < 0.76) {
      quietDash(panelX + w / panels * 0.34, y + h * 0.52, w / panels * 0.35, 0);
    }
  }

  strokeWeight(2.1);
}

function drawShopBaseProps(x, baseY, w, doorX, occupied = []) {
  if (random() < 0.68) {
    const bench = makeRect(x + w * random(0.1, 0.28), baseY + random(2, 9), random(34, 46), 24, "bench");
    if (canPlace(bench, occupied, 6)) {
      drawLittleBench(bench.x, bench.y + 8, bench.w);
      occupy(occupied, bench);
    }
  }

  if (random() < 0.66) {
    const pot = makeRect(x + w * random(0.78, 0.95), baseY - random(18, 24), 20, 25, "pot");
    if (canPlace(pot, occupied, 4)) {
      drawSmallPot(pot.x, baseY - random(1, 5));
      occupy(occupied, pot);
    }
  }

  if (random() < 0.46) {
    const crate = makeRect(doorX + random(24, 42), baseY - random(19, 25), 32, 30, "crate");
    if (canPlace(crate, occupied, 4)) {
      drawSmallCrateStack(crate.x, baseY + random(7, 14));
      occupy(occupied, crate);
    }
  }
}

function drawFallbackFacadeMarks(x, y, w, h, count = 10) {
  strokeWeight(1.06);

  for (let i = 0; i < count; i++) {
    const cluster = random() < 0.55 ? random(0.16, 0.38) : random(0.6, 0.84);
    const xx = x + w * cluster + random(-7, 7);
    const yy = y + h * random(0.32, 0.78);

    quietDash(xx, yy, random(4, 10), random(-0.08, 0.08));
  }

  strokeWeight(2.1);
}

function drawBaseFallbackDetail(x, baseY, w, occupied = []) {
  const details = [
    {
      rect: makeRect(x + w * random(0.08, 0.22), baseY + 3, random(34, 48), 20, "fence"),
      draw: (box) => drawLowFenceDetail(box.x, baseY + 3, box.w),
    },
    {
      rect: makeRect(x + w * random(0.76, 0.92), baseY - 22, 19, 26, "pot"),
      draw: (box) => drawSmallPot(box.x, baseY - 1),
    },
    {
      rect: makeRect(x + w * random(0.13, 0.28), baseY - 16, 31, 28, "crate"),
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

  drawSketchShrub(x + w * random(0.08, 0.92), baseY + 3, random(14, 22));
  return false;
}

function drawLowFenceDetail(x, y, w) {
  strokeWeight(1.25);
  quietDash(x, y, w, random(-0.04, 0.04));
  quietDash(x + 3, y + 8, w - 6, random(-0.04, 0.04));

  const posts = floor(random(3, 5));
  for (let i = 0; i < posts; i++) {
    const px = x + 4 + i * ((w - 8) / max(1, posts - 1));
    sketchLine(px, y - 5, px + random(-1, 1), y + 12, 0.14);
  }

  strokeWeight(2.1);
}

function drawExpressiveGlyph(x, y, size) {
  strokeWeight(random(2.0, 2.7));

  const mark = floor(random(4));
  if (mark === 0) {
    quietDash(x - size * 0.28, y - size * 0.22, size * 0.58, random(-0.08, 0.08));
    quietDash(x - size * 0.18, y + size * 0.04, size * 0.48, random(-0.08, 0.08));
    quietDash(x + size * 0.1, y - size * 0.28, size * 0.62, HALF_PI + random(-0.1, 0.1));
  } else if (mark === 1) {
    quietDash(x - size * 0.26, y - size * 0.24, size * 0.52, 0);
    quietDash(x + size * 0.18, y - size * 0.23, size * 0.62, HALF_PI + random(-0.08, 0.08));
    quietDash(x - size * 0.1, y + size * 0.1, size * 0.52, random(-0.12, 0.12));
  } else if (mark === 2) {
    sketchLine(x - size * 0.28, y - size * 0.18, x + size * 0.2, y + size * 0.22, 0.32);
    sketchLine(x + size * 0.22, y - size * 0.22, x - size * 0.18, y + size * 0.24, 0.32);
    inkDot(x + size * 0.34, y - size * 0.18, random(2.4, 3.2));
  } else {
    quietDash(x - size * 0.2, y - size * 0.28, size * 0.46, HALF_PI + random(-0.12, 0.12));
    quietDash(x - size * 0.28, y + size * 0.02, size * 0.62, random(-0.1, 0.1));
    quietDash(x + size * 0.2, y - size * 0.18, size * 0.5, HALF_PI + random(-0.12, 0.12));
  }

  strokeWeight(2.1);
}

function drawReferenceDoor(x, y, w, h, dark) {
  strokeWeight(2.05);
  drawRectSketch(x, y, w, h);

  if (dark) {
    strokeWeight(1.4);
    for (let i = 0; i < 12; i++) {
      const xx = x + 5 + i * ((w - 10) / 12);
      sketchLine(xx, y + 5, xx + random(-0.8, 0.8), y + h - 5, 0.34);
    }
  } else if (random() < 0.72) {
    drawRectSketch(x + 6, y + 8, w - 12, h - 16);
  }

  strokeWeight(1.4);
  quietDash(x - 5, y + h + 5, w + 10, random(-0.04, 0.04));
  quietDash(x - 1, y + h + 10, w + 3, random(-0.04, 0.04));

  inkDot(x + w - 7, y + h * 0.52, 3.2);
  strokeWeight(2.1);
}

function drawReferenceWindow(x, y, w, h, dark) {
  strokeWeight(1.95);
  drawRectSketch(x, y, w, h);

  if (dark) {
    strokeWeight(1.12);
    for (let i = 0; i < 8; i++) {
      quietDash(x + 4 + i * ((w - 8) / 8), y + 5, h - 10, HALF_PI + random(-0.08, 0.08));
    }
  }

  strokeWeight(1.45);
  sketchLine(x + w / 2, y + 4, x + w / 2 + random(-0.5, 0.5), y + h - 4, 0.42);
  sketchLine(x + 4, y + h / 2, x + w - 4, y + h / 2 + random(-0.5, 0.5), 0.42);

  strokeWeight(1.28);
  quietDash(x - 4, y + h + 5, w + 8, random(-0.04, 0.04));
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

  strokeWeight(1.85);
  drawRectOpenTop(shed.x, shed.y, shed.w, shed.h);

  // Lean-to roofs tuck high under the main eave and fall away from the house.
  const roofAttachY = shed.y - shed.roofLift + random(-1, 2);
  const roofOuterY = shed.y + random(5, 10);
  sketchLine(shed.innerX, roofAttachY, shed.outerX, roofOuterY, 0.55);
  sketchLine(shed.innerX, roofAttachY + random(11, 16), shed.outerX, roofOuterY + random(11, 16), 0.34);

  strokeWeight(1.05);
  for (let i = 0; i < 6; i++) {
    const yy = shed.y + 14 + i * ((shed.h - 20) / 6);
    brokenLine(shed.x + 6, yy, shed.x + shed.w - 7, yy + random(-1, 1), 0.5, 6);
  }

  if (random() < 0.5) {
    const windowRect = makeRect(
      shed.x + shed.w * random(0.28, 0.5),
      shed.y + shed.h * random(0.36, 0.52),
      random(15, 22),
      random(19, 28),
      "shed-window",
    );
    drawReferenceWindow(windowRect.x, windowRect.y, windowRect.w, windowRect.h, random() < 0.2);
  }

  occupy(occupied, safe);
  strokeWeight(2.1);
  return safe;
}

function makeLeanToCandidate(x, y, w, h, side) {
  const shedW = random(48, 70);
  const shedH = h * random(0.44, 0.58);
  const baseY = y + h + random(-1.5, 1.5);
  const tuck = random(7, 13);
  const shedX = side < 0 ? x - shedW + tuck : x + w - tuck;
  const shedY = baseY - shedH;
  const roofLift = random(16, 25);
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
    bounds: makeRect(left, shedY - roofLift - 4, right - left, shedH + roofLift + 8, "shed"),
  };
}

function drawTinyVent(x, y) {
  strokeWeight(1.35);
  inkDot(x - 5, y, 1.7);
  inkDot(x + 1, y + 1, 1.35);
  inkDot(x + 7, y + 2, 1.15);
  strokeWeight(2.1);
}

function drawFacadeTexture(x, y, w, h, mode) {
  if (mode === "siding") {
    strokeWeight(1.18);
    for (let i = 0; i < 8; i++) {
      const yy = y + h * 0.22 + i * ((h * 0.6) / 8);
      brokenLine(x + 9, yy, x + w - 9, yy + random(-1, 1), 0.55, 8);
    }
  }

  if (mode === "quiet") {
    strokeWeight(1.05);
    for (let i = 0; i < 18; i++) {
      if (random() < 0.72) {
        quietDash(random(x + 10, x + w - 10), random(y + 20, y + h - 12), random(3, 9), random(-0.08, 0.08));
      } else {
        inkDot(random(x + 10, x + w - 10), random(y + 20, y + h - 12), random(0.9, 1.7));
      }
    }
  }

  if (mode === "stucco") {
    for (let i = 0; i < 34; i++) {
      inkDot(random(x + 10, x + w - 10), random(y + 18, y + h - 12), random(0.75, 1.55));
    }
  }

  strokeWeight(1.18);
  for (let i = 0; i < 5; i++) {
    const yy = y + 18 + i * random(17, 25);
    quietDash(x - 4, yy, random(8, 14), 0);
    quietDash(x + w - random(8, 12), yy + random(-1, 1), random(8, 14), 0);
  }

  strokeWeight(2.1);
}

function drawSidePlaneTexture(x, y, w, h, drop) {
  strokeWeight(1.12);

  for (let i = 0; i < 8; i++) {
    const yy = y + 15 + i * ((h - 24) / 8);
    brokenLine(x + 6, yy, x + w - 8, yy + drop * 0.18 + random(-1, 1), 0.56, 7);
  }

  strokeWeight(2.1);
}

function drawReferenceChimney(x, y, w, h) {
  strokeWeight(1.9);
  drawRectSketch(x, y, w, h);
  sketchLine(x - 4, y, x + w + 4, y, 0.5);

  strokeWeight(1.05);
  for (let i = 0; i < 7; i++) {
    quietDash(x + 4, y + 8 + i * ((h - 14) / 7), w - 8, 0);
  }

  if (random() < 0.58) {
    strokeWeight(1.1);
    sketchLine(x + w * 0.5, y - 9, x + w * 0.5 + random(-4, 5), y - random(17, 28), 0.18);
  }

  strokeWeight(2.1);
}

function drawHouseBase(x, baseY, w, occupied = []) {
  strokeWeight(1.35);
  sketchLine(x - 13, baseY + 1, x + w + 13, baseY + random(-0.8, 0.8), 0.42);

  const protectedBaseRects = occupied.filter((rect) => rect.name === "door");
  const shrubs = floor(random(7, 11));
  for (let i = 0; i < shrubs; i++) {
    const sideBias = i < shrubs * 0.46 ? random(-16, 20) : random(w - 20, w + 16);
    const centerBias = random() < 0.18 ? random(w * 0.18, w * 0.82) : sideBias;
    const size = random(13, 28);
    const shrubX = x + centerBias;
    const shrubRect = makeRect(shrubX - size * 0.72, baseY - size * 0.72, size * 1.44, size * 0.98, "shrub");

    if (canPlace(shrubRect, protectedBaseRects, -3)) {
      drawSketchShrub(shrubX, baseY + random(-2, 6), size);
    }
  }

  for (let i = 0; i < 22; i++) {
    const gx = randomGaussian(x + w * 0.5, w * 0.32);
    const gy = randomGaussian(baseY + 25, 12);

    if (gy > baseY - 2 && gy < baseY + 52) {
      terrainMark(gx, gy, random(3, 12));
    }
  }

  if (random() < 0.28) {
    const bench = makeRect(x + w * random(0.14, 0.32), baseY + random(10, 18), random(33, 45), 22, "bench");

    if (canPlace(bench, occupied, 5)) {
      drawLittleBench(bench.x, bench.y, bench.w);
    }
  }

  strokeWeight(2.1);
}

function drawSketchShrub(x, y, size) {
  strokeWeight(random(1.25, 1.8));
  const branches = floor(random(8, 15));

  for (let i = 0; i < branches; i++) {
    const a = random(PI * 1.02, TWO_PI - 0.08);
    const len = random(size * 0.25, size);
    sketchLine(x, y, x + cos(a) * len, y + sin(a) * len, 0.26);
  }

  for (let i = 0; i < 8; i++) {
    if (random() < 0.62) {
      inkDot(x + random(-size * 0.7, size * 0.7), y - random(3, size * 0.62), random(0.9, 1.8));
    }
  }

  strokeWeight(2.1);
}

function drawLittleBench(x, y, forcedW = null) {
  strokeWeight(1.35);
  const benchW = forcedW || random(33, 45);
  quietDash(x, y, benchW, random(-0.04, 0.04));
  quietDash(x + 3, y + 8, benchW * random(0.76, 0.9), random(-0.04, 0.04));
  sketchLine(x + 7, y + 8, x + 4, y + 20, 0.16);
  sketchLine(x + benchW - 8, y + 8, x + benchW - 5, y + 20, 0.16);
  strokeWeight(2.1);
}

function drawSmallPot(x, y) {
  const potW = random(11, 17);
  const potH = random(9, 14);

  strokeWeight(1.35);
  drawRectSketch(x, y - potH, potW, potH);

  for (let i = 0; i < floor(random(4, 7)); i++) {
    sketchLine(x + potW / 2, y - potH, x + potW / 2 + random(-10, 10), y - potH - random(8, 19), 0.2);
  }

  strokeWeight(2.1);
}

function drawSmallCrateStack(x, y) {
  strokeWeight(1.25);
  const w = random(14, 20);
  const h = random(10, 14);

  drawRectSketch(x, y - h, w, h);
  quietDash(x + 3, y - h * 0.5, w - 6, 0);

  if (random() < 0.55) {
    drawRectSketch(x + random(8, 14), y - h - random(8, 12), w * random(0.72, 0.9), h * random(0.72, 0.9));
  }

  strokeWeight(2.1);
}

function pointBetween(a, b, t) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}
