// Game Engine & Main Loop

// Pengaturan Tingkat Kesulitan
let currentDifficulty = 'easy';
let gameStartTime = 0;
let currentLevel = 1;

function updateDifficultyButtons() {
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-text') === currentDifficulty);
  });
}

// Inisialisasi Elemen Canvas & DOM
let canvas, ctx, container;
let startScreen, resultScreen, startButton, restartButton, homeButton;
let fpsDisplay;

let lastTimes = performance.now();
let frames = 0;
let fps = 0;
let fpsVisible = true;

function updateFPS() {
  const now = performance.now();
  frames++;
  if (now - lastTimes >= 1000) {
    fps = frames;
    frames = 0;
    lastTimes = now;
    if (fpsDisplay) fpsDisplay.textContent = 'FPS: ' + fps;
  }
}

function initFPS() {
  if (fpsDisplay) {
    fpsDisplay.addEventListener('click', () => {
      fpsVisible = !fpsVisible;
      fpsDisplay.style.display = fpsVisible ? 'block' : 'none';
    });
  }
}

// State Variabel Game
let canvasWidth, canvasHeight;
let player = null;
let bullets = [];
let bears = [];
let boss = null;
let explosions = [];
let powerUps = [];
let healthPacks = [];
let bossBullets = [];
let flashEffects = [];

let uiFont = 16;
let uiAdjust = 0;
let bearSpawnTimer = 0;
let bearInterval = 0;
let bearProbability = 0;
let bossBegan = 0;
const maxPlayerCharacter = 5;
let bearKillCount = 0;
let killsSinceLastLife = 0;
let comboCount = 0;
let maxComboCount = 0;
let escapedBearCount = 0;
let escapedBulletCount = 0;
let escapedItemCount = 0;
let destroyedBulletCount = 0;
let collectedItemCount = 0;
let deathCount = 0;
let bossSpawned = false;
let gameLoopId = null;
let roadLineY = -100;
let gameState = 'over';
let bossDeathPosition = null;
let screenFlashAlpha = 0;
let playerInvulnerable = false;
let invulnerabilityTimer = 0;
let isShooting = false;
let shootTimer = 0;
const shootInterval = 80;

// Parameter Level 2
let playerHealth = 3;
let playerBulletStreams = 1;
let maxPlayerBulletStreams = 10;
let itemProbability = 1;
let healthProbability = 1;

// Posisi Target Karakter
let targetPos = { x: 0, y: 0 };

function init() {
  const levelSel = document.getElementById('level-selector');
  currentLevel = levelSel ? parseInt(levelSel.value, 10) : 1;
  resizeCanvas();
  player = new Player();
  targetPos = { x: player.x, y: player.y };

  bullets.length = 0;
  bears.length = 0;
  powerUps.length = 0;
  healthPacks.length = 0;
  bossBullets.length = 0;
  explosions.length = 0;
  flashEffects.length = 0;
  boss = null;
  bearKillCount = 0;
  killsSinceLastLife = 0;
  comboCount = 0;
  maxComboCount = 0;
  escapedBearCount = 0;
  escapedBulletCount = 0;
  escapedItemCount = 0;
  destroyedBulletCount = 0;
  collectedItemCount = 0;
  deathCount = 0;
  bearSpawnTimer = 0;
  bossSpawned = false;
  playerInvulnerable = false;
  invulnerabilityTimer = 0;
  gameState = 'playing';
  gameStartTime = performance.now();

  document.getElementById('result-diff').textContent = '';
  document.getElementById('result-time').textContent = '';
  document.getElementById('result-kill').textContent = '';
  document.getElementById('result-combo-text').textContent = '';
  document.getElementById('result-total-text').textContent = '';

  const fullcombo = document.getElementById('result-fullcombo');
  if (fullcombo) {
    fullcombo.style.display = 'none';
    fullcombo.src = IMG_PATH + assets.fullcombo;
  }
  const resultRankEl = document.getElementById('result-rank');
  if (resultRankEl) resultRankEl.style.display = 'none';

  if (currentLevel === 2) {
    playerHealth = 3;
    playerBulletStreams = 1;
  }

  if (currentDifficulty === 'easy') {
    bearInterval = 800;
    bearProbability = 0.5;
    maxPlayerBulletStreams = 10;
    itemProbability = 0.3;
    healthProbability = 0.3;
    bossBegan = 1000;
  } else if (currentDifficulty === 'normal' || currentDifficulty === 'endless') {
    bearInterval = 750;
    bearProbability = 0.6;
    maxPlayerBulletStreams = 14;
    itemProbability = 0.24;
    healthProbability = 0.22;
    bossBegan = 2000;
  } else if (currentDifficulty === 'hard') {
    bearInterval = 700;
    bearProbability = 0.65;
    maxPlayerBulletStreams = 18;
    itemProbability = 0.18;
    healthProbability = 0.18;
    bossBegan = 3000;
  }

  if (player) {
    player.defeatCharacters = [];
    player.characters = [1];
    player.deadCharacterType = 1;
    if (currentLevel === 2) {
      player.currentCharacterType = 1;
    }
  }
}

// Spawn Musuh Beruang
function spawnBears() {
  const numColumns = 6;
  const bearWidth = canvasWidth / 6;
  for (let i = 0; i < numColumns; i++) {
    if (Math.random() < bearProbability) {
      const x = i * bearWidth;
      const y = -bearWidth;
      let canSpawn = true;

      if (boss && boss.y > -boss.height) {
        const bossLeft = boss.x;
        const bossRight = boss.x + boss.width;
        const bearLeft = x;
        const bearRight = x + bearWidth;
        if (!(bearRight <= bossLeft || bearLeft >= bossRight)) {
          canSpawn = false;
        }
      }

      if (canSpawn) {
        bears.push(new Bear(x, y));
      }
    }
  }
}

// Spawn Power-Up & Darah (Level 2)
function spawnPowerUps() {
  if (currentLevel !== 2) return;

  const minDistance = canvasWidth / 10;
  const newItems = [];

  if (Math.random() < itemProbability) {
    const type = Math.floor(Math.random() * 3) + 1;
    const x = findValidPosition(canvasWidth / 8, newItems, minDistance);
    if (x !== -1) {
      powerUps.push(new PowerUp(x, -canvasWidth / 12, type));
      newItems.push({ x, width: canvasWidth / 8 });
    }
  }

  if (Math.random() < healthProbability) {
    const x = findValidPosition(canvasWidth / 12, newItems, minDistance);
    if (x !== -1) {
      healthPacks.push(new HealthPack(x, -canvasWidth / 12));
      newItems.push({ x, width: canvasWidth / 12 });
    }
  }
}

function findValidPosition(itemWidth, existingItems, minDistance) {
  const maxAttempts = 10;
  for (let i = 0; i < maxAttempts; i++) {
    const x = Math.random() * (canvasWidth - itemWidth);
    let valid = true;

    for (const item of existingItems) {
      const distance = Math.abs(x + itemWidth / 2 - (item.x + item.width / 2));
      if (distance < minDistance) {
        valid = false;
        break;
      }
    }

    if (valid) return x;
  }
  return -1;
}

// Deteksi Tabrakan
function handleCollisions() {
  bullets.forEach(bullet => {
    if (bullet.markedForDeletion) return;
    bears.forEach(bear => {
      if (bear.markedForDeletion) return;
      if (isColliding(bullet, bear, 0)) {
        flashEffects.push(new FlashEffect(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, false));
        bullet.markedForDeletion = true;
        bear.health -= (bullet.bearDamage > bear.health ? bear.health : bullet.bearDamage);
        bear.flashTimer = 50;

        if (currentLevel === 2 && bullet.bulletType === 3) {
          bear.applySlow();
        }

        if (bear.health <= 0) {
          bear.markedForDeletion = true;
          bearKillCount++;
          killsSinceLastLife++;
          comboCount++;
          if (comboCount > maxComboCount) maxComboCount = comboCount;
          player.updateCharacterCount();
        }
      }
    });
  });

  if (boss) {
    bullets.forEach(bullet => {
      if (bullet.markedForDeletion) return;
      if (isColliding(bullet, boss, 0)) {
        flashEffects.push(new FlashEffect(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, false));
        bullet.markedForDeletion = true;
        if (currentLevel === 2 && bullet.bulletType === 3) {
          boss.applySlow();
        }
        if (currentDifficulty !== 'endless') {
          boss.health -= (bullet.damage > boss.health ? boss.health : bullet.damage);
        }
        boss.flashTimer = 50;
        if (boss.health <= 0 && gameState === 'playing') {
          gameState = 'bossDying';
          bossDeathPosition = { x: boss.x, y: boss.y, width: boss.width, height: boss.height };
          screenFlashAlpha = 0.7;
          triggerScreenShake();
          setTimeout(() => gameOver(true), 400);
        }
      }
    });
  }

  if (currentLevel === 2) {
    bullets.forEach(playerBullet => {
      if (playerBullet.markedForDeletion || playerBullet.bulletType !== 3) return;
      bossBullets.forEach(bossBullet => {
        if (bossBullet.markedForDeletion) return;
        if (isColliding(playerBullet, bossBullet, 0)) {
          playerBullet.markedForDeletion = true;
          bossBullet.markedForDeletion = true;
          destroyedBulletCount++;
          flashEffects.push(new FlashEffect(
            (playerBullet.x + bossBullet.x) / 2 + playerBullet.width / 2,
            (playerBullet.y + bossBullet.y) / 2 + playerBullet.height / 2,
            false
          ));
        }
      });
    });
  }

  bears.forEach(bear => {
    if (bear.markedForDeletion) return;
    const totalWidth = player.width * player.characterCount;
    const startX = player.x - totalWidth / 2;

    for (let i = 0; i < player.characterCount; i++) {
      const charHitbox = {
        x: startX + i * player.width,
        y: player.y,
        width: player.width,
        height: player.height
      };

      if (isColliding(bear, charHitbox)) {
        bear.markedForDeletion = true;
        escapedBearCount++;
        comboCount = 0;
        playerBulletStreams = Math.ceil(playerBulletStreams / 2);
        triggerScreenShake();
        flashEffects.push(new FlashEffect(charHitbox.x, charHitbox.y, true));
        player.flashTimer = 200;
        checkDead(i);
        return;
      }
    }
  });

  if (boss && !playerInvulnerable) {
    if (currentLevel === 2) {
      const playerHitbox = {
        x: player.x - player.width / 2,
        y: player.y,
        width: player.width,
        height: player.height
      };

      if (isColliding(boss, playerHitbox)) {
        playerInvulnerable = true;
        invulnerabilityTimer = 800;
        playerBulletStreams = Math.ceil(playerBulletStreams / 2);
        player.flashTimer = 200;
        triggerScreenShake();
        flashEffects.push(new FlashEffect(playerHitbox.x, playerHitbox.y, true));
        checkDead(0);
      }
    } else {
      const totalWidth = player.width * player.characterCount;
      const startX = player.x - totalWidth / 2;

      for (let i = 0; i < player.characterCount; i++) {
        const charHitbox = {
          x: startX + i * player.width,
          y: player.y,
          width: player.width,
          height: player.height
        };

        if (isColliding(boss, charHitbox)) {
          playerInvulnerable = true;
          invulnerabilityTimer = 1800;
          player.flashTimer = 100;
          triggerScreenShake();
          flashEffects.push(new FlashEffect(charHitbox.x, charHitbox.y, true));
          checkDead(i);
          return;
        }
      }
    }
  }

  if (currentLevel === 2) {
    const playerHitbox = {
      x: player.x - player.width / 2,
      y: player.y,
      width: player.width,
      height: player.height
    };

    bossBullets.forEach(bullet => {
      if (bullet.markedForDeletion) return;
      if (isColliding(bullet, playerHitbox) && !playerInvulnerable) {
        bullet.markedForDeletion = true;
        escapedBulletCount++;
        playerInvulnerable = true;
        invulnerabilityTimer = 500;
        playerBulletStreams = Math.ceil(playerBulletStreams / 2);
        player.flashTimer = 100;
        triggerScreenShake();
        flashEffects.push(new FlashEffect(playerHitbox.x, playerHitbox.y, true));
        checkDead(0);
      }
    });

    powerUps.forEach(powerUp => {
      if (powerUp.markedForDeletion) return;
      if (isColliding(powerUp, playerHitbox, 2)) {
        powerUp.markedForDeletion = true;
        collectedItemCount++;
        if (playerBulletStreams < maxPlayerBulletStreams) {
          if (currentDifficulty !== 'hard' || player.currentCharacterType !== powerUp.type) {
            playerBulletStreams++;
          }
        }
        player.currentCharacterType = powerUp.type;
      }
    });

    healthPacks.forEach(healthPack => {
      if (healthPack.markedForDeletion) return;
      if (isColliding(healthPack, playerHitbox, 2)) {
        healthPack.markedForDeletion = true;
        collectedItemCount++;
        playerHealth++;
      }
    });
  }
}

function checkDead(hitCharacterIndex) {
  if (currentLevel === 2) {
    if (playerHealth > 0) {
      playerHealth--;
      deathCount++;
    }
    if (playerHealth <= 0) {
      player.deadCharacterType = player.currentCharacterType;
      player.isDead = true;
      setTimeout(() => gameOver(false), 400);
    }
  } else {
    deathCount++;
    if (player.characterCount > 1) {
      const totalWidth = player.width * player.characterCount;
      const startX = player.x - totalWidth / 2;
      const hitCharacterX = startX + hitCharacterIndex * player.width + player.width / 2;
      const hitCharacterType = player.characters[hitCharacterIndex];

      player.defeatCharacters.push({
        x: hitCharacterX,
        characterIndex: hitCharacterType,
        timer: 1200
      });
      player.characters.splice(hitCharacterIndex, 1);
      player.characterCount--;
      killsSinceLastLife = 0;
    } else {
      player.deadCharacterType = player.characters[hitCharacterIndex];
      player.isDead = true;
      setTimeout(() => gameOver(false), 400);
    }
  }
}

function isColliding(rect1, rect2, margin = 7) {
  return rect1.x + margin < rect2.x + rect2.width - margin &&
         rect1.x + rect1.width - margin > rect2.x + margin &&
         rect1.y + margin < rect2.y + rect2.height - margin &&
         rect1.y + rect1.height - margin > rect2.y + margin;
}

function drawRoad(deltaTime) {
  ctx.fillStyle = '#fff';
  const lineWidth = 15;
  const lineHeight = 80;
  const lineGap = 60;
  const roadSpeed = canvasHeight * 0.6;
  if (gameState === 'playing') {
    roadLineY += roadSpeed * (deltaTime / 1000);
  }
  if (roadLineY > lineHeight + lineGap) roadLineY = 0;

  for (let y = roadLineY - (lineHeight + lineGap); y < canvasHeight; y += lineHeight + lineGap) {
    ctx.fillRect(canvasWidth / 2 - lineWidth / 2, y, lineWidth, lineHeight);
  }
}

let lastTime = 0;

