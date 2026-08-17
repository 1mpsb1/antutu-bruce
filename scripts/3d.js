// ============================================================
// 3D Maze Explorer - raycasting с FPS и исправленным рендерингом
// Управление: Prev - поворот влево, Next - поворот вправо,
// Sel - шаг вперёд, ESC - выход.
// Карта задаётся массивом map (1 - стена, 0 - пусто).
// ============================================================

var display = require("display");
var keyboard = require("keyboard");

// ----- Размеры экрана -----
var W = display.width();
var H = display.height();

// ----- Цвета -----
var COL_BLACK = display.color(0, 0, 0);
var COL_WHITE = display.color(255, 255, 255);
var COL_GREY  = display.color(127, 127, 127);
var COL_BLUE  = display.color(0, 0, 0);
var COL_DARK  = display.color(50, 50, 50);

// ----- Карта (изменяйте здесь!) -----
// 1 - стена, 0 - проход
var map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
var mapWidth = map[0].length;
var mapHeight = map.length;

// ----- Игрок -----
var playerX = 2.5;
var playerY = 2.5;
var angle = 0;       // угол в радианах
var speed = 0.50;    // шаг при движении
var rotSpeed = 0.25; // скорость поворота

// ----- FPS -----
var frameCount = 1;
var lastFpsUpdate = Date.now();
var currentFps = 0;

// ----- Функция проверки столкновения со стенами -----
function isWall(x, y) {
    var mx = Math.floor(x);
    var my = Math.floor(y);
    if (mx < 0 || mx >= mapWidth || my < 0 || my >= mapHeight) return true;
    return map[my][mx] === 1;
}

// ----- Перемещение вперёд с проверкой коллизий -----
function moveForward() {
    var newX = playerX + Math.cos(angle) * speed;
    var newY = playerY + Math.sin(angle) * speed;
    // Проверяем по X и Y отдельно (скольжение вдоль стен)
    if (!isWall(newX, playerY)) playerX = newX;
    if (!isWall(playerX, newY)) playerY = newY;
}

// ----- Raycasting (исправлен вызов display.fill) -----
function castRays() {
    // Заливаем фон и небо/пол через drawFillRect (совместимо с Bruce)
    display.drawFillRect(0, 0, W, H, COL_BLACK);
    display.drawFillRect(0, 0, W, H/2, COL_BLUE);   // небо
    display.drawFillRect(0, H/2, W, H/2, COL_DARK); // пол

    var fov = Math.PI / 3; // 60 градусов
    var halfFov = fov / 2;
    var angleStep = fov / W;
    var startAngle = angle - halfFov;

    for (var x = 0; x < W; x++) {
        var rayAngle = startAngle + x * angleStep;

        // Направление луча
        var rayDirX = Math.cos(rayAngle);
        var rayDirY = Math.sin(rayAngle);

        // Текущая позиция на карте
        var mapX = Math.floor(playerX);
        var mapY = Math.floor(playerY);

        // Длина шага по X и Y до следующей клетки
        var deltaDistX = Math.abs(1 / rayDirX);
        var deltaDistY = Math.abs(1 / rayDirY);

        var stepX, stepY;
        var sideDistX, sideDistY;

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

        // DDA
        var hit = false;
        var side = 0; // 0 - X, 1 - Y
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
            if (mapX < 0 || mapX >= mapWidth || mapY < 0 || mapY >= mapHeight) {
                hit = true;
                break;
            }
            if (map[mapY][mapX] === 1) hit = true;
        }

        // Расстояние до стены (перпендикулярное)
        var perpDist;
        if (side === 0) {
            perpDist = (mapX - playerX + (1 - stepX) / 2) / rayDirX;
        } else {
            perpDist = (mapY - playerY + (1 - stepY) / 2) / rayDirY;
        }
        if (perpDist < 0.001) perpDist = 0.001;

        // Высота линии
        var lineHeight = H / perpDist;
        if (lineHeight > H) lineHeight = H;

        // Оттенок серого в зависимости от расстояния и стороны
        var shade = 255 - Math.min(255, Math.floor(perpDist * 30));
        if (side === 1) shade = Math.floor(shade * 0.7); // темнее для Y-сторон
        var color = display.color(shade, shade, shade);

        // Рисуем вертикальную линию через drawFillRect (ширина 1 пиксель)
        var drawStart = (H - lineHeight) / 2;
        display.drawFillRect(x, drawStart, 1, lineHeight, color);
    }
}

// ----- Главный цикл -----
function main() {
    var exitGame = false;
    keyboard.setLongPress(true);

    while (!exitGame) {
        // Обработка ввода
        if (keyboard.getPrevPress()) {
            angle -= rotSpeed;
        }
        if (keyboard.getNextPress()) {
            angle += rotSpeed;
        }
        if (keyboard.getSelPress()) {
            moveForward();
        }
        if (keyboard.getEscPress()) {
            exitGame = true;
            break;
        }

        // Рендеринг сцены
        castRays();

        // ---- FPS счётчик ----
        frameCount++;
        var now = Date.now();
        if (now - lastFpsUpdate >= 1000) {
            currentFps = frameCount;
            frameCount = 0;
            lastFpsUpdate = now;
        }
        // Отображаем FPS в верхнем левом углу
        display.setTextAlign("left", "top");
        display.setTextSize(1);
        display.setTextColor(COL_WHITE);
        display.drawText("FPS: " + currentFps, 5, 5);

        // Небольшая задержка для управления кадрами
        delay(0);
    }

    keyboard.setLongPress(false);
    display.drawFillRect(0, 0, W, H, COL_BLACK);
    display.setTextAlign("center", "middle");
    display.setTextColor(COL_WHITE);
    display.drawText("Exiting Maze Explorer", W/2, H/2);
    delay(500);
    display.drawFillRect(0, 0, W, H, COL_BLACK);
}

main();