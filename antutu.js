// ==========================
// Antutu Benchmark for Bruce
// ==========================

var display = require("display");
var keyboard = require("keyboard");
var storage = require("storage");

var COL_BLACK = display.color(0, 0, 0);
var COL_WHITE = display.color(255, 255, 255);
var COL_GREY  = display.color(127, 127, 127);
var COL_GREEN = display.color(0, 255, 0);
var COL_CYAN  = display.color(0, 255, 255);
var COL_YELLOW = display.color(255, 255, 0);
var COL_RED   = display.color(255, 0, 0);
var COL_BLUE  = display.color(0, 0, 255);
var COL_DARK  = display.color(50, 50, 50);

var W = display.width();
var H = display.height();

function formatNumber(n) {
    var s = "";
    if (n < 0) { s = "-"; n = -n; }
    var str = n.toFixed(0);
    var parts = [];
    while (str.length > 3) {
        parts.unshift(str.slice(-3));
        str = str.slice(0, -3);
    }
    if (str.length > 0) parts.unshift(str);
    return s + parts.join(" ");
}

function formatNumberFloat(n) {
    var str = n.toFixed(2);
    var parts = str.split(".");
    var intPart = parts[0];
    var decPart = parts[1] || "";
    var s = "";
    if (intPart.length > 3) {
        var p = [];
        while (intPart.length > 3) {
            p.unshift(intPart.slice(-3));
            intPart = intPart.slice(0, -3);
        }
        if (intPart.length > 0) p.unshift(intPart);
        s = p.join(" ");
    } else {
        s = intPart;
    }
    if (decPart.length > 0) s += "." + decPart;
    return s;
}

function formatSpeed(bytesPerSec) {
    if (bytesPerSec < 1024) return bytesPerSec.toFixed(0) + " B/s";
    if (bytesPerSec < 1048576) return formatNumberFloat(bytesPerSec / 1024) + " KB/s";
    if (bytesPerSec < 1073741824) return formatNumberFloat(bytesPerSec / 1048576) + " MB/s";
    return formatNumberFloat(bytesPerSec / 1073741824) + " GB/s";
}

// ----- Tests -----
function testIntArithmetic() {
    var iterations = 100000;
    var result = 0;
    var start = Date.now();
    for (var i = 0; i < iterations; i++) {
        result += i * 3 + 7;
        result = result % 1000000;
    }
    var elapsed = Date.now() - start;
    var ops = iterations / (elapsed / 1000);
    return { name: "Integer", value: ops, unit: "ops/s" };
}

function testFloatArithmetic() {
    var iterations = 50000;
    var result = 0.0;
    var start = Date.now();
    for (var i = 0; i < iterations; i++) {
        result += i * 1.5 + 3.7;
        result = result % 1000000.0;
    }
    var elapsed = Date.now() - start;
    var ops = iterations / (elapsed / 1000);
    return { name: "Float", value: ops, unit: "ops/s" };
}

function testTrigonometry() {
    var iterations = 20000;
    var result = 0.0;
    var start = Date.now();
    for (var i = 0; i < iterations; i++) {
        result += Math.sin(i * 0.01) + Math.cos(i * 0.02);
    }
    var elapsed = Date.now() - start;
    var ops = iterations / (elapsed / 1000);
    return { name: "Trig", value: ops, unit: "ops/s" };
}

function testArraySort() {
    var iterations = 50;
    var arraySize = 100;
    var start = Date.now();
    for (var iter = 0; iter < iterations; iter++) {
        var arr = [];
        for (var i = 0; i < arraySize; i++) arr[i] = Math.floor(Math.random() * 1000);
        for (var i = 0; i < arr.length - 1; i++) {
            for (var j = 0; j < arr.length - i - 1; j++) {
                if (arr[j] > arr[j+1]) {
                    var tmp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = tmp;
                }
            }
        }
    }
    var elapsed = Date.now() - start;
    var ops = (iterations * arraySize * arraySize) / (elapsed / 1000);
    return { name: "Sort", value: ops, unit: "ops/s" };
}

