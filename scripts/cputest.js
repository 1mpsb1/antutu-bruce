// ============================================================
// CPU Performance Test for Bruce
// Runs multiple math tests and reports results.
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

// ----- Helpers -----
function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
    if (n >= 1000) return (n / 1000).toFixed(2) + "K";
    return n.toFixed(2);
}

function formatTime(ms) {
    if (ms < 1000) return ms.toFixed(0) + " ms";
    if (ms < 60000) return (ms / 1000).toFixed(2) + " s";
    return (ms / 60000).toFixed(2) + " min";
}

// ----- Tests -----

// 1. Integer arithmetic
function testIntArithmetic() {
    var iterations = 100000;
    var result = 0;
    var start = Date.now();
    for (var i = 0; i < iterations; i++) {
        result += i * 3 + 7;
        result = result % 1000000;
    }
    var elapsed = Date.now() - start;
    var opsPerSec = iterations / (elapsed / 1000);
    return { name: "Integer arithmetic", ops: opsPerSec, elapsed: elapsed, iterations: iterations };
}

// 2. Floating-point arithmetic
function testFloatArithmetic() {
    var iterations = 50000;
    var result = 0.0;
    var start = Date.now();
    for (var i = 0; i < iterations; i++) {
        result += i * 1.5 + 3.7;
        result = result % 1000000.0;
    }
    var elapsed = Date.now() - start;
    var opsPerSec = iterations / (elapsed / 1000);
    return { name: "Float arithmetic", ops: opsPerSec, elapsed: elapsed, iterations: iterations };
}

// 3. Trigonometry (sin/cos)
function testTrigonometry() {
    var iterations = 20000;
    var result = 0.0;
    var start = Date.now();
    for (var i = 0; i < iterations; i++) {
        result += Math.sin(i * 0.01) + Math.cos(i * 0.02);
    }
    var elapsed = Date.now() - start;
    var opsPerSec = iterations / (elapsed / 1000);
    return { name: "Trig (sin/cos)", ops: opsPerSec, elapsed: elapsed, iterations: iterations };
}

// 4. Array sort (bubble sort on small array)
function testArraySort() {
    var iterations = 50;
    var arraySize = 100;
    var totalElapsed = 0;
    var start = Date.now();
    for (var iter = 0; iter < iterations; iter++) {
        var arr = [];
        for (var i = 0; i < arraySize; i++) {
            arr[i] = Math.floor(Math.random() * 1000);
        }
        // Bubble sort (inefficient on purpose)
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
    var opsPerSec = (iterations * arraySize * arraySize) / (elapsed / 1000);
    return { name: "Array sort (bubble)", ops: opsPerSec, elapsed: elapsed, iterations: iterations };
}

// 5. Recursion (Fibonacci)
function fib(n) {
    if (n < 2) return n;
    return fib(n-1) + fib(n-2);
}
function testRecursion() {
    var n = 20; // fib(20) = 6765
    var start = Date.now();
    var result = fib(n);
    var elapsed = Date.now() - start;
    // ops = number of recursive calls (approx 2*fib(n) - 1)
    var calls = 2 * result - 1;
    var opsPerSec = calls / (elapsed / 1000);
    return { name: "Recursion (fib " + n + ")", ops: opsPerSec, elapsed: elapsed, iterations: calls };
}

// 6. String operations
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
    var opsPerSec = iterations / (elapsed / 1000);
    return { name: "String concat", ops: opsPerSec, elapsed: elapsed, iterations: iterations };
}

// 7. Bitwise operations
function testBitwise() {
    var iterations = 200000;
    var result = 0;
    var start = Date.now();
    for (var i = 0; i < iterations; i++) {
        result ^= (i << 3) & 0xFF;
        result |= (i >> 2) ^ 0xAA;
    }
    var elapsed = Date.now() - start;
    var opsPerSec = iterations / (elapsed / 1000);
    return { name: "Bitwise ops", ops: opsPerSec, elapsed: elapsed, iterations: iterations };
}

// ----- Run all tests -----
function runAllTests() {
    var tests = [
        testIntArithmetic,
        testFloatArithmetic,
        testTrigonometry,
        testArraySort,
        testRecursion,
        testStringOps,
        testBitwise
    ];
    var results = [];
    for (var i = 0; i < tests.length; i++) {
        // Show progress on screen
        display.drawFillRect(0, 0, W, H, COL_BLACK);
        display.setTextAlign("center", "middle");
        display.setTextColor(COL_CYAN);
        display.drawText("Running test " + (i+1) + "/" + tests.length, W/2, H/2 - 10);
        display.setTextColor(COL_GREY);
        display.drawText("Please wait...", W/2, H/2 + 10);
        delay(10);
        
        var result = tests[i]();
        results.push(result);
    }
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
    display.drawText("=== CPU PERFORMANCE TEST ===", 5, y);
    y += lineHeight + 2;
    
    for (var i = 0; i < results.length; i++) {
        var r = results[i];
        display.setTextColor(COL_YELLOW);
        display.drawText(r.name + ":", 5, y);
        y += lineHeight;
        display.setTextColor(COL_WHITE);
        var opsStr = formatNumber(r.ops) + " ops/s";
        var timeStr = formatTime(r.elapsed);
        display.drawText("  " + opsStr + "  (" + timeStr + ")", 10, y);
        y += lineHeight;
        y += 2;
        // If too many lines, let user scroll? We'll just show full list
    }
    
    // Show score summary
    display.setTextAlign("center", "bottom");
    display.setTextColor(COL_GREEN);
    var totalOps = 0;
    for (var i = 0; i < results.length; i++) {
        totalOps += results[i].ops;
    }
    display.drawText("Total Score: " + formatNumber(totalOps) + " ops/s", W/2, H - 14);
    display.setTextColor(COL_GREY);
    display.drawText("Press any key to exit", W/2, H - 4);
    
    while (!keyboard.getAnyPress()) {
        delay(50);
    }
}

// ----- Main -----
function main() {
    keyboard.setLongPress(true);
    var results = runAllTests();
    displayResults(results);
    keyboard.setLongPress(false);
    display.drawFillRect(0, 0, W, H, COL_BLACK);
}

main();