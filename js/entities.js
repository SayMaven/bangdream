// Class Entitas Game

// Class Pemain
class Player {
  constructor() {
    this.width = canvasWidth / 7;
    this.height = this.width * 1.2;
    this.x = canvasWidth / 2;
    this.y = canvasHeight - this.height;
    this.characterCount = 1;
    this.animTimer = 0;
    this.isDead = false;
    this.defeatCharacters = [];
    this.characters = [1];
    this.deadCharacterType = 1;
    this.currentCharacterType = 1;
    this.flashTimer = 0;
  }

  draw(deltaTime) {
    this.animTimer += deltaTime;
    if (this.flashTimer > 0) this.flashTimer -= deltaTime;

    if (this.isDead) {
      const currentImage = assetImages[`defeat${this.deadCharacterType}`];
      if (currentImage) {
        const aspectRatio = currentImage.naturalWidth / currentImage.naturalHeight;
        const defeatWidth = this.height * 1.2;
        const defeatHeight = defeatWidth / aspectRatio;
        const drawX = this.x - defeatWidth / 2;
        const drawY = this.y + this.height - defeatHeight;
        ctx.drawImage(currentImage, drawX, drawY, defeatWidth, defeatHeight);
      }
    } else if (currentLevel === 2) {
      // Level 2: Karakter tunggal
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + this.height, this.width * 0.3, this.width * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();

      let characterImage;
      const isFrame2 = Math.floor(this.animTimer / 400) % 2 === 1;
      if (this.currentCharacterType === 2) {
        characterImage = isFrame2 ? assetImages.player4 : assetImages.player3;
      } else if (this.currentCharacterType === 3) {
        characterImage = isFrame2 ? assetImages.player6 : assetImages.player5;
      } else {
        characterImage = isFrame2 ? assetImages.player2 : assetImages.player1;
      }

      if (characterImage) {
        ctx.drawImage(characterImage, this.x - this.width / 2, this.y, this.width, this.height);
      }
    } else {
      // Level 1: Formasi karakter
      const totalWidth = this.width * this.characterCount;
      const startX = this.x - totalWidth / 2;

      for (let i = 0; i < this.characterCount; i++) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(startX + i * this.width + this.width / 2, this.y + this.height, this.width * 0.3, this.width * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        let characterImage;
        const characterType = this.characters[i];
        const isFrame2 = Math.floor(this.animTimer / 400) % 2 === 1;

        if (characterType === 2) {
          characterImage = isFrame2 ? assetImages.player4 : assetImages.player3;
        } else if (characterType === 3) {
          characterImage = isFrame2 ? assetImages.player6 : assetImages.player5;
        } else {
          characterImage = isFrame2 ? assetImages.player2 : assetImages.player1;
        }

        if (characterImage) {
          ctx.drawImage(characterImage, startX + i * this.width, this.y, this.width, this.height);
        }
      }

      this.defeatCharacters.forEach(defeatChar => {
        const defeatImage = assetImages[`defeat${defeatChar.characterIndex}`];
        if (defeatImage) {
          const aspectRatio = defeatImage.naturalWidth / defeatImage.naturalHeight;
          const defeatWidth = this.height * 1.2;
          const defeatHeight = defeatWidth / aspectRatio;
          const drawX = defeatChar.x - defeatWidth / 2;
          const drawY = this.y + this.height - defeatHeight;

          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.ellipse(defeatChar.x, this.y + this.height, defeatWidth * 0.3, defeatWidth * 0.15, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.drawImage(defeatImage, drawX, drawY, defeatWidth, defeatHeight);
        }
      });
    }
  }

  shoot() {
    if (currentLevel === 1) {
      const totalWidth = this.width * this.characterCount;
      const startX = this.x - totalWidth / 2;
      for (let i = 0; i < this.characterCount; i++) {
        const bulletX = startX + i * this.width + this.width / 2;
        const bulletType = this.characters[i];
        bullets.push(new Bullet(bulletX, this.y, bulletType));
      }
    } else {
      const spacing = (this.width / (playerBulletStreams + 1)) * 1.5;

      if (this.currentCharacterType === 2 && playerBulletStreams >= 4) {
        const halfStreams = Math.floor(playerBulletStreams / 2);
        for (let i = 0; i < halfStreams; i++) {
          const bulletX = this.x - this.width / 2 + spacing * (i + 1);
          bullets.push(new Bullet(bulletX, this.y, this.currentCharacterType));
        }
        const remainingStreams = playerBulletStreams - halfStreams;
        for (let i = 0; i < remainingStreams; i++) {
          const angle = (i + 1) * (Math.PI / 2) / (remainingStreams + 1);
          bullets.push(new Bullet(this.x, this.y, this.currentCharacterType, true, i % 2 === 0 ? (-Math.PI / 2 - angle) : (-Math.PI / 2 + angle)));
        }
      } else {
        for (let i = 0; i < playerBulletStreams; i++) {
          const bulletX = this.x - this.width / 2 + spacing * (i + 1);
          bullets.push(new Bullet(bulletX, this.y, this.currentCharacterType));
        }
      }
    }
  }

  updateCharacterCount() {
    if (currentLevel === 1) {
      if (killsSinceLastLife >= 5 && this.characterCount < maxPlayerCharacter) {
        player.characterCount++;
        const nextType = Math.floor(Math.random() * 3) + 1;
        this.characters.push(nextType);
        killsSinceLastLife = 0;
      }
    }
  }

  updateDefeatCharacters(deltaTime) {
    let slow = 0;
    for (let fast = 0; fast < this.defeatCharacters.length; fast++) {
      this.defeatCharacters[fast].timer -= deltaTime;
      if (this.defeatCharacters[fast].timer > 0) {
        this.defeatCharacters[slow++] = this.defeatCharacters[fast];
      }
    }
    this.defeatCharacters.length = slow;
  }
}

// Class Peluru
class Bullet {
  constructor(x, y, bulletType = 1, isSplash = false, angle = 0) {
    this.width = canvasWidth / 18;
    this.height = this.width * 1.6;
    this.x = x - this.width / 2;
    this.y = y;
    this.speed = canvasHeight * 1.5;
    this.image = assetImages[`bullet${bulletType}`];
    this.markedForDeletion = false;
    this.bulletType = bulletType;
    this.isSplash = isSplash;
    this.angle = angle;

    if (currentLevel === 2) {
      if (bulletType === 1) {
        this.damage = 5;
        this.bearDamage = 5;
      } else if (bulletType === 2) {
        this.damage = 3;
        this.bearDamage = 10;
      } else if (bulletType === 3) {
        this.damage = 2;
        this.bearDamage = 2;
      }
    } else {
      this.damage = 1;
      this.bearDamage = 1;
    }
  }