function testRecursion() {
    function fib(n) {
        if (n < 2) return n;
        return fib(n-1) + fib(n-2);
    }
    var n = 20;
    var start = Date.now();
    var res = fib(n);
    var elapsed = Date.now() - start;
    var calls = 2 * res - 1;
    var ops = calls / (elapsed / 1000);
    return { name: "Recursion", value: ops, unit: "ops/s" };
}

function testStringOps() {
    var iterations = 50000;
    var str = "Hello World!";
    var result = "";
    var start = Date.now();
    for (var i = 0; i < iterations; i++) {
        result = str + i + "!";
        if (result.length > 100) result = "";
    }
    var elapsed = Date.now() - start;
    var ops = iterations / (elapsed / 1000);
    return { name: "String", value: ops, unit: "ops/s" };
}

function testBitwise() {
    var iterations = 200000;
    var result = 0;
    var start = Date.now();
    for (var i = 0; i < iterations; i++) {
        result ^= (i << 3) & 0xFF;
        result |= (i >> 2) ^ 0xAA;
    }
    var elapsed = Date.now() - start;
    var ops = iterations / (elapsed / 1000);
    return { name: "Bitwise", value: ops, unit: "ops/s" };
}

function testRamRead() {
    var size = 50000; 
    var arr = [];
    for (var i = 0; i < size; i++) {
        arr[i] = Math.floor(Math.random() * 256);
    }
    var start = Date.now();
    var sum = 0;
    for (var i = 0; i < size; i++) {
        sum += arr[i];
    }
    var elapsed = Date.now() - start;
    var speed = size / (elapsed / 1000);
    return { name: "RAM read", value: speed, unit: "B/s" };
}

function testSDWrite() {
    var dataSize = 50000;
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var data = "";
    for (var i = 0; i < dataSize; i++) data += chars.charAt(Math.floor(Math.random() * chars.length));
    var path = "/speedtest.tmp";
    var start = Date.now();
    try {
        storage.write({ fs: "sd", path: path }, data, "write");
    } catch (errSDWrite) {
        return { name: "SD write", error: true };
    }
    var elapsed = Date.now() - start;
    var speed = dataSize / (elapsed / 1000);
    try { storage.remove({ fs: "sd", path: path }); } catch (errSDWriteRm) {}
    return { name: "SD write", value: speed, unit: "B/s" };
}

function testSDRead() {
    var dataSize = 50000;
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var data = "";
    for (var i = 0; i < dataSize; i++) data += chars.charAt(Math.floor(Math.random() * chars.length));
    var path = "/speedtest.tmp";
    try { storage.write({ fs: "sd", path: path }, data, "write"); } catch (errSDReadWrite) {
        return { name: "SD read", error: true };
    }
    var start = Date.now();
    try { var readData = storage.read({ fs: "sd", path: path }); } catch (errSDRead) {
        return { name: "SD read", error: true };
    }
    var elapsed = Date.now() - start;
    var speed = dataSize / (elapsed / 1000);
    try { storage.remove({ fs: "sd", path: path }); } catch (errSDReadRm) {}
    return { name: "SD read", value: speed, unit: "B/s" };
}

function testLFSWrite() {
    var dataSize = 50000;
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var data = "";
    for (var i = 0; i < dataSize; i++) data += chars.charAt(Math.floor(Math.random() * chars.length));
    var path = "/speedtest.tmp";
    var start = Date.now();
    try {
        storage.write({ fs: "littlefs", path: path }, data, "write");
    } catch (errLFSWrite) {
        return { name: "LFS write", error: true };
    }
    var elapsed = Date.now() - start;
    var speed = dataSize / (elapsed / 1000);
    try { storage.remove({ fs: "littlefs", path: path }); } catch (errLFSWriteRm) {}
    return { name: "LFS write", value: speed, unit: "B/s" };
}

