// ============================================================
// Image Decoding Speed Test for Bruce
// Tests display.drawXBitmap() performance for different sizes.
// Also compares with pixel-by-pixel drawing.
// ============================================================

var display = require("display");
var keyboard = require("keyboard");

// ----- Colors -----
var COL_BLACK = display.color(0, 0, 0);
var COL_WHITE = display.color(255, 255, 255);
var COL_GREY  = display.color(127, 127, 127);
var COL_GREEN = display.color(0, 255, 0);
var COL_CYAN  = display.color(0, 255, 255);
var COL_YELLOW = display.color(255, 255, 0);
var COL_RED   = display.color(255, 0, 0);

var W = display.width();
var H = display.height();

// ----- Helper: generate XBM data (monochrome, 1 bit per pixel) -----
function generateXBM(width, height, pattern) {
    // pattern: 0 = solid black, 1 = checkerboard, 2 = stripes
    var bytesPerRow = (width + 7) >> 3;
    var totalBytes = bytesPerRow * height;
    var data = new Uint8Array(totalBytes);
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var byteIndex = y * bytesPerRow + (x >> 3);
            var bitIndex = x & 7;
            var bit = 0;
            if (pattern === 0) {
                bit = 1; // solid white (if color is set to white, we want bits=1 for white)
            } else if (pattern === 1) {
                bit = ((x + y) & 1) ? 1 : 0; // checkerboard
            } else if (pattern === 2) {
                bit = (x & 1) ? 1 : 0; // vertical stripes
            }
            if (bit) {
                data[byteIndex] |= (1 << (7 - bitIndex)); // XBM uses MSB first
            }
        }
    }
    return data;
}

// ----- Test function -----
function testXBM(width, height, pattern, iterations) {
    var data = generateXBM(width, height, pattern);
    var totalPixels = width * height;
    var start = Date.now();
    for (var i = 0; i < iterations; i++) {
        // Draw at a position that fits
        var x = (W - width) / 2;
        var y = (H - height) / 2;
        display.drawXBitmap(x, y, data, width, height, COL_WHITE);
    }
    var elapsed = Date.now() - start;
    // Return pixels per second
    var pixelsPerSec = (totalPixels * iterations) / (elapsed / 1000);
    return {
        elapsed: elapsed,
        pixelsPerSec: pixelsPerSec,
        totalPixels: totalPixels * iterations
    };
}

// ----- Pixel-by-pixel drawing for comparison -----
function testPixelDraw(width, height, pattern, iterations) {
    var totalPixels = width * height;
    var start = Date.now();
    for (var i = 0; i < iterations; i++) {
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var bit = 0;
                if (pattern === 0) bit = 1;
                else if (pattern === 1) bit = ((x + y) & 1) ? 1 : 0;
                else if (pattern === 2) bit = (x & 1) ? 1 : 0;
                var color = bit ? COL_WHITE : COL_BLACK;
                // Use drawFillRect for each pixel (not efficient)
                display.drawFillRect(x, y, 1, 1, color);
            }
        }
    }
    var elapsed = Date.now() - start;
    var pixelsPerSec = (totalPixels * iterations) / (elapsed / 1000);
    return {
        elapsed: elapsed,
        pixelsPerSec: pixelsPerSec,
        totalPixels: totalPixels * iterations
    };
}

// ----- Run tests -----
function runTests() {
    var sizes = [
        { width: 32, height: 32 },
        { width: 64, height: 64 },
        { width: 128, height: 128 },
        { width: 160, height: 128 } // full screen for many devices
    ];
    var pattern = 1; // checkerboard
    var iterations = 10; // enough to measure

    var results = [];

    // XBM test
    display.drawFillRect(0, 0, W, H, COL_BLACK);
    display.setTextAlign("center", "middle");
    display.setTextColor(COL_CYAN);
    display.drawText("Testing XBM decoding...", W/2, H/2 - 10);
    display.setTextColor(COL_GREY);
    display.drawText("Please wait", W/2, H/2 + 10);
    delay(10);

    for (var i = 0; i < sizes.length; i++) {
        var size = sizes[i];
        var result = testXBM(size.width, size.height, pattern, iterations);
        results.push({
            name: "XBM " + size.width + "x" + size.height,
            elapsed: result.elapsed,
            pixelsPerSec: result.pixelsPerSec,
            totalPixels: result.totalPixels
        });
    }

    // Pixel-by-pixel test (only for small size to avoid long time)
    var smallSize = { width: 32, height: 32 };
    var pixelResult = testPixelDraw(smallSize.width, smallSize.height, pattern, 1);
    results.push({
        name: "Pixel draw 32x32",
        elapsed: pixelResult.elapsed,
        pixelsPerSec: pixelResult.pixelsPerSec,
        totalPixels: pixelResult.totalPixels
    });

    return results;
}

// ----- Display results -----
function displayResults(results) {
    display.drawFillRect(0, 0, W, H, COL_BLACK);
    display.setTextAlign("left", "top");
    display.setTextSize(1);
    var y = 2;
    var lineHeight = 10;
    display.setTextColor(COL_CYAN);
    display.drawText("=== IMAGE DECODING SPEED ===", 5, y);
    y += lineHeight + 2;

    for (var i = 0; i < results.length; i++) {
        var r = results[i];
        display.setTextColor(COL_YELLOW);
        display.drawText(r.name + ":", 5, y);
        y += lineHeight;
        display.setTextColor(COL_WHITE);
        var pixelsStr = (r.pixelsPerSec / 1000000).toFixed(2) + " Mp/s";
        var timeStr = r.elapsed.toFixed(0) + " ms";
        display.drawText("  Speed: " + pixelsStr + "  (" + timeStr + ")", 10, y);
        y += lineHeight;
        y += 2;
    }

    display.setTextAlign("center", "bottom");
    display.setTextColor(COL_GREEN);
    display.drawText("Test complete. Press any key to exit.", W/2, H - 4);
    while (!keyboard.getAnyPress()) {
        delay(50);
    }
}

// ----- Main -----
function main() {
    keyboard.setLongPress(true);
    var results = runTests();
    displayResults(results);
    keyboard.setLongPress(false);
    display.drawFillRect(0, 0, W, H, COL_BLACK);
}

main();