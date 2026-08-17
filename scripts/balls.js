// ==================
// Balls Stress Test 
// ==================

var display = require("display");
var keyboard = require("keyboard");

var W = display.width();
var H = display.height();

var COL_BLACK = display.color(0, 0, 0);
var COL_WHITE = display.color(255, 255, 255);
var COL_GREY  = display.color(127, 127, 127);

var balls = [];
var spawnCounter = 0;
var spawnRate = 1;
var maxBalls = 500;

var frameCount = 0;
var lastFpsUpdate = Date.now();
var currentFps = 0;


function createBall() {
    var radius = 2 + Math.floor(Math.random() * 4);
    var x = radius + Math.random() * (W - 2 * radius);
    var y = radius + Math.random() * (H - 2 * radius);
    var vx = (Math.random() - 0.5) * 4;
    var vy = (Math.random() - 0.5) * 4;
    var color = display.color(
        100 + Math.floor(Math.random() * 155),
        100 + Math.floor(Math.random() * 155),
        100 + Math.floor(Math.random() * 155)
    );
    return {
        x: x, y: y,
        vx: vx, vy: vy,
        radius: radius,
        color: color
    };
}

function updateBalls() {
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
}

function drawBalls() {
    display.drawFillRect(0, 0, W, H, COL_BLACK);
    
    for (var i = 0; i < balls.length; i++) {
        var b = balls[i];
        var size = b.radius * 2;
        var x = b.x - b.radius;
        var y = b.y - b.radius;
        display.drawFillRect(x, y, size, size, b.color);
    }
}

function drawStats() {
    display.setTextAlign("left", "top");
    display.setTextSize(1);
    display.setTextColor(COL_WHITE);
    display.drawText("FPS: " + currentFps, 5, 5);
    display.drawText("Balls: " + balls.length, 5, 15);
    if (balls.length >= maxBalls) {
        display.setTextColor(display.color(255, 0, 0));
        display.drawText("MAX BALLS REACHED", 5, 25);
    }
}

function main() {
    var exitTest = false;
    keyboard.setLongPress(true);

    while (!exitTest) {
        if (keyboard.getEscPress()) {
            exitTest = true;
            break;
        }

        if (balls.length < maxBalls) {
            spawnCounter++;
            if (spawnCounter >= spawnRate) {
                spawnCounter = 0;
                var count = 1 + Math.floor(Math.random() * 3);
                for (var i = 0; i < count && balls.length < maxBalls; i++) {
                    balls.push(createBall());
                }
            }
        }

        updateBalls();

        drawBalls();
        drawStats();

        frameCount++;
        var now = Date.now();
        if (now - lastFpsUpdate >= 1000) {
            currentFps = frameCount;
            frameCount = 0;
            lastFpsUpdate = now;
        }

        delay(5);
    }

    keyboard.setLongPress(false);
    display.drawFillRect(0, 0, W, H, COL_BLACK);
    display.setTextAlign("center", "middle");
    display.setTextColor(COL_WHITE);
    display.drawText("Stress Test Finished", W/2, H/2);
    delay(500);
    display.drawFillRect(0, 0, W, H, COL_BLACK);
}

main();
