# Tiny House Generator

A small procedural drawing experiment built with p5.js.

The generator creates tiny hand-drawn cottages in blue ink on a warm paper-like background, with randomized architectural details, roof forms, windows, doors, side volumes, shrubs, and ground marks.

This project is currently a beta/prototype. The goal is to explore a quiet illustrated system that can generate many variations within a consistent visual language.

## Features

- Procedural tiny cottage generation
- Randomized seeds for repeatable variations
- Hand-drawn blue-line style
- Paper texture and subtle ink specks
- Front-facing and perspective cottage variants
- Randomized windows, doors, roof details, side rooms, chimneys, shrubs, and terrain marks
- PNG export support
- Batch export support

## Controls

Press `space` to generate a new house.

Press `S` to save the current image as a PNG.

Press `F` to choose an export folder.

Press `B` to export a batch of images.

Press `D` to toggle debug layout boxes.

## Running Locally

This project uses p5.js and should be run through a local server rather than opening `index.html` directly.

One easy option is the Live Server extension in VS Code:

1. Open the project folder in VS Code.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html`.
4. Choose **Open with Live Server**.

## Project Structure

```text
tiny-house-generator/
├── index.html
├── sketch.js
├── houses.js
├── drawing-utils.js
├── styles.css
└── README.md