function gameLoop(timestamp) {
  updateFPS();
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawRoad(deltaTime);

  if (gameState === 'playing') {
    const gameTime = timestamp - gameStartTime;

    bullets.forEach(bullet => bullet.update(deltaTime));
    bears.forEach(bear => bear.update(deltaTime));
    powerUps.forEach(powerUp => powerUp.update(deltaTime));
    healthPacks.forEach(healthPack => healthPack.update(deltaTime));
    bossBullets.forEach(bullet => bullet.update(deltaTime));

    if (boss) boss.update(deltaTime, gameTime);
    if (player) {
      updatePlayerPosition(deltaTime);
      player.updateDefeatCharacters(deltaTime);
    }

    if (isShooting) {
      shootTimer += deltaTime;
      if (shootTimer >= shootInterval) {
        player.shoot();
        shootTimer = 0;
      }
    }

    bearSpawnTimer += deltaTime;
    if (bearSpawnTimer > bearInterval) {
      spawnBears();
      spawnPowerUps();
      bearSpawnTimer = 0;
    }

    if (!bossSpawned && gameTime > bossBegan) {
      boss = new Boss();
      bossSpawned = true;
    }

    if (playerInvulnerable) {
      invulnerabilityTimer -= deltaTime;
      if (invulnerabilityTimer <= 0) {
        playerInvulnerable = false;
      }
    }

    handleCollisions();

    compactArray(bullets);
    compactArray(bears);
    compactArray(powerUps);
    compactArray(healthPacks);
    compactArray(bossBullets);
  }

  flashEffects.forEach(flash => flash.update(deltaTime));
  explosions.forEach(exp => exp.update(deltaTime));
  compactFinishedArray(flashEffects);
  compactFinishedArray(explosions);

  bullets.forEach(b => b.draw());
  bears.forEach(b => b.draw());
  powerUps.forEach(p => p.draw());
  healthPacks.forEach(h => h.draw());
  bossBullets.forEach(b => b.draw());
  if (boss) boss.draw();
  if (player) player.draw(deltaTime);

  explosions.forEach(e => e.draw());
  flashEffects.forEach(f => f.draw());

  if (screenFlashAlpha > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${screenFlashAlpha})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    screenFlashAlpha -= 0.05;
  }

  drawGameUI();

  if (gameState !== 'over') {
    gameLoopId = requestAnimationFrame(gameLoop);
  }
}

function startGame() {
  init();
  startScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');

  const inGameMusic = document.getElementById('game-music-control');
  if (inGameMusic) inGameMusic.style.display = 'flex';

  if (battleMusic) {
    battleMusic.currentTime = 0;
    playMusic('battle');
  }

  lastTime = performance.now();
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  gameLoop(lastTime);
}

function backToHome() {
  init();
  gameState = 'over';
  if (gameLoopId) cancelAnimationFrame(gameLoopId);

  const inGameMusic = document.getElementById('game-music-control');
  if (inGameMusic) inGameMusic.style.display = 'none';

  playMusic('menu');
  startScreen.classList.remove('hidden');
  resultScreen.classList.add('hidden');
}

function drawGameUI() {
  ctx.font = 'bold ' + uiFont + 'px "Arial Black", "Helvetica", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;

  const iconSize = 24;
  const noteSize = 16;
  ctx.textAlign = 'left';

  // Baris 1: Nyawa (Vector Heart Canvas - Bebas Emoji)
  drawVectorHeart(ctx, 22, 50, 18, 16, '#ff4081');

  const currentHealthValue = (currentLevel === 2) ? playerHealth : player.characterCount;
  let healthText = currentHealthValue.toString();
  if (deathCount > 0) {
    healthText += '-' + deathCount.toString();
  }
  ctx.fillStyle = '#ffffff';
  ctx.strokeText(healthText, 38 - uiAdjust, 62);
  ctx.fillText(healthText, 38 - uiAdjust, 62);

  // Baris 2: Peluru
  if (currentLevel === 2) {
    const bulletImage = assetImages[`bullet${player.currentCharacterType}`];
    if (bulletImage) {
      ctx.drawImage(bulletImage, 10, 75, noteSize, noteSize * 1.5);
    }
    let bulletStr = playerBulletStreams.toString();
    if (playerBulletStreams === maxPlayerBulletStreams) {
      bulletStr += " max!";
    }
    ctx.strokeText(bulletStr, 36 - uiAdjust, 92);
    ctx.fillText(bulletStr, 36 - uiAdjust, 92);
  }

  // Kanan Atas: Skor & Combo
  if (assetImages.scoreIcon) {
    ctx.drawImage(assetImages.scoreIcon, canvasWidth - 40, 45, iconSize, iconSize);
    ctx.textAlign = 'right';
    const scoreText = escapedBearCount > 0 ? `${bearKillCount}-${escapedBearCount}` : bearKillCount.toString();
    ctx.strokeText(scoreText, canvasWidth - 55, 62);
    ctx.fillText(scoreText, canvasWidth - 55, 62);

    ctx.drawImage(assetImages.comboIcon, canvasWidth - 52, 75, 50, 22);
    ctx.strokeText(comboCount.toString(), canvasWidth - 55, 92);
    ctx.fillText(comboCount.toString(), canvasWidth - 55, 92);
  }

  // Waktu dan Tingkat Kesulitan
  if (gameState === 'playing' || gameState === 'bossDying') {
    const barWidth = canvasWidth * 0.6;
    const barX = canvasWidth / 2 - barWidth / 2;
    ctx.font = 'bold ' + uiFont + 'px "Arial", sans-serif';

    const gameTime = performance.now() - gameStartTime;
    const timeText = formatGameTime(gameTime);
    ctx.textAlign = 'right';
    ctx.strokeText(timeText, barX - 30, 25);
    ctx.fillText(timeText, barX - 30, 25);

    const texts = languages[currentLang];
    const modeText = texts[currentDifficulty].replace(texts.mode, '');
    ctx.textAlign = 'left';
    ctx.strokeText(modeText, barX + barWidth + 15, 25);
    ctx.fillText(modeText, barX + barWidth + 15, 25);
  }
}

function gameOver(isWin) {
  if (gameState === 'over') return;
  gameState = 'over';
  playMusic('end');
  cancelAnimationFrame(gameLoopId);
  const gameTime = performance.now() - gameStartTime;

  const killScore = Math.max(0, (bearKillCount - escapedBearCount) * 20);
  const comboScore = maxComboCount * 20;
  const deathPenalty = currentDifficulty === 'endless' ? deathCount * 10 : deathCount * 50;
  const fullComboScore = (isWin && (maxComboCount === bearKillCount)) ? maxComboCount * 10 : 1;
  const bossScore = boss ? (boss.maxHealth - boss.health) * 5 : 0;
  const bearRatio = bearKillCount > 0 ? bearKillCount / (bearKillCount + escapedBearCount) : 0;
  const bossRatio = boss ? (boss.maxHealth - boss.health) / boss.maxHealth : 0;
  const playerRatio = (currentLevel === 1) ? (player.characterCount / maxPlayerCharacter) : (playerBulletStreams / maxPlayerBulletStreams);
  const playerRatioScore = isWin ? playerRatio * 50 : playerRatio * 4;
  const bulletRatio = destroyedBulletCount > 0 ? destroyedBulletCount / (destroyedBulletCount + escapedBulletCount) : 0;
  const bulletRatioScore = isWin ? bulletRatio * 1000 : bulletRatio * 20;
  const itemRatio = collectedItemCount > 0 ? collectedItemCount / (collectedItemCount + escapedItemCount) : 0;
  const itemRatioScore = isWin ? itemRatio * 1000 : itemRatio * 5;
  const gameSeconds = Math.floor(gameTime / 1000);
  const timeScore = ((currentDifficulty === 'endless' && gameSeconds > 60) ? (gameSeconds - 60) * 50 : gameSeconds);
  const resultRank = getResultRank(bearRatio, bossRatio, deathCount, gameSeconds);
  const finalScore = Math.floor(Math.max(0, killScore + bossScore + comboScore - deathPenalty + fullComboScore
    + playerRatioScore + bulletRatioScore + itemRatioScore + timeScore));

  try {
    gameStat(getPlayerId(), currentLevel, currentDifficulty, fps, isWin ? 1 : 0, resultRank, gameSeconds, bearKillCount, escapedBearCount, maxComboCount, (currentLevel === 2 ? playerHealth : player.characterCount),
      deathCount, roundTo2(bossRatio), roundTo2(bulletRatio), roundTo2(itemRatio), finalScore);
  } catch (e) {
    // Abaikan error jaringan
  }

  showScoreAnimation(isWin, killScore, maxComboCount, finalScore, gameTime, bearRatio, deathCount, resultRank);
}

function showScoreAnimation(isWin, killScore, maxComboCount, finalScore, gameTime, bearRatio, deathCount, resultRank) {
  const texts = languages[currentLang];
  resultScreen.classList.remove('hidden');

  const diffEl = document.getElementById('result-diff');
  const timeEl = document.getElementById('result-time');
  const killEl = document.getElementById('result-kill');
  const comboTextEl = document.getElementById('result-combo-text');
  const totalEl = document.getElementById('result-total-text');
  const imageEl = document.getElementById('result-image');
  const messageEl = document.getElementById('result-message');
  const restartBtn = document.getElementById('restart-button');

  if (isWin) {
    imageEl.src = assetImages.win.src;
    imageEl.alt = 'YOU WIN';
    messageEl.textContent = texts.winMessage;
    restartBtn.textContent = texts.playAgain;
  } else {
    imageEl.src = assetImages.defeat.src;
    imageEl.alt = 'DEFEAT';
    messageEl.textContent = texts.defeatMessage;
    restartBtn.textContent = texts.retry;
  }

  document.getElementById('home-button').textContent = texts.backToHome;
  diffEl.textContent = `${texts['level' + currentLevel]}: ${texts[currentDifficulty]}`;
  timeEl.textContent = `${texts.gameTime}: ${formatGameTime(gameTime)}`;

  const animateLine = (targetValue, label, element, callback) => {
    const duration = 1000;
    const frameRate = 60;
    const totalFrames = (duration / 1000) * frameRate;
    let frame = 0;

    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(targetValue * easeProgress);
      element.textContent = `${label}:  ${currentValue}`;

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(callback, 100);
      }
    };
    animate();
  };

  setTimeout(() => {
    animateLine(killScore, texts.killScore, killEl, () => {
      animateLine(maxComboCount, texts.maxCombo, comboTextEl, () => {
        if (bearRatio === 1) {
          document.getElementById('result-fullcombo').style.display = 'block';
        }
        animateLine(finalScore, texts.totalScore, totalEl, () => {
          if (resultRank) {
            const rankImg = document.getElementById('result-rank');
            rankImg.style.display = 'block';
            rankImg.src = IMG_PATH + assets['rank_' + resultRank];
          }
        });
      });
    });
  }, 100);
}

function getResultRank(bearRatio, bossRatio, deathCount, gameSeconds) {
  if (currentDifficulty === 'endless') {
    if (gameSeconds < 30) return "d";
    if (gameSeconds < 60) return "c";
    if (gameSeconds < 90) return "cp";
    if (gameSeconds < 120) return "b";
    if (gameSeconds < 180) return "bp";
    if (gameSeconds < 240) return "a";
    if (gameSeconds < 300) return "ap";
    if (gameSeconds < 450) return "s";
    if (gameSeconds < 600) return "sp";
    if (gameSeconds < 900) return "ss";
    if (gameSeconds < 1800) return "ssp";
    return "sss";
  }

  if (bossRatio <= 0.1) return 'd';
  if (bossRatio <= 0.4) return 'c';
  if (bossRatio <= 0.6) return 'cp';
  if (bossRatio <= 0.8) return 'b';
  if (bossRatio < 1) return 'bp';

  if (bearRatio <= 0.6) return 'a';
  if (bearRatio <= 0.8) return 'ap';
  if (bearRatio < 1) return 's';

  if (currentLevel === 1) {
    if (deathCount >= 9) return 'sp';
    if (deathCount >= 6) return 'ss';
    if (deathCount >= 3) return 'ssp';
    return 'sss';
  } else {
    if (deathCount >= 8) return 'sp';
    if (deathCount >= 4) return 'ss';
    if (deathCount >= 1) return 'ssp';
    return 'sss';
  }
}

function resizeCanvas() {
  if (!container || !canvas) return;
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;
  if (player) {
    player.width = canvasWidth / 7;
    player.height = player.width * 1.2;
  }
  if (canvasWidth <= 390) {
    uiFont = 12;
    uiAdjust = 5;
  } else if (canvasWidth <= 450) {
    uiFont = 14;
    uiAdjust = 2;
  }
}

function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
}

function getTouchPos(evt) {
  const rect = canvas.getBoundingClientRect();
  return { x: evt.touches[0].clientX - rect.left, y: evt.touches[0].clientY - rect.top };
}

function handleInputStart(x, y) {
  isShooting = true;
  shootTimer = shootInterval;
}

function handleInputMove(x, y) {
  targetPos.x = x;
  targetPos.y = y;
}

function handleInputEnd() {
  isShooting = false;
  shootTimer = 0;
}

function updatePlayerPosition(deltaTime) {
  const speed = 2400;
  const dx = targetPos.x - player.x;
  const dy = targetPos.y - player.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > 1) {
    const moveDist = Math.min((speed * deltaTime) / 1000, distance);
    player.x += (dx / distance) * moveDist;
    player.y += (dy / distance) * moveDist;
  }

  const totalWidth = player.width * player.characterCount;
  player.x = Math.max(totalWidth / 2, Math.min(canvasWidth - totalWidth / 2, player.x));
  player.y = Math.max(0, Math.min(canvasHeight - player.height, player.y));
}

function triggerScreenShake() {
  if (!container) return;
  container.classList.remove('shake-active');
  void container.offsetWidth;
  container.classList.add('shake-active');
}

function drawVectorHeart(context, x, y, width, height, color) {
  context.save();
  context.fillStyle = color;
  context.strokeStyle = '#000000';
  context.lineWidth = 1.5;
  context.beginPath();
  const topCurveHeight = height * 0.35;
  context.moveTo(x, y + topCurveHeight);
  context.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);
  context.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + height, x, y + height);
  context.bezierCurveTo(x, y + height, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight);
  context.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);
  context.closePath();
  context.stroke();
  context.fill();
  context.restore();
}

function initCustomLevelSelector() {
  const levelBtns = document.querySelectorAll('.level-btn');
  const levelInput = document.getElementById('level-selector');
  levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      levelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lvl = btn.getAttribute('data-level');
      if (levelInput) levelInput.value = lvl;
      currentLevel = parseInt(lvl, 10);
    });
  });
}

// Inisialisasi Aplikasi Saat Halaman Selesai Dimuat
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  container = document.getElementById('game-container');

  startScreen = document.getElementById('start-screen');
  resultScreen = document.getElementById('result-screen');
  startButton = document.getElementById('start-button');
  restartButton = document.getElementById('restart-button');
  homeButton = document.getElementById('home-button');
  fpsDisplay = document.getElementById('fps-display');

  if (startButton) startButton.addEventListener('click', startGame);
  if (restartButton) restartButton.addEventListener('click', startGame);
  if (homeButton) homeButton.addEventListener('click', backToHome);

  window.addEventListener('resize', resizeCanvas);

  updateDifficultyButtons();
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentDifficulty = btn.getAttribute('data-text');
      updateDifficultyButtons();
    });
  });

  initCustomLevelSelector();

  // Input Event Listeners
  container.addEventListener('mousedown', e => {
    const pos = getMousePos(e);
    handleInputStart(pos.x, pos.y);
  });

  container.addEventListener('mousemove', e => {
    const pos = getMousePos(e);
    handleInputMove(pos.x, pos.y);
  });

  container.addEventListener('mouseup', handleInputEnd);

  container.addEventListener('touchstart', e => {
    if (e.target.tagName !== 'CANVAS') return;
    e.preventDefault();
    const pos = getTouchPos(e);
    handleInputStart(pos.x, pos.y);
  }, { passive: false });

  container.addEventListener('touchmove', e => {
    if (e.target.tagName !== 'CANVAS') return;
    e.preventDefault();
    const pos = getTouchPos(e);
    handleInputMove(pos.x, pos.y);
  }, { passive: false });

  container.addEventListener('touchend', e => {
    if (e.target.tagName !== 'CANVAS') return;
    e.preventDefault();
    handleInputEnd();
  }, { passive: false });

  container.addEventListener('touchcancel', e => {
    if (e.target.tagName !== 'CANVAS') return;
    e.preventDefault();
    handleInputEnd();
  }, { passive: false });

  // Init Modul Lain
  sendStat();
  initUsernameModal();
  setIndexImage();
  createMusic();
  setLanguage();
  initFPS();
  initLeaderboard();
  loadData();
  resizeCanvas();
});