function testLFSRead() {
    var dataSize = 50000;
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var data = "";
    for (var i = 0; i < dataSize; i++) data += chars.charAt(Math.floor(Math.random() * chars.length));
    var path = "/speedtest.tmp";
    try { storage.write({ fs: "littlefs", path: path }, data, "write"); } catch (errLFSReadWrite) {
        return { name: "LFS read", error: true };
    }
    var start = Date.now();
    try { var readData = storage.read({ fs: "littlefs", path: path }); } catch (errLFSRead) {
        return { name: "LFS read", error: true };
    }
    var elapsed = Date.now() - start;
    var speed = dataSize / (elapsed / 1000);
    try { storage.remove({ fs: "littlefs", path: path }); } catch (errLFSReadRm) {}
    return { name: "LFS read", value: speed, unit: "B/s" };
}

function testImageDecode(size) {
    var width = size.width, height = size.height;
    var bytesPerRow = (width + 7) >> 3;
    var totalBytes = bytesPerRow * height;
    var data = new Uint8Array(totalBytes);
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var byteIndex = y * bytesPerRow + (x >> 3);
            var bitIndex = x & 7;
            var bit = ((x + y) & 1) ? 1 : 0;
            if (bit) data[byteIndex] |= (1 << (7 - bitIndex));
        }
    }
    var totalPixels = width * height;
    var iterations = 10;
    var start = Date.now();
    for (var i = 0; i < iterations; i++) {
        var xpos = (W - width) / 2;
        var ypos = (H - height) / 2;
        display.drawXBitmap(xpos, ypos, data, width, height, COL_WHITE);
    }
    var elapsed = Date.now() - start;
    var speed = (totalPixels * iterations) / (elapsed / 1000);
    return { name: width + "x" + height, value: speed, unit: "px/s" };
}

function test3DMaze() {
    var map = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
    var mapWidth = map[0].length;
    var mapHeight = map.length;
    var playerX = 2.5, playerY = 2.5;
    var angle = 0;
    var speed = 0.06;
    var rotSpeed = 0.03;
    var turnTimer = 0;
    var turnDirection = 0; 

    function isWall(x, y) {
        var mx = Math.floor(x);
        var my = Math.floor(y);
        if (mx < 0 || mx >= mapWidth || my < 0 || my >= mapHeight) return true;
        return map[my][mx] === 1;
    }

    function moveForward() {
        var newX = playerX + Math.cos(angle) * speed;
        var newY = playerY + Math.sin(angle) * speed;
        if (!isWall(newX, playerY)) playerX = newX;
        if (!isWall(playerX, newY)) playerY = newY;
    }

    function castRays() {
        display.drawFillRect(0, 0, W, H, COL_BLACK);
        display.drawFillRect(0, 0, W, H/2, COL_BLUE);
        display.drawFillRect(0, H/2, W, H/2, COL_DARK);
        var fov = Math.PI / 3;
        var halfFov = fov / 2;
        var angleStep = fov / W;
        var startAngle = angle - halfFov;
        for (var x = 0; x < W; x++) {
            var rayAngle = startAngle + x * angleStep;
            var rayDirX = Math.cos(rayAngle);
            var rayDirY = Math.sin(rayAngle);
            var mapX = Math.floor(playerX);
            var mapY = Math.floor(playerY);
            var deltaDistX = Math.abs(1 / rayDirX);
            var deltaDistY = Math.abs(1 / rayDirY);
            var stepX, stepY, sideDistX, sideDistY;
            if (rayDirX < 0) {
                stepX = -1;
                sideDistX = (playerX - mapX) * deltaDistX;
            } else {
                stepX = 1;
                sideDistX = (mapX + 1 - playerX) * deltaDistX;
            }
            if (rayDirY < 0) {
                stepY = -1;
                sideDistY = (playerY - mapY) * deltaDistY;
            } else {
                stepY = 1;
                sideDistY = (mapY + 1 - playerY) * deltaDistY;
            }
            var hit = false, side = 0;
            while (!hit) {
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }
                if (mapX < 0 || mapX >= mapWidth || mapY < 0 || mapY >= mapHeight) { hit = true; break; }
                if (map[mapY][mapX] === 1) hit = true;
            }
            var perpDist;
            if (side === 0) {
                perpDist = (mapX - playerX + (1 - stepX) / 2) / rayDirX;
            } else {
                perpDist = (mapY - playerY + (1 - stepY) / 2) / rayDirY;
            }
            if (perpDist < 0.001) perpDist = 0.001;
            var lineHeight = H / perpDist;
            if (lineHeight > H) lineHeight = H;
            var shade = 255 - Math.min(255, Math.floor(perpDist * 30));
            if (side === 1) shade = Math.floor(shade * 0.7);
            var color = display.color(shade, shade, shade);
            var drawStart = (H - lineHeight) / 2;
            display.drawFillRect(x, drawStart, 1, lineHeight, color);
        }
    }

    var frameCount = 0;
    var startTime = Date.now();
    var duration = 5000;
    var lastMoveTime = 0;
    var moveInterval = 50; 

    while (Date.now() - startTime < duration) {
        var now = Date.now();
        if (now - lastMoveTime > moveInterval) {
            lastMoveTime = now;
            moveForward();
            var checkX = playerX + Math.cos(angle) * 0.5;
            var checkY = playerY + Math.sin(angle) * 0.5;
            if (isWall(checkX, checkY)) {
                var leftAngle = angle - rotSpeed * 4;
                var lx = playerX + Math.cos(leftAngle) * 0.5;
                var ly = playerY + Math.sin(leftAngle) * 0.5;
                if (!isWall(lx, ly)) {
                    angle = leftAngle;
                } else {
                    var rightAngle = angle + rotSpeed * 4;
                    var rx = playerX + Math.cos(rightAngle) * 0.5;
                    var ry = playerY + Math.sin(rightAngle) * 0.5;
                    if (!isWall(rx, ry)) {
                        angle = rightAngle;
                    } else {
                        angle += Math.PI;
                    }
                }
            } else {
                if (Math.random() < 0.05) {
                    angle += (Math.random() - 0.5) * rotSpeed * 3;
                }
            }
            while (angle < 0) angle += 2 * Math.PI;
            while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
        }

        castRays();
        frameCount++;
        delay(10);
    }
    var elapsed = Date.now() - startTime;
    var fps = frameCount / (elapsed / 1000);
    return { name: "3D Maze", value: fps, unit: "fps" };
}

function testBallsStress() {
    var balls = [];
    var maxBalls = 300;
    var spawnCounter = 0;
    var spawnRate = 1;

    function createBall() {
        var radius = 2 + Math.floor(Math.random() * 3);
        var x = radius + Math.random() * (W - 2 * radius);
        var y = radius + Math.random() * (H - 2 * radius);
        var vx = (Math.random() - 0.5) * 3;
        var vy = (Math.random() - 0.5) * 3;
        var color = display.color(
            100 + Math.floor(Math.random() * 155),
            100 + Math.floor(Math.random() * 155),
            100 + Math.floor(Math.random() * 155)
        );
        return { x: x, y: y, vx: vx, vy: vy, radius: radius, color: color };
    }

    var frameCount = 0;
    var startTime = Date.now();
    while (balls.length < maxBalls) {
        spawnCounter++;
        if (spawnCounter >= spawnRate) {
            spawnCounter = 0;
            var count = 1 + Math.floor(Math.random() * 2);
            for (var i = 0; i < count && balls.length < maxBalls; i++) {
                balls.push(createBall());
            }
        }
        for (var i = 0; i < balls.length; i++) {
            var b = balls[i];
            b.x += b.vx;
            b.y += b.vy;
            if (b.x < b.radius || b.x > W - b.radius) {
                b.vx = -b.vx;
                b.x = Math.max(b.radius, Math.min(W - b.radius, b.x));
            }
            if (b.y < b.radius || b.y > H - b.radius) {
                b.vy = -b.vy;
                b.y = Math.max(b.radius, Math.min(H - b.radius, b.y));
            }
        }
        display.drawFillRect(0, 0, W, H, COL_BLACK);
        for (var i = 0; i < balls.length; i++) {
            var b = balls[i];
            var size = b.radius * 2;
            display.drawFillRect(b.x - b.radius, b.y - b.radius, size, size, b.color);
        }
        frameCount++;
        delay(5);
    }
    var elapsed = Date.now() - startTime;
    var fps = frameCount / (elapsed / 1000);
    return { name: "Balls Stress", value: fps, unit: "fps" };
}

function drawProgress(stepIndex, totalSteps, description) {
    var percent = Math.round((stepIndex / totalSteps) * 100);
    display.drawFillRect(0, 0, W, H, COL_BLACK);
    display.setTextAlign("center", "middle");
    display.setTextSize(1);
    display.setTextColor(COL_CYAN);
    display.drawText("Running Benchmark", W/2, H/2 - 40);
    display.setTextColor(COL_WHITE);
    display.drawText(percent + "%", W/2, H/2 - 20);
    display.setTextColor(COL_YELLOW);
    display.drawText("Step " + stepIndex + "/" + totalSteps, W/2, H/2);
    display.setTextColor(COL_WHITE);
    display.drawText(description, W/2, H/2 + 20);
    delay(20);
}

function buildSteps() {
    var steps = [];
    steps.push({ name: "Integer arithmetic", fn: testIntArithmetic });
    steps.push({ name: "Float arithmetic", fn: testFloatArithmetic });
    steps.push({ name: "Trigonometry", fn: testTrigonometry });
    steps.push({ name: "Array sort", fn: testArraySort });
    steps.push({ name: "Recursion", fn: testRecursion });
    steps.push({ name: "String operations", fn: testStringOps });
    steps.push({ name: "Bitwise operations", fn: testBitwise });
    steps.push({ name: "RAM read", fn: testRamRead });
    steps.push({ name: "SD write", fn: testSDWrite });
    steps.push({ name: "SD read", fn: testSDRead });
    steps.push({ name: "LFS write", fn: testLFSWrite });
    steps.push({ name: "LFS read", fn: testLFSRead });
    var sizes = [{ width: 32, height: 32 }, { width: 64, height: 64 }, { width: 128, height: 128 }];
    for (var i = 0; i < sizes.length; i++) {
        (function(s) {
            steps.push({ name: "Image decode " + s.width + "x" + s.height, fn: function() { return testImageDecode(s); } });
        })(sizes[i]);
    }
    steps.push({ name: "3D Maze rendering", fn: test3DMaze });
    steps.push({ name: "Balls stress test", fn: testBallsStress });
    return steps;
}

function runBenchmark() {
    var steps = buildSteps();
    var totalSteps = steps.length;
    var results = [];
    for (var i = 0; i < steps.length; i++) {
        var step = steps[i];
        var result = step.fn();
        results.push(result);
        drawProgress(i+1, totalSteps, step.name);
    }

    var agg = {};
    for (var i = 0; i < results.length; i++) {
        var r = results[i];
        if (r.error) continue;
        var cat = "";
        var name = r.name;
        if (name.indexOf("Integer") >= 0 || name.indexOf("Float") >= 0 || name.indexOf("Trig") >= 0 || name.indexOf("Sort") >= 0 || name.indexOf("Recursion") >= 0 || name.indexOf("String") >= 0 || name.indexOf("Bitwise") >= 0) cat = "CPU";
        else if (name.indexOf("RAM") >= 0 || name.indexOf("SD") >= 0 || name.indexOf("LFS") >= 0) cat = "Memory";
        else if (name.indexOf("x") >= 0 && name.indexOf("Image") >= 0) cat = "Image";
        else if (name.indexOf("3D") >= 0) cat = "3D";
        else if (name.indexOf("Balls") >= 0) cat = "Balls";
        else cat = "Other";
        if (!agg[cat]) agg[cat] = { tests: [], total: 0 };
        agg[cat].tests.push(r);
        agg[cat].total += r.value;
    }

    var finalResults = [];
    for (var cat in agg) {
        finalResults.push({ category: cat, tests: agg[cat].tests, total: agg[cat].total });
    }

    var totalScore = 0;
    for (var i = 0; i < finalResults.length; i++) {
        totalScore += finalResults[i].total;
    }
    return { results: finalResults, totalScore: totalScore };
}

function displayResults(benchResult) {
    var results = benchResult.results;
    var totalScore = benchResult.totalScore;
    var detailIndex = -1;
    var exit = false;

    while (!exit) {
        display.drawFillRect(0, 0, W, H, COL_BLACK);
        display.setTextAlign("left", "top");
        display.setTextSize(1);

        if (detailIndex < 0) {
            display.setTextColor(COL_CYAN);
            display.drawText("=== ANTUTU BENCHMARK ===", 5, 2);
            display.setTextColor(COL_WHITE);
            display.drawText("Total Score: " + formatNumber(totalScore), 5, 16);

            var y = 30;
            for (var i = 0; i < results.length; i++) {
                display.setTextColor(COL_YELLOW);
                display.drawText(results[i].category + ":", 5, y);
                y += 10;
                display.setTextColor(COL_WHITE);
                var val = results[i].total;
                var unit = "";
                if (results[i].category === "CPU") unit = " ops/s";
                else if (results[i].category === "Memory") unit = " B/s";
                else if (results[i].category === "Image") unit = " px/s";
                else unit = " fps";
                display.drawText("  " + formatNumber(val) + " " + unit, 10, y);
                y += 12;
            }

            display.setTextAlign("center", "bottom");
            display.setTextColor(COL_GREY);
            display.drawText("Press Select for details, ESC exit", W/2, H - 4);
        } else {
            var cat = results[detailIndex];
            display.setTextColor(COL_CYAN);
            display.drawText("=== " + cat.category + " ===", 5, 2);
            var y = 16;
            for (var i = 0; i < cat.tests.length; i++) {
                var test = cat.tests[i];
                display.setTextColor(COL_YELLOW);
                display.drawText(test.name + ":", 5, y);
                y += 10;
                display.setTextColor(COL_WHITE);
                var detailStr = "";
                if (test.unit) {
                    if (test.unit === "B/s" || test.unit === "ops/s" || test.unit === "px/s" || test.unit === "fps") {
                        detailStr = formatNumber(test.value) + " " + test.unit;
                    } else {
                        detailStr = formatNumber(test.value) + " " + test.unit;
                    }
                } else {
                    detailStr = test.detail || "";
                }
                display.drawText("  " + detailStr, 10, y);
                y += 12;
                if (y > H - 20) break;
            }
            display.setTextAlign("center", "bottom");
            display.setTextColor(COL_GREY);
            display.drawText("Prev/Next to change, ESC back", W/2, H - 4);
        }

        if (keyboard.getEscPress()) {
            if (detailIndex < 0) {
                exit = true;
                break;
            } else {
                detailIndex = -1;
            }
        }
        if (keyboard.getSelPress()) {
            if (detailIndex < 0) {
                detailIndex = 0;
            }
        }
        if (keyboard.getPrevPress()) {
            if (detailIndex >= 0) {
                detailIndex--;
                if (detailIndex < 0) detailIndex = results.length - 1;
            }
        }
        if (keyboard.getNextPress()) {
            if (detailIndex >= 0) {
                detailIndex++;
                if (detailIndex >= results.length) detailIndex = 0;
            }
        }
        delay(50);
    }
}

function main() {
    keyboard.setLongPress(true);
    var benchResult = runBenchmark();
    displayResults(benchResult);
    keyboard.setLongPress(false);
    display.drawFillRect(0, 0, W, H, COL_BLACK);
    display.setTextAlign("center", "middle");
    display.setTextColor(COL_WHITE);
    display.drawText("Benchmark complete", W/2, H/2);
    delay(1000);
    display.drawFillRect(0, 0, W, H, COL_BLACK);
}

main();