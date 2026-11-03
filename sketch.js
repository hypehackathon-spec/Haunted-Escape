let T = 40;

let levels = [
  [
    '############',
    '#P.........#',
    '#.####.###.#',
    '#.#....#...#',
    '#.#.####.#.#',
    '#...H....#.#',
    '#.####.###.#',
    '#..K...#..D#',
    '############'
  ],
  [
    '############',
    '#P.........#',
    '#.##.##.##.#',
    '#..........#',
    '#.#..H..#.V#',
    '#.#.####.#.#',
    '#K........K#',
    '#.##.##.##D#',
    '############'
  ],
  [
    '############',
    '#P...#.....#',
    '#.##.#.###.#',
    '#.#K...#K..#',
    '#.#.####...#',
    '#.....H....#',
    '#.####.###.#',
    '#K....V...D#',
    '############'
  ],
  [
    '############',
    '#P.....H.K.#',
    '#.####.###.#',
    '#.#K.H.#...#',
    '#.#.##.#.#.#',
    '#...#V..H..#',
    '###.#.####.#',
    '#K..#...K.D#',
    '############'
  ],
  [
    '############',
    '#P...H....K#',
    '#.##.##.##.#',
    '#.#K..H..#.#',
    '#.#.#V##.#.#',
    '#...#..#V.K#',
    '#.#.#..#...#',
    '#K...H...KD#',
    '############'
  ]
];

let grid = [];
let ghosts = [];
let keys = [];
let bits = [];
let player;
let levelNum = 0;
let keysGot = 0;
let totalKeys = 0;
let lives = 3;
let state = 'start';
let graceTime = 0;
let hurtFlash = 0;
let totalTime = 0;
let bestTime = 0;
let stateTime = -1000;

function setup() {
  createCanvas(480, 360);
  textFont('Courier New');
  loadLevel(0);
}

function loadLevel(n) {
  grid = [];
  ghosts = [];
  keys = [];
  keysGot = 0;
  let map = levels[n];
  for (let r = 0; r < map.length; r++) {
    let row = [];
    for (let c = 0; c < map[r].length; c++) {
      let ch = map[r][c];
      let cx = c * T + T / 2;
      let cy = r * T + T / 2;
      if (ch === 'P') {
        player = { x: cx, y: cy };
        ch = '.';
      } else if (ch === 'K') {
        keys.push({ x: cx, y: cy, got: false });
        ch = '.';
      } else if (ch === 'H' || ch === 'V') {
        ghosts.push({ x: cx, y: cy, type: ch, dir: 1 });
        ch = '.';
      }
      row.push(ch);
    }
    grid.push(row);
  }
  totalKeys = keys.length;
  graceTime = 70;
}

function draw() {
  if (state === 'play') {
    updateGame();
  }

  drawMap();
  drawKeys();
  drawGhosts();
  drawPlayer();
  drawBits();
  drawHud();

  if (state === 'play' && graceTime > 0) {
    textAlign(CENTER, CENTER);
    fill(255, 255, 255, graceTime * 3);
    textSize(26);
    text('GET READY', width / 2, height / 2);
  }

  if (hurtFlash > 0) {
    noStroke();
    fill(255, 0, 0, hurtFlash * 12);
    rect(0, 0, width, height);
    hurtFlash--;
  }

  if (state !== 'play') {
    drawScreen();
  }
}

function updateGame() {
  totalTime += deltaTime / 1000;
  movePlayer();

  for (let i = 0; i < keys.length; i++) {
    let k = keys[i];
    if (!k.got && dist(player.x, player.y, k.x, k.y) < 20) {
      k.got = true;
      keysGot++;
      boom(k.x, k.y, 255, 215, 0, 12);
    }
  }

  if (graceTime > 0) {
    graceTime--;
  } else {
    moveGhosts();
  }

  for (let i = 0; i < ghosts.length; i++) {
    if (dist(player.x, player.y, ghosts[i].x, ghosts[i].y) < 22) {
      hit();
      return;
    }
  }

  let c = floor(player.x / T);
  let r = floor(player.y / T);
  if (grid[r][c] === 'D' && keysGot >= totalKeys) {
    levelDone();
  }
}

function movePlayer() {
  let dx = 0;
  let dy = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    dx -= 1;
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    dx += 1;
  }
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
    dy -= 1;
  }
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
    dy += 1;
  }

  if (mouseIsPressed && dx === 0 && dy === 0) {
    let mx = mouseX - player.x;
    let my = mouseY - player.y;
    let d = sqrt(mx * mx + my * my);
    if (d > 6) {
      dx = mx / d;
      dy = my / d;
    }
  }

  let nx = player.x + dx * 3;
  if (!blocked(nx, player.y, 10, false)) {
    player.x = nx;
  }
  let ny = player.y + dy * 3;
  if (!blocked(player.x, ny, 10, false)) {
    player.y = ny;
  }
}