  update(deltaTime) {
    if (this.isSplash) {
      this.x += Math.cos(this.angle) * this.speed * (deltaTime / 1000);
      this.y += Math.sin(this.angle) * this.speed * (deltaTime / 1000);
    } else {
      this.y -= this.speed * (deltaTime / 1000);
    }
    if (this.y < -this.height || this.x < -this.width || this.x > canvasWidth) {
      this.markedForDeletion = true;
    }
  }

  draw() {
    if (this.image) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }
}

// Class Beruang Musuh
class Bear {
  constructor(x, y) {
    this.width = canvasWidth / 6;
    this.height = this.width;
    this.x = x;
    this.y = y;
    this.baseSpeed = canvasHeight * 0.3;
    this.speed = this.baseSpeed;
    this.health = currentLevel === 2 ? 15 : 5;
    this.animTimer = 0;
    this.flashTimer = 0;
    this.markedForDeletion = false;
    this.slowEffect = false;
    this.slowTimer = 0;
  }

  applySlow() {
    if (!this.slowEffect) {
      this.slowEffect = true;
      this.speed = this.baseSpeed * 0.25;
      this.slowTimer = 3000;
    }
  }

  update(deltaTime) {
    if (this.slowEffect) {
      this.slowTimer -= deltaTime;
      if (this.slowTimer <= 0) {
        this.slowEffect = false;
        this.speed = this.baseSpeed;
      }
    }

    this.y += this.speed * (deltaTime / 1000);
    this.animTimer += deltaTime;
    if (this.flashTimer > 0) this.flashTimer -= deltaTime;

    if (this.y > canvasHeight) {
      this.markedForDeletion = true;
      comboCount = 0;
      escapedBearCount++;
    }
  }

  draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + this.height, this.width * 0.3, this.width * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    const currentImage = Math.floor(this.animTimer / 400) % 2 === 0 ? assetImages.bear1 : assetImages.bear2;
    if (currentImage) {
      ctx.drawImage(currentImage, this.x, this.y, this.width, this.height);
    }
  }
}

// Class Item Power Up
class PowerUp {
  constructor(x, y, type) {
    this.width = canvasWidth / 8;
    this.height = this.width;
    this.x = x;
    this.y = y;
    this.speed = canvasHeight * 0.2;
    this.type = type;
    this.markedForDeletion = false;
  }

  update(deltaTime) {
    this.y += this.speed * (deltaTime / 1000);
    if (this.y > canvasHeight) {
      this.markedForDeletion = true;
      escapedItemCount++;
    }
  }

  draw() {
    const image = assetImages[`chara${this.type}`];
    if (image) {
      ctx.drawImage(image, this.x, this.y, this.width, this.height);
    }
  }
}

// Class Paket Darah
class HealthPack {
  constructor(x, y) {
    this.width = canvasWidth / 12;
    this.height = canvasWidth / 8;
    this.x = x;
    this.y = y;
    this.speed = canvasHeight * 0.2;
    this.markedForDeletion = false;
  }

  update(deltaTime) {
    this.y += this.speed * (deltaTime / 1000);
    if (this.y > canvasHeight) {
      this.markedForDeletion = true;
      escapedItemCount++;
    }
  }

  draw() {
    if (assetImages.blood) {
      ctx.drawImage(assetImages.blood, this.x, this.y, this.width, this.height);
    }
  }
}

// Class Peluru Bos
class BossBullet {
  constructor(x, y, targetX, targetY) {
    this.width = canvasWidth / 20;
    this.height = this.width;
    this.x = x;
    this.y = y;
    this.speedx = canvasHeight * 0.28;
    this.speedy = canvasHeight * 0.26;
    const angle = Math.atan2(targetY - y, targetX - x);
    this.vx = Math.cos(angle) * this.speedx;
    this.vy = Math.sin(angle) * this.speedy;
    this.markedForDeletion = false;
  }

  update(deltaTime) {
    this.x += this.vx * (deltaTime / 1000);
    this.y += this.vy * (deltaTime / 1000);
    if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
      this.markedForDeletion = true;
      escapedBulletCount++;
    }
  }

  draw() {
    if (assetImages.bullet4) {
      ctx.drawImage(assetImages.bullet4, this.x, this.y, this.width, this.height);
    }
  }
}

// Class Bos
class Boss {
  constructor() {
    this.width = canvasWidth / 3;
    this.height = this.width * 1.1;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = -this.height;
    this.targetY = canvasHeight * 0.1;
    this.baseSpeed = canvasHeight * 0.15;
    this.speedx = this.baseSpeed;
    this.speedy = this.baseSpeed;
    this.directionX = 1;
    this.phase = 1;
    this.gravity = canvasHeight * 0.1;
    this.bounceTargetY = canvasHeight * 0.3;
    this.roamTimer = 0;
    this.roamDuration = 0;
    this.animTimer = 0;
    this.attackState = 'normal';
    this.attackTimer = 0;
    this.shootTimer = 0;
    this.flashTimer = 0;
    this.bulletTimer = 0;
    this.isShooting = false;
    this.bulletRows = 0;
    this.shootedNumber = 0;
    this.bulletsNumber = 0;
    this.slowEffect = false;
    this.slowTimer = 0;
    this.downFactor = 0;
    this.bounceFactor = 0;
    this.bulletFactor = 0;
    this.bloodFactor = 0;

    let bossHealth = 0;
    if (currentDifficulty === 'easy') {
      bossHealth = (currentLevel === 2) ? 4500 : 800;
      this.downFactor = 0.7;
      this.bounceFactor = 0.55;
      this.bulletFactor = 3;
      this.bloodFactor = 0.3;
      this.bulletRows = 1;
    } else if (currentDifficulty === 'normal' || currentDifficulty === 'endless') {
      bossHealth = (currentLevel === 2) ? 9000 : 1400;
      this.downFactor = 1;
      this.bounceFactor = 0.65;
      this.bulletFactor = 5;
      this.bloodFactor = 0.5;
      this.bulletRows = 1;
    } else if (currentDifficulty === 'hard') {
      bossHealth = (currentLevel === 2) ? 13500 : 2800;
      this.downFactor = 1.3;
      this.bounceFactor = 0.8;
      this.bulletFactor = 7;
      this.bloodFactor = 0.7;
      this.bulletRows = 1;
    }
    this.health = bossHealth;
    this.maxHealth = bossHealth;
  }

  applySlow() {
    if (!this.slowEffect) {
      this.slowEffect = true;
      this.speedx = this.baseSpeed * 0.06;
      this.speedy = this.baseSpeed * 0.06;
      this.slowTimer = 3000;
    }
  }

