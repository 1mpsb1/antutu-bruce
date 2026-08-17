// ============================================================
// Storage & RAM Speed Test for Bruce
// Tests read/write speed of RAM, SD card, and LittleFS.
// Results in B/s, KB/s, MB/s.
// ============================================================

var display = require("display");
var keyboard = require("keyboard");
var storage = require("storage");
var dialog = require("dialog");

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

// ----- Helpers -----
function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
    return (bytes / 1073741824).toFixed(2) + " GB";
}

function formatSpeed(bytesPerSec) {
    if (bytesPerSec < 1024) return bytesPerSec.toFixed(0) + " B/s";
    if (bytesPerSec < 1048576) return (bytesPerSec / 1024).toFixed(2) + " KB/s";
    if (bytesPerSec < 1073741824) return (bytesPerSec / 1048576).toFixed(2) + " MB/s";
    return (bytesPerSec / 1073741824).toFixed(2) + " GB/s";
}

// ----- Test RAM (read access speed) -----
function testRam() {
    var size = 50000; // 50 KB
    display.drawFillRect(0, 0, W, H, COL_BLACK);
    display.setTextAlign("center", "middle");
    display.setTextColor(COL_WHITE);
    display.drawText("Testing RAM...", W/2, H/2 - 10);
    display.setTextColor(COL_GREY);
    display.drawText("Creating " + (size/1024).toFixed(0) + "KB array", W/2, H/2 + 10);
    delay(100);

    var arr = [];
    for (var i = 0; i < size; i++) {
        arr[i] = Math.floor(Math.random() * 256);
    }

    var start = Date.now();
    var sum = 0;
    for (var i = 0; i < size; i++) {
        sum += arr[i];
    }
    var end = Date.now();
    var elapsed = end - start;
    var speed = size / (elapsed / 1000);
    return {
        size: size,
        elapsed: elapsed,
        speed: speed,
        sum: sum
    };
}

// ----- Test storage (SD or LittleFS) -----
function testStorage(fs, label) {
    display.drawFillRect(0, 0, W, H, COL_BLACK);
    display.setTextAlign("center", "middle");
    display.setTextColor(COL_WHITE);
    display.drawText("Testing " + label + "...", W/2, H/2 - 10);
    display.drawText("Writing 50KB file", W/2, H/2 + 10);
    delay(100);

    var dataSize = 50000; // 50 KB
    // Generate random string
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var data = "";
    for (var i = 0; i < dataSize; i++) {
        data += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    var path = "/speedtest.tmp";
    // Write
    var start = Date.now();
    try {
        storage.write({ fs: fs, path: path }, data, "write");
    } catch (writeErr) {
        return { error: "Write failed: " + writeErr.message };
    }
    var end = Date.now();
    var writeElapsed = end - start;
    var writeSpeed = dataSize / (writeElapsed / 1000);

    // Read
    display.drawText("Reading file...", W/2, H/2 + 20);
    delay(100);
    start = Date.now();
    var readData = null;
    try {
        readData = storage.read({ fs: fs, path: path });
    } catch (readErr) {
        return { error: "Read failed: " + readErr.message };
    }
    end = Date.now();
    var readElapsed = end - start;
    var readSpeed = dataSize / (readElapsed / 1000);

    // Clean up
    try {
        storage.remove({ fs: fs, path: path });
    } catch (removeErr) {
        // ignore
    }

    return {
        size: dataSize,
        writeElapsed: writeElapsed,
        writeSpeed: writeSpeed,
        readElapsed: readElapsed,
        readSpeed: readSpeed
    };
}

// ----- Main -----
function main() {
    var results = [];

    // 1. RAM
    var ramResult = testRam();
    results.push({ name: "RAM (read)", result: { speed: ramResult.speed, size: ramResult.size, elapsed: ramResult.elapsed } });

    // 2. SD Card
    var hasSD = false;
    try {
        var dir = storage.readdir({ fs: "sd", path: "/" });
        if (dir !== null && dir !== undefined) hasSD = true;
    } catch (sdCheckErr) {
        // ignore
    }
    if (hasSD) {
        var sdResult = testStorage("sd", "SD Card");
        if (!sdResult.error) {
            results.push({ name: "SD Card (write)", result: { speed: sdResult.writeSpeed, size: sdResult.size, elapsed: sdResult.writeElapsed } });
            results.push({ name: "SD Card (read)", result: { speed: sdResult.readSpeed, size: sdResult.size, elapsed: sdResult.readElapsed } });
        } else {
            results.push({ name: "SD Card", result: { error: sdResult.error } });
        }
    } else {
        results.push({ name: "SD Card", result: { error: "Not available" } });
    }

    // 3. LittleFS
    var lfsResult = testStorage("littlefs", "LittleFS");
    if (!lfsResult.error) {
        results.push({ name: "LittleFS (write)", result: { speed: lfsResult.writeSpeed, size: lfsResult.size, elapsed: lfsResult.writeElapsed } });
        results.push({ name: "LittleFS (read)", result: { speed: lfsResult.readSpeed, size: lfsResult.size, elapsed: lfsResult.readElapsed } });
    } else {
        results.push({ name: "LittleFS", result: { error: lfsResult.error } });
    }

    // ----- Display results -----
    display.drawFillRect(0, 0, W, H, COL_BLACK);
    display.setTextAlign("left", "top");
    display.setTextSize(1);
    var y = 2;
    var lineHeight = 10;
    display.setTextColor(COL_CYAN);
    display.drawText("=== SPEED TEST RESULTS ===", 5, y);
    y += lineHeight + 2;

    for (var i = 0; i < results.length; i++) {
        var item = results[i];
        display.setTextColor(COL_YELLOW);
        display.drawText(item.name + ":", 5, y);
        y += lineHeight;
        var res = item.result;
        if (res.error) {
            display.setTextColor(COL_RED);
            display.drawText("  Error: " + res.error, 10, y);
            y += lineHeight;
        } else {
            display.setTextColor(COL_WHITE);
            var sizeStr = formatSize(res.size);
            var speedStr = formatSpeed(res.speed);
            display.drawText("  " + sizeStr + " in " + res.elapsed + " ms", 10, y);
            y += lineHeight;
            display.drawText("  Speed: " + speedStr, 10, y);
            y += lineHeight;
        }
        y += 2;
    }

    display.setTextAlign("center", "bottom");
    display.setTextColor(COL_GREY);
    display.drawText("Press any key to exit", W/2, H - 4);
    while (!keyboard.getAnyPress()) {
        delay(50);
    }
    display.drawFillRect(0, 0, W, H, COL_BLACK);
}

main();