function moveGhosts() {
  let gs = 1.2 + levelNum * 0.25;
  for (let i = 0; i < ghosts.length; i++) {
    let g = ghosts[i];
    if (g.type === 'H') {
      let nx = g.x + g.dir * gs;
      if (blocked(nx, g.y, 13, true)) {
        g.dir = g.dir * -1;
      } else {
        g.x = nx;
      }
    } else {
      let ny = g.y + g.dir * gs;
      if (blocked(g.x, ny, 13, true)) {
        g.dir = g.dir * -1;
      } else {
        g.y = ny;
      }
    }
  }
}

function isSolid(c, r, forGhost) {
  if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) {
    return true;
  }
  let ch = grid[r][c];
  if (ch === '#') {
    return true;
  }
  if (ch === 'D') {
    return forGhost || keysGot < totalKeys;
  }
  return false;
}

function blocked(px, py, rad, forGhost) {
  let c1 = floor((px - rad) / T);
  let c2 = floor((px + rad) / T);
  let r1 = floor((py - rad) / T);
  let r2 = floor((py + rad) / T);
  return (
    isSolid(c1, r1, forGhost) ||
    isSolid(c2, r1, forGhost) ||
    isSolid(c1, r2, forGhost) ||
    isSolid(c2, r2, forGhost)
  );
}

function hit() {
  lives--;
  hurtFlash = 14;
  boom(player.x, player.y, 255, 80, 80, 18);
  if (lives <= 0) {
    state = 'over';
    stateTime = millis();
  } else {
    loadLevel(levelNum);
  }
}

function levelDone() {
  boom(player.x, player.y, 120, 255, 150, 20);
  stateTime = millis();
  if (levelNum === levels.length - 1) {
    state = 'win';
    if (bestTime === 0 || totalTime < bestTime) {
      bestTime = totalTime;
    }
  } else {
    state = 'between';
  }
}

function startGame() {
  levelNum = 0;
  lives = 3;
  totalTime = 0;
  bits = [];
  loadLevel(0);
  state = 'play';
}

function go() {
  if (millis() - stateTime < 500) {
    return;
  }
  if (state === 'start' || state === 'over' || state === 'win') {
    startGame();
  } else if (state === 'between') {
    levelNum++;
    loadLevel(levelNum);
    state = 'play';
  }
}

function mousePressed() {
  go();
}

function keyPressed() {
  if (key === ' ' || keyCode === ENTER) {
    go();
    return false;
  }
  if ((key === 'r' || key === 'R') && state === 'play') {
    loadLevel(levelNum);
  }
}

function boom(x, y, r, g, b, n) {
  for (let i = 0; i < n; i++) {
    bits.push({
      x: x,
      y: y,
      vx: random(-3, 3),
      vy: random(-3, 3),
      life: 255,
      r: r,
      g: g,
      b: b
    });
  }
}

function drawBits() {
  for (let i = bits.length - 1; i >= 0; i--) {
    let b = bits[i];
    b.x += b.vx;
    b.y += b.vy;
    b.life -= 8;
    noStroke();
    fill(b.r, b.g, b.b, b.life);
    ellipse(b.x, b.y, 5, 5);
    if (b.life <= 0) {
      bits.splice(i, 1);
    }
  }
}

function drawMap() {
  background(15, 10, 25);
  noStroke();
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      let x = c * T;
      let y = r * T;
      let ch = grid[r][c];
      if (ch === '#') {
        fill(75, 58, 100);
        rect(x, y, T, T);
        fill(98, 78, 128);
        rect(x, y, T, 4);
        fill(52, 40, 76);
        rect(x, y + T - 4, T, 4);
      } else {
        if ((r + c) % 2 === 0) {
          fill(36, 28, 50);
        } else {
          fill(30, 22, 42);
        }
        rect(x, y, T, T);
      }
      if (ch === 'D') {
        drawDoor(x, y);
      }
    }
  }
}

function drawDoor(x, y) {
  if (keysGot < totalKeys) {
    fill(110, 60, 30);
    rect(x + 6, y + 4, T - 12, T - 4);
    fill(80, 40, 20);
    rect(x + 10, y + 8, T - 20, 10);
    fill(255, 215, 0);
    ellipse(x + T - 14, y + T / 2 + 4, 5, 5);
    fill(150);
    rect(x + 14, y + 22, 12, 9);
  } else {
    fill(60, 255, 120, 140 + 60 * sin(frameCount * 0.15));
    rect(x + 4, y + 2, T - 8, T - 2);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(10);
    text('EXIT', x + T / 2, y + T / 2);
  }
}

function drawKeys() {
  for (let i = 0; i < keys.length; i++) {
    let k = keys[i];
    if (k.got) {
      continue;
    }
    let y = k.y + sin(frameCount * 0.1 + i) * 3;
    noStroke();
    fill(255, 215, 0);
    ellipse(k.x, y - 5, 13, 13);
    rect(k.x - 2, y, 4, 12);
    rect(k.x, y + 8, 6, 3);
    rect(k.x, y + 4, 5, 3);
    fill(36, 28, 50);
    ellipse(k.x, y - 5, 5, 5);
  }
}

function drawGhosts() {
  for (let i = 0; i < ghosts.length; i++) {
    let g = ghosts[i];
    let a = map(sin(frameCount * 0.1 + i), -1, 1, 160, 255);
    noStroke();
    fill(220, 255, 230, a);
    ellipse(g.x, g.y - 2, 28, 28);
    rect(g.x - 14, g.y - 2, 28, 14);
    triangle(g.x - 14, g.y + 12, g.x - 9, g.y + 20, g.x - 4, g.y + 12);
    triangle(g.x - 4, g.y + 12, g.x + 1, g.y + 20, g.x + 6, g.y + 12);
    triangle(g.x + 6, g.y + 12, g.x + 11, g.y + 20, g.x + 14, g.y + 12);
    fill(20);
    ellipse(g.x - 6, g.y - 4, 5, 6);
    ellipse(g.x + 6, g.y - 4, 5, 6);
    ellipse(g.x, g.y + 5, 5, 7);
  }
}

function drawPlayer() {
  let x = player.x;
  let y = player.y;
  noStroke();
  fill(0, 0, 0, 70);
  ellipse(x, y + 14, 22, 8);
  fill(60, 30, 90);
  rect(x - 8, y + 6, 16, 10);
  fill(255, 220, 190);
  ellipse(x, y, 18, 18);
  fill(20);
  ellipse(x - 3, y + 1, 3, 3);
  ellipse(x + 3, y + 1, 3, 3);
  fill(60, 30, 90);
  triangle(x - 11, y - 6, x + 11, y - 6, x + 2, y - 28);
  ellipse(x, y - 6, 28, 7);
  fill(255, 120, 20);
  rect(x - 7, y - 10, 14, 3);
}

function drawHud() {
  textAlign(LEFT, CENTER);
  fill(255);
  textSize(15);
  text('Level ' + (levelNum + 1) + '/' + levels.length, 12, 18);

  textAlign(CENTER, CENTER);
  if (keysGot >= totalKeys) {
    fill(100, 255, 150);
    text('Door open! Run!', width / 2, 18);
  } else {
    fill(255, 215, 0);
    text('Keys: ' + keysGot + '/' + totalKeys, width / 2, 18);
  }

  noStroke();
  for (let i = 0; i < lives; i++) {
    fill(255, 120, 20);
    ellipse(width - 20 - i * 24, 20, 18, 15);
    fill(40, 120, 40);
    rect(width - 22 - i * 24, 9, 4, 5);
  }
}

function drawScreen() {
  noStroke();
  fill(0, 0, 0, 175);
  rect(0, 0, width, height);
  textAlign(CENTER, CENTER);

  if (state === 'start') {
    fill(255, 120, 20);
    textSize(38);
    text('HAUNTED ESCAPE', width / 2, 70);
    fill(255);
    textSize(14);
    text('You are trapped in a haunted house!!', width / 2, 120);
    text('Find all the keys, then run to the door.', width / 2, 140);
    fill(255, 215, 0);
    text('5 levels, 3 lives, watch out for ghosts', width / 2, 175);
    fill(255);
    text('Move: arrow keys, WASD, or hold the mouse', width / 2, 210);
    text('Press R to restart a level', width / 2, 230);
    fill(200, 255, 210);
    textSize(20);
    text('Click or press space to start', width / 2, 285);
  }

  if (state === 'between') {
    fill(100, 255, 150);
    textSize(32);
    text('LEVEL ' + (levelNum + 1) + ' COMPLETE!', width / 2, 130);
    fill(255);
    textSize(18);
    text('Lives left: ' + lives, width / 2, 180);
    fill(200, 255, 210);
    textSize(18);
    text('Click for level ' + (levelNum + 2), width / 2, 235);
  }

  if (state === 'over') {
    fill(220, 30, 30);
    textSize(40);
    text('GAME OVER', width / 2, 100);
    fill(255);
    textSize(18);
    text('The ghosts got you on level ' + (levelNum + 1), width / 2, 160);
    fill(200, 255, 210);
    text('Click to try again', width / 2, 225);
  }

  if (state === 'win') {
    fill(255, 215, 0);
    textSize(36);
    text('YOU ESCAPED!!', width / 2, 85);
    fill(255);
    textSize(18);
    text('Time: ' + nf(totalTime, 1, 1) + ' sec', width / 2, 145);
    text('Best: ' + nf(bestTime, 1, 1) + ' sec', width / 2, 172);
    text('Lives left: ' + lives, width / 2, 199);
    fill(200, 255, 210);
    text('Click to play again', width / 2, 255);
  }
}
