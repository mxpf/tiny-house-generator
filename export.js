async function chooseExportFolder() {
  if (!window.showDirectoryPicker) {
    alert(
      "Your browser does not support folder saving. Use Chrome or Edge, or turn off 'Ask where to save each file' in your browser download settings.",
    );
    return;
  }

  try {
    exportFolderHandle = await window.showDirectoryPicker({
      mode: "readwrite",
    });

    console.log("Export folder selected.");
  } catch (error) {
    console.log("Folder selection cancelled.");
  }
}

async function saveSinglePNG() {
  if (exportFolderHandle) {
    await saveCurrentCanvasToFolder("tiny-house-seed-" + seed + ".png");
    return;
  }

  saveCanvas("tiny-house-" + seed, "png");
}

async function saveBatchToFolder(total = 10) {
  if (!exportFolderHandle) {
    await chooseExportFolder();
  }

  if (!exportFolderHandle) {
    return;
  }

  for (let i = 0; i < total; i++) {
    seed = floor(random(999999));
    redraw();

    await wait(150);

    let padded = String(i + 1).padStart(2, "0");
    let filename = "tiny-house-batch-" + padded + "-seed-" + seed + ".png";

    await saveCurrentCanvasToFolder(filename);
  }

  console.log("Saved " + total + " PNGs.");
}

async function saveCurrentCanvasToFolder(filename) {
  let canvas = document.querySelector("canvas");

  let blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });

  let fileHandle = await exportFolderHandle.getFileHandle(filename, {
    create: true,
  });

  let writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();

  console.log("Saved:", filename);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