  update(deltaTime, gameTime) {
    if (this.slowEffect) {
      this.slowTimer -= deltaTime;
      if (this.slowTimer <= 0) {
        this.slowEffect = false;
        this.speedx = this.baseSpeed;
        this.speedy = this.baseSpeed;
      }
    }

    const deltaSeconds = deltaTime / 1000;
    this.animTimer += deltaTime;
    if (this.flashTimer > 0) this.flashTimer -= deltaTime;

    if (currentDifficulty === 'normal' || currentDifficulty === 'endless') {
      if (this.health <= this.maxHealth * 0.2) this.bulletRows = 2;
    } else if (currentDifficulty === 'hard') {
      if (this.health <= this.maxHealth * 0.15) this.bulletRows = 3;
      else if (this.health <= this.maxHealth * 0.35) this.bulletRows = 2;
    }

    const distanceToPlayer = player.y - (this.y + this.height);
    if (distanceToPlayer >= 0 && distanceToPlayer <= player.height * 0.8 &&
        this.attackState === 'normal' && this.speedy >= 0) {
      this.attackState = 'raising';
      this.attackTimer = 300;
    }

    if (this.attackState === 'raising') {
      this.attackTimer -= deltaTime;
      if (this.attackTimer <= 0) {
        this.attackState = 'punching';
        this.attackTimer = 300;
      }
    } else if (this.attackState === 'punching') {
      this.attackTimer -= deltaTime;
      if (this.attackTimer <= 0) {
        this.attackState = 'normal';
      }
    }

    if (currentLevel === 2) {
      if ((this.health <= this.maxHealth * this.bloodFactor || (currentDifficulty === 'endless' && gameTime > 20000)) && this.phase === 1) {
        this.phase = 2;
      }

      if (this.phase === 1) {
        if (this.y < this.targetY) {
          this.y += this.speedy * deltaSeconds;
        } else {
          this.x += this.speedx * this.directionX * deltaSeconds;
          if (this.x <= 0) {
            this.x = 0;
            this.directionX = 1;
          }
          if (this.x + this.width >= canvasWidth) {
            this.x = canvasWidth - this.width;
            this.directionX = -1;
          }
        }
      } else {
        const isRoaming = this.roamTimer > 0 && this.roamTimer < this.roamDuration;
        if (!isRoaming) {
          this.speedy += this.gravity * deltaSeconds * this.downFactor;
          this.y += this.speedy * deltaSeconds;
          if (this.y + this.height >= canvasHeight) {
            this.y = canvasHeight - this.height;
            this.speedy = -(Math.random() * canvasHeight * 0.8 + canvasHeight * 0.2);
            this.bounceTargetY = Math.random() * canvasHeight * this.bounceFactor - canvasHeight * 0.35;
            if (this.bounceTargetY < 0) this.bounceTargetY = 0;
            this.roamDuration = Math.random() * 2000 + 4000;
            this.roamTimer = 0;
          }
          if (this.speedy < 0 && this.y <= this.bounceTargetY) {
            this.speedy = 0;
            this.roamTimer = 1;
          }
        } else {
          this.roamTimer += deltaTime;
          this.x += this.speedx * this.directionX * deltaSeconds;
          if (this.x <= 0) {
            this.x = 0;
            this.directionX = 1;
          }
          if (this.x + this.width >= canvasWidth) {
            this.x = canvasWidth - this.width;
            this.directionX = -1;
          }
          if (this.roamTimer >= this.roamDuration) {
            this.roamTimer = 0;
            this.roamDuration = 0;
          }
        }
      }

      this.shootTimer += deltaTime;
      if (!this.isShooting && this.shootTimer > 4000) {
        this.isShooting = true;
        this.bulletTimer = 0;
        this.shootTimer = 0;
        this.shootedNumber = 0;
        this.bulletsNumber = Math.floor(Math.random() * 3) + this.bulletFactor;
      }

      if (this.isShooting) {
        this.bulletTimer += deltaTime;
        if (this.bulletTimer >= 200) {
          const spacing = this.width / (this.bulletRows + 1);
          for (let i = 0; i < this.bulletRows; i++) {
            const bulletX = this.x + spacing * (i + 1);
            bossBullets.push(new BossBullet(bulletX, this.y + this.height / 2, player.x, player.y));
          }
          this.bulletTimer = 0;
          this.shootedNumber++;
          if (this.shootedNumber >= this.bulletsNumber) {
            this.isShooting = false;
          }
        }
      }
    } else {
      if ((this.health <= this.maxHealth * 0.75 || gameTime > 15000) && this.phase === 1) {
        this.phase = 2;
      }
      if (this.phase === 1) {
        if (this.y < this.targetY) {
          this.y += this.speedy * deltaSeconds;
        } else {
          this.x += this.speedx * this.directionX * deltaSeconds;
          if (this.x <= 0) {
            this.x = 0;
            this.directionX = 1;
          }
          if (this.x + this.width >= canvasWidth) {
            this.x = canvasWidth - this.width;
            this.directionX = -1;
          }
        }
      } else {
        const targetX = player.x - this.width / 2;
        if (Math.abs(this.x - targetX) > 2) {
          this.x += (targetX - this.x) * 0.02;
        }
        this.speedy += this.gravity * deltaSeconds * this.downFactor;
        this.y += this.speedy * deltaSeconds;
        if (this.y + this.height >= canvasHeight) {
          this.y = canvasHeight - this.height;
          this.speedy = -(Math.random() * canvasHeight * 0.8 + canvasHeight * 0.2);
          this.bounceTargetY = Math.random() * canvasHeight * this.bounceFactor - canvasHeight * 0.35;
          if (this.bounceTargetY < 0) this.bounceTargetY = 0;
        }
        if (this.speedy < 0 && this.y <= this.bounceTargetY) {
          this.speedy = 0;
        }
      }
    }
  }

  draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + this.height, this.width * 0.4, this.width * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    let currentImage;
    if (this.attackState === 'raising') {
      currentImage = assetImages.boss3;
    } else if (this.attackState === 'punching') {
      currentImage = assetImages.boss4;
    } else {
      currentImage = Math.floor(this.animTimer / 400) % 2 === 0 ? assetImages.boss1 : assetImages.boss2;
    }

    if (currentImage) {
      ctx.drawImage(currentImage, this.x, this.y, this.width, this.height);
    }

    if (currentDifficulty === 'endless') return;

    const barWidth = canvasWidth * 0.6;
    const barHeight = 20;
    const barX = canvasWidth / 2 - barWidth / 2;
    const barY = 10;

    ctx.fillStyle = '#555';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const hpPercent = Math.max(0, this.health / this.maxHealth);
    ctx.fillStyle = hpPercent > 0.5 ? 'green' : (hpPercent > 0.2 ? 'orange' : 'red');
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

    ctx.strokeStyle = 'white';
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.font = 'bold 16px "Arial", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';

    const healthText = `${this.health} / ${this.maxHealth}`;
    ctx.strokeText(healthText, canvasWidth / 2, barY + 15);
    ctx.fillText(healthText, canvasWidth / 2, barY + 15);
  }
}

// Class Efek Ledakan
class Explosion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.init();
  }

  init() {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 4,
        life: Math.random() * 20 + 20,
        opacity: 1,
        color: '#ff69b4'
      });
    }
  }

  update(deltaTime) {
    const step = deltaTime / 16.67;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * step;
      p.y += p.vy * step;
      p.life -= step;
      p.opacity = Math.max(0, p.life / 30);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  isFinished() {
    return this.particles.length === 0;
  }
}

// Class Efek Kilat / Percikan Hit
class FlashEffect {
  constructor(x, y, isPlayer) {
    this.x = x;
    this.y = y;
    this.life = 15;
    this.maxLife = 15;
    this.images = [];
    this.angles = [];
    this.isPlayer = isPlayer;

    if (isPlayer) {
      this.images.push(Math.random() < 0.5 ? assetImages.fire1 : assetImages.fire2);
    } else {
      const count = Math.random() < 0.5 ? 1 : 2;
      for (let i = 0; i < count; i++) {
        this.images.push(Math.random() < 0.5 ? assetImages.flash1 : assetImages.flash2);
        this.angles.push(Math.random() * Math.PI * 2);
      }
    }
  }

  update(deltaTime) {
    this.life -= deltaTime / 16.67;
  }

  draw() {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;

    for (let i = 0; i < this.images.length; i++) {
      if (!this.images[i]) continue;
      ctx.save();
      if (!this.isPlayer) {
        const offsetX = i * 20 - 10;
        const offsetY = i * 15 - 7;
        ctx.translate(this.x + offsetX, this.y + offsetY);
        ctx.rotate(this.angles[i]);
        ctx.drawImage(this.images[i], -25, -25, 50, 50);
      } else {
        ctx.translate(this.x, this.y);
        ctx.drawImage(this.images[i], -5, -25, 50, 50);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  isFinished() {
    return this.life <= 0;
  }
}
