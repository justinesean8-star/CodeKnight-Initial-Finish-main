// ═══════════════════════════════════════════════════════
//  Python Dungeon Quest — Battle Engine (Bullet Time Action & Tilemap)
// ═══════════════════════════════════════════════════════

const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');
const combatL = document.getElementById('combatLayer');

// ── Hero Classes ──
const HEROES = {
  knight: { name:'KNIGHT', img:'knight', maxHp:120, atk:20, timerBonus:10, hints:0, critChance:0.1, speed: 200 },
  rogue:  { name:'ROGUE', img:'knight', maxHp:85, atk:25, timerBonus:0, hints:0, critChance:0.35, tint:'#bf5fff', speed: 260 },
  knight2:{ name:'ELITE KNIGHT', img:'knight2', maxHp:150, atk:25, timerBonus:5, hints:1, critChance:0.2, speed: 210 },
  fireknight: { name:'FIRE KNIGHT', img:'fireknight', maxHp:100, atk:35, timerBonus:0, hints:0, critChance:0.25, speed: 230 },
};

const ENEMY_STATS = {
  Mummy:   { hp:80,  dmg:15, scale:0.39, reward:35, speed: 60, fireRate: 1.5 },
  Ranger:  { hp:70,  dmg:15, scale:0.55, reward:45, speed: 90, fireRate: 1.0 },
  Tower:   { hp:120, dmg:25, scale:0.45, reward:60, speed: 30, fireRate: 0.8 },
  BossDemon:{ hp:300, dmg:35, scale:0.9, reward:250, speed: 85, fireRate: 1.2, meleeRange: 70 },
};


// ── Asset Paths ──
const IMG_SRC = {
  knight: '/static/image/Characters/Knight.png',
  knight2: '/static/image/Characters/Knight_1.webp',
  pistol: '/static/image/OldPistol.png',
  bullet: '/static/image/OldPistolBullet.png',
  Mummy:  '/static/image/Enemy/Mummy.png',
  Ranger: '/static/image/Enemy/Ranger.png',
  Tower:  '/static/image/Enemy/Tower.png',
  // boss frames are loaded separately via loadBossFrames()
};
const IMGS = {};
const ENEMY_ANIMS = {}; // will hold arrays of frames for complex enemies like BossDemon
const HERO_ANIMS = {};

function loadFireKnightFrames() {
  const base = '/static/image/Characters/Elementals_fire_knight_FREE_v1.1/png/fire_knight/';
  const mapping = {
    idle: {dir: '01_idle', count: 8, prefix: 'idle_'},
    run: {dir: '02_run', count: 8, prefix: 'run_'},
    attack: {dir: '05_1_atk', count: 11, prefix: '1_atk_'},
    hurt: {dir: '10_take_hit', count: 6, prefix: 'take_hit_'},
    death: {dir: '11_death', count: 13, prefix: 'death_'}
  };

  const loads = [];
  Object.entries(mapping).forEach(([anim, info]) => {
    HERO_ANIMS['fireknight'] = HERO_ANIMS['fireknight'] || {};
    HERO_ANIMS['fireknight'][anim] = [];
    for (let i = 1; i <= info.count; i++) {
      const fname = info.prefix + i + '.png';
      const src = base + info.dir + '/' + fname;
      const key = `fireknight_${anim}_${i}`;
      loads.push(loadImg(key, src).then(()=>{
        HERO_ANIMS['fireknight'][anim].push(IMGS[key]);
      }).catch(()=>{}));
    }
  });
  return Promise.all(loads);
}

function loadBossFrames() {
  // load individual frames for the boss from the provided folder structure
  const base = '/static/image/Enemy/boss_demon_slime_FREE_v1.0/individual sprites/';
  const mapping = {
    idle: {dir: '01_demon_idle', count: 6, prefix: 'demon_idle_'},
    walk: {dir: '02_demon_walk', count: 12, prefix: 'demon_walk_'},
    attack: {dir: '03_demon_cleave', count: 15, prefix: 'demon_cleave_'},
    hurt: {dir: '04_demon_take_hit', count: 5, prefix: 'demon_take_hit_'},
    death: {dir: '05_demon_death', count: 22, prefix: 'demon_death_'}
  };

  const loads = [];
  Object.entries(mapping).forEach(([anim, info]) => {
    ENEMY_ANIMS['BossDemon'] = ENEMY_ANIMS['BossDemon'] || {};
    ENEMY_ANIMS['BossDemon'][anim] = [];
    for (let i = 1; i <= info.count; i++) {
      const fname = info.prefix + i + '.png';
      const src = base + info.dir + '/' + fname;
      const key = `boss_${anim}_${i}`;
      loads.push(loadImg(key, src).then(()=>{
        ENEMY_ANIMS['BossDemon'][anim].push(IMGS[key]);
      }).catch(()=>{}));
    }
  });
  return Promise.all(loads);
}

function loadImg(key, src) {
  return new Promise(res => {
    const i = new Image();
    i.onload = () => { IMGS[key] = i; res(); };
    i.onerror = res;
    i.src = src;
  });
}

let MAP_COLS = 22;
let MAP_ROWS = 16;
let TS = 40; // Tile Size
let offsetX = 0;
let offsetY = 0;

let TMX = null;
let TMX_IMGS = {};

async function loadTmxMap() {
  const r = await fetch('/static/maps/D2.json');
  TMX = await r.json();
  
  const promises = TMX.tilesets.map(ts => {
    return new Promise(res => {
      const i = new Image();
      i.onload = () => { TMX_IMGS[ts.name] = i; res(); };
      i.onerror = res;
      i.src = '/static/image/' + ts.image.split('/').pop(); 
    });
  });
  await Promise.all(promises);
  
  MAP_COLS = TMX.width;
  MAP_ROWS = TMX.height;
  resize();
}

// ── Game State ──
const heroKey  = localStorage.getItem('hero') || 'knight';
const heroData = HEROES[heroKey] || HEROES.knight;

const difficulty = localStorage.getItem('difficulty') || 'easy';
let baseTimer = 35;
if (difficulty === 'normal') baseTimer = 50;
else if (difficulty === 'expert') baseTimer = 90;
else if (difficulty === 'insane') baseTimer = 120;

let G = {
  stage: 1,
  heroHp: heroData.maxHp,
  heroExp: 0, heroLevel: 1, expToNext: 100,
  questionId: null, hint: '',
  hintsLeft: heroData.hints,
  difficulty: difficulty,
  timerMax: baseTimer + heroData.timerBonus,
  timerLeft: baseTimer + heroData.timerBonus,
  timerInterval: null,
  busy: false,
  timeScale: 1.0,
};

// ── Animation & Physics State ──
let A = {
  heroX: 11 * 40, heroY: 10 * 40, // Default spawn in center (will adjust to TS on resize)
  heroDirX: 1,
  heroShake:0,
  heroFlash:0,
  heroAnim: 'idle',
  bullets:[], particles:[],
  heroWalk:0,
  torchFlicker: Math.random() * Math.PI * 2,
  lastTime: performance.now(),
  enemies: [],
};

// ── Input State ──
const keys = { w:false, a:false, s:false, d:false, ArrowUp:false, ArrowDown:false, ArrowLeft:false, ArrowRight:false };
let editorFocused = false;

window.addEventListener('keydown', e => { if (keys.hasOwnProperty(e.key)) keys[e.key] = true; });
window.addEventListener('keyup', e => { if (keys.hasOwnProperty(e.key)) keys[e.key] = false; });

const codeEditor = document.getElementById('codeEditor');
codeEditor.addEventListener('focus', () => {
  editorFocused = true;
  G.timeScale = 0.15;
  document.getElementById('arena').classList.add('bullet-time-active');
  document.getElementById('bulletTimeOverlay').classList.remove('hidden');
});
codeEditor.addEventListener('blur', () => {
  editorFocused = false;
  G.timeScale = 1.0;
  document.getElementById('arena').classList.remove('bullet-time-active');
  document.getElementById('bulletTimeOverlay').classList.add('hidden');
});

codeEditor.addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;
    this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
    this.selectionStart = this.selectionEnd = start + 4;
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;
    const value = this.value;
    const lines = value.substring(0, start).split('\n');
    const lastLine = lines[lines.length - 1];
    const match = lastLine.match(/^\s*/);
    let indent = match ? match[0] : "";
    if (lastLine.trim().endsWith(':')) {
        indent += "    ";
    }
    this.value = value.substring(0, start) + "\n" + indent + value.substring(end);
    this.selectionStart = this.selectionEnd = start + 1 + indent.length;
  }
});


// ── Canvas resize ──
function resize() {
  const ar = document.getElementById('arena');
  canvas.width  = ar.clientWidth;
  canvas.height = ar.clientHeight;
  
  // Calculate tile size and centering offsets
  TS = Math.floor(Math.min(canvas.width / MAP_COLS, canvas.height / MAP_ROWS));
  offsetX = Math.floor((canvas.width - MAP_COLS * TS) / 2);
  offsetY = Math.floor((canvas.height - MAP_ROWS * TS) / 2);

  // If first time, adjust positions
  if (A.heroX === 11 * 40) {
    A.heroX = 11 * TS;
    A.heroY = 10 * TS;
  }
}
window.addEventListener('resize', resize);

// ── Tilemap Rendering ──
function drawBg() {
  ctx.fillStyle = '#080b14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!TMX) return;

  TMX.layers.forEach(layer => {
    if (layer.name === 'Meta') return;
    
    for (let i = 0; i < layer.data.length; i++) {
      let gid = layer.data[i] & 0x0FFFFFFF;
      if (gid === 0) continue;
      
      let ts = null;
      for (let j = TMX.tilesets.length - 1; j >= 0; j--) {
        if (gid >= TMX.tilesets[j].firstgid) { ts = TMX.tilesets[j]; break; }
      }
      if (!ts) continue;
      
      const img = TMX_IMGS[ts.name];
      if (!img) continue;
      
      const localId = gid - ts.firstgid;
      const cols = Math.floor(ts.imagewidth / ts.tilewidth);
      const srcX = (localId % cols) * ts.tilewidth;
      const srcY = Math.floor(localId / cols) * ts.tileheight;
      
      const c = i % TMX.width;
      const r = Math.floor(i / TMX.width);
      
      const destX = offsetX + c * TS;
      const drawW = TS * (ts.tilewidth / TMX.tilewidth);
      const drawH = TS * (ts.tileheight / TMX.tileheight);
      const destY = offsetY + r * TS + TS - drawH; // Anchor bottom-left
      
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, srcX, srcY, ts.tilewidth, ts.tileheight, destX, destY, drawW, drawH);
    }
  });
}

// ── Collision Detection ──
// x = center, y = feet (bottom of character), radius = half-width, bodyH = height above feet to check
function isSolid(x, y, radius = 0, bodyH = null) {
  if (!TMX) return true;

  const h = bodyH !== null ? bodyH : TS;

  const colMin = Math.floor((x - radius) / TS);
  const colMax = Math.floor((x + radius) / TS);
  const rowMin = Math.floor((y - h) / TS);
  // +1 so the sweep catches roomVerge tiles whose visual bottom
  // extends one row below their data row (they are 1.5x tile height).
  const rowMax = Math.floor(y / TS) + 1;

  const checkTile = (layer, r, c) => {
    if (!layer) return false;
    if (c < 0 || c >= MAP_COLS || r < 0 || r >= MAP_ROWS) return true;
    return (layer.data[r * MAP_COLS + c] & 0x0FFFFFFF) !== 0;
  };

  const metaLayer      = TMX.layers.find(l => l.name === 'Meta' || l.name === 'meta');
  const roomVergeLayer = TMX.layers.find(l => l.name === 'roomVerge');
  const boxLayer       = TMX.layers.find(l => l.name === 'box');
  const barrierLayer   = TMX.layers.find(l => l.name === 'barrier');

  for (let r = rowMin; r <= rowMax; r++) {
    for (let c = colMin; c <= colMax; c++) {
      if (c < 0 || c >= MAP_COLS || r < 0 || r >= MAP_ROWS) return true;
      if (checkTile(metaLayer,      r, c)) return true;
      if (checkTile(roomVergeLayer, r, c)) return true;
      if (checkTile(boxLayer,       r, c)) return true;
      if (checkTile(barrierLayer,   r, c)) return true;
    }
  }

  return false;
}

// ── Sprite rendering ──
function drawSprite(img, x, y, scale, flipX, shakeAmt, flashAmt, tint) {
  if (!img) return;
  const sx = offsetX + x + (shakeAmt > 0 ? (Math.random() - 0.5) * shakeAmt * 2 : 0);
  const sy = offsetY + y + (shakeAmt > 0 ? (Math.random() - 0.5) * shakeAmt * 0.4 : 0);
  const iw = img.width * scale, ih = img.height * scale;

  ctx.save();
  ctx.translate(sx, sy);
  if (flipX) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, -iw / 2, -ih, iw, ih);

  if (flashAmt > 0) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = flashAmt;
    ctx.fillStyle = tint || '#ffffff';
    ctx.fillRect(-iw / 2, -ih, iw, ih);
  }
  ctx.restore();
}

function drawWeapon(x, y, flipX) {
  const img = IMGS.pistol;
  const heroI = IMGS[heroData.img];
  if (!img || !heroI) return;
  const scale = heroData.img === 'knight2' ? 0.15 : 0.48;
  const iH = heroI.height * scale, iW = heroI.width * scale;
  const handX = offsetX + x + (flipX ? -1 : 1) * iW * 0.22;
  const handY = offsetY + y - iH * 0.35;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(handX, handY);
  if (flipX) ctx.scale(-1, 1);
  ctx.scale(0.48, 0.48); // keep pistol constant size
  ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
  ctx.restore();
}

function spawnBullet(fromX, fromY, toX, toY, isHero, isHoming = false) {
  const dx = toX - fromX, dy = toY - fromY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const spd = isHero ? 800 : 250; // pixels per second
  const hX2 = fromX, hY2 = fromY - 30; // Approx gun/chest height
  A.bullets.push({ 
    x: hX2, y: hY2, 
    vx: dx / len * spd, vy: dy / len * spd, 
    life: 2.5, isHero, isHoming 
  });
}

function drawBullets(dt) {
  for (let i = A.bullets.length - 1; i >= 0; i--) {
    const b = A.bullets[i];
    
    if (b.isHoming) {
      let nearest = null;
      let minDist = Infinity;
      A.enemies.forEach(en => {
          if(!en.dying && !en.spawning) {
             const dist = Math.hypot(en.x - b.x, (en.y - 30) - b.y);
             if(dist < minDist) { minDist = dist; nearest = en; }
          }
      });
      if (nearest) {
        const ex = nearest.x, ey = nearest.y - 30;
        const dx = ex - b.x, dy = ey - b.y;
        const spd = Math.hypot(b.vx, b.vy);
        b.vx = b.vx * 0.8 + (dx/minDist * spd) * 0.2;
        b.vy = b.vy * 0.8 + (dy/minDist * spd) * 0.2;
      }
    }

    b.x += b.vx * dt; 
    b.y += b.vy * dt; 
    b.life -= dt;
    
    // Check wall collision
    const hitWall = isSolid(b.x, b.y, 4);

    const img = IMGS.bullet;
    if (img && !hitWall) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(offsetX + b.x, offsetY + b.y);
      ctx.rotate(Math.atan2(b.vy, b.vx));
      if (!b.isHero) ctx.filter = 'hue-rotate(180deg) saturate(2)'; 
      // Draw bullet at a reduced size (was drawn at 1.8x). Use a smaller scale so
      // OldPistolBullet.png appears appropriately sized in the arena.
      const bulletScale = 0.9; // 0.9x original image size
      ctx.drawImage(
        img,
        -img.width * bulletScale / 2,
        -img.height * bulletScale / 2,
        img.width * bulletScale,
        img.height * bulletScale
      );
      ctx.restore();
    } else if (!hitWall) {
      ctx.fillStyle = b.isHero ? '#ffd700' : '#ff4444';
      ctx.beginPath(); ctx.arc(offsetX + b.x, offsetY + b.y, 6, 0, Math.PI * 2); ctx.fill();
    }
    
    // Hit detection
    let hitEntity = false;
    if (b.isHero && !hitWall) {
      A.enemies.forEach(en => {
        if (!hitEntity && !en.dying && !en.spawning && Math.abs(b.x - en.x) < 35 && Math.abs(b.y - (en.y - 30)) < 45) {
          hitEntity = true;
          doEnemyDamage(en, b.isHoming ? 15 : 5);
        }
      });
    } else if (!hitWall) {
      if (Math.abs(b.x - A.heroX) < 20 && Math.abs(b.y - (A.heroY - 30)) < 35) {
        hitEntity = true;
        doHeroDamage(10);
      }
    }

    if (hitEntity || hitWall || b.life <= 0) {
      if (hitEntity || hitWall) spawnExplosion(offsetX + b.x, offsetY + b.y, !b.isHero);
      A.bullets.splice(i, 1);
    }
  }
}

function spawnExplosion(x, y, isRed) {
  const cols = isRed ? ['#ff4444','#cc2222','#ff8888'] : ['#ffd700','#ff8c00','#fff200'];
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 50 + Math.random() * 150;
    A.particles.push({
      x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
      life: 0.2 + Math.random() * 0.3, maxLife: 0.5,
      r: 2 + Math.random() * 4,
      color: cols[Math.floor(Math.random() * cols.length)]
    });
  }
}

function drawParticles(dt) {
  for (let i = A.particles.length - 1; i >= 0; i--) {
    const p = A.particles[i];
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    if (p.life <= 0) { A.particles.splice(i, 1); continue; }
    const alpha = p.life / p.maxLife;
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function flashScreen(cls) {
  const el = document.getElementById('screenFlash');
  el.className = 'screen-flash ' + cls;
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; el.className = 'screen-flash'; }, 140);
}

function combatText(text, x, y, cls) {
  const el = document.createElement('div');
  el.className = 'combat-text ' + cls;
  el.textContent = text;
  el.style.left = x + 'px'; el.style.top = y + 'px';
  combatL.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

function updateHUD() {
  const hero = heroData;
  const hPct = Math.max(0, G.heroHp / hero.maxHp * 100);
  const hBar = document.getElementById('heroHpBar');
  hBar.style.width = hPct + '%';
  document.getElementById('heroHpText').textContent = Math.max(0,Math.floor(G.heroHp))+'/'+hero.maxHp;
  document.getElementById('heroName').textContent   = hero.name;

  let totalHp = 0, totalMaxHp = 0;
  if(A.enemies) {
      A.enemies.forEach(en => { totalHp += Math.max(0, en.hp); totalMaxHp += en.maxHp; });
  }
  if (totalMaxHp === 0) totalMaxHp = 1;

  const ePct = Math.max(0, totalHp / totalMaxHp * 100);
  document.getElementById('enemyHpBar').style.width = ePct + '%';
  document.getElementById('enemyHpText').textContent = Math.max(0,Math.floor(totalHp))+'/'+totalMaxHp;
  document.getElementById('enemyName').textContent   = 'HORDE';

  const expPct = Math.min(100, G.heroExp / G.expToNext * 100);
  document.getElementById('expBar').style.width = expPct + '%';
  document.getElementById('expText').textContent = 'EXP: '+G.heroExp+'/'+G.expToNext;
  document.getElementById('stageLabel').textContent = 'STAGE ' + G.stage;
}

function startTimer() {
  clearInterval(G.timerInterval);
  G.timerLeft = G.timerMax;
  tickTimer();
  G.timerInterval = setInterval(() => {
    if (G.busy) return;
    G.timerLeft -= 1; 
    tickTimer();
    if (G.timerLeft <= 0) { clearInterval(G.timerInterval); timeExpired(); }
  }, 1000);
}

function tickTimer() {
  const circ = 100.5;
  const offset = circ * (1 - Math.max(0, G.timerLeft) / G.timerMax);
  document.getElementById('timerArc').style.strokeDashoffset = offset;
  document.getElementById('timerText').textContent = Math.ceil(Math.max(0, G.timerLeft));
  document.getElementById('timerRing').classList.toggle('timer-urgent', G.timerLeft <= 8);
}

function timeExpired() {
  if (G.busy) return;
  doHeroDamage(25);
  setTimeout(loadQuestion, 1800);
}

async function loadQuestion() {
  hideResult();
  document.getElementById('codeEditor').value = '';
  document.getElementById('hintBox').classList.add('hidden');
  try {
    const r  = await fetch('/api/question?difficulty=' + G.difficulty);
    const d  = await r.json();
    G.questionId = d.id;
    G.hint       = d.hint;
    document.getElementById('questionText').textContent = d.question;
    document.getElementById('diffBadge').textContent   = d.difficulty.toUpperCase();
    document.getElementById('enemyBadge').textContent  = 'vs HORDE';
    startTimer();
  } catch(e) {
    document.getElementById('questionText').textContent = 'Error loading question.';
  }
}

// ── Combat Logic ──
async function submitCode() {
  if (G.busy) return;
  const code = document.getElementById('codeEditor').value.trim();
  if (!code) { alert('Write Python code first!'); return; }
  G.busy = true;
  clearInterval(G.timerInterval);
  document.getElementById('btn-submit').disabled = true;
  
  try {
    const res  = await fetch('/api/submit', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ question_id: G.questionId, code })
    });
    const data = await res.json();
    
    document.getElementById('codeEditor').blur();
    
    if (data.correct) {
        // play attack animation briefly
        A.heroAnim = 'attack';
        A.heroAnimFrame = 0;
        setTimeout(() => { if (G.heroHp > 0) A.heroAnim = 'idle'; }, 900);
      showResult(true, '✅ Correct! Unleashing Magic!', '', '');
      let count = 0;
      const barrage = setInterval(() => {
        const offsetAngle = (Math.random() - 0.5) * Math.PI;
        const tx = A.heroX + Math.cos(offsetAngle)*100;
        const ty = A.heroY - 40 + Math.sin(offsetAngle)*100;
        spawnBullet(A.heroX, A.heroY, tx, ty, true, true);
        count++;
        if (count > 12) clearInterval(barrage);
      }, 80);
      
      G.heroExp += data.exp_reward || 0;
      updateHUD();
      setTimeout(loadQuestion, 2000);
    } else {
      showResult(false, data.error || 'Wrong answer!', data.actual, data.expected);
        // on wrong answer, still show a small attack recoil
        A.heroAnim = 'attack';
        A.heroAnimFrame = 0;
        setTimeout(() => { if (G.heroHp > 0) A.heroAnim = 'idle'; }, 700);
        doHeroDamage(30);
      setTimeout(loadQuestion, 2000);
    }
  } catch(e) {
    A.heroAnim = 'attack';
    A.heroAnimFrame = 0;
    setTimeout(() => { if (G.heroHp > 0) A.heroAnim = 'idle'; }, 700);
    doHeroDamage(20);
  } finally {
    document.getElementById('btn-submit').disabled = false;
    G.busy = false;
  }
}

function doHeroDamage(amt) {
  G.heroHp -= amt;
  A.heroShake = 15; A.heroFlash = 10;
  // play hurt animation
  A.heroAnim = 'hurt';
  A.heroAnimFrame = 0;
  setTimeout(() => { if (G.heroHp > 0) A.heroAnim = 'idle'; }, 600);
  flashScreen('flash-red');
  spawnExplosion(offsetX + A.heroX, offsetY + A.heroY - 40, true);
  combatText('-' + amt, offsetX + A.heroX - 20, offsetY + A.heroY - 80, 'dmg-hero');
  updateHUD();
  if (G.heroHp <= 0) { setTimeout(gameOver, 700); }
}

function doEnemyDamage(en, amt) {
  if (en.dying || en.spawning) return;
  en.hp -= amt;
  if (en.hp < 0) en.hp = 0;
  en.shake = 10; en.flash = 5;
  if (en.type === 'BossDemon' && en.anim !== 'attack') {
    en.anim = 'hurt';
    en.animFrame = 0;
  }
  combatText('-' + amt, offsetX + en.x - 20 + Math.random()*40, offsetY + en.y - 80 + Math.random()*20, 'dmg-enemy');
  updateHUD();
  
  if (en.hp <= 0 && !en.dying) {
    en.dying = true;
    G.heroExp += ENEMY_STATS[en.type]?.reward || 20;
    updateHUD();
    enemyDied(en);
  }
}

function enemyDied(en) {
  en.scale = 1.0; en.alpha = 1.0;
  if (en.type === 'BossDemon') {
      en.anim = 'death';
      en.animFrame = 0;
  }
  let frame = 0;
  const dying = setInterval(() => {
    frame++;
    if (en.type !== 'BossDemon') {
      en.scale = Math.max(0, 1.0 - frame / 20);
      en.alpha = Math.max(0, 1.0 - frame / 18);
    }
    
    let isDead = false;
    if (en.type !== 'BossDemon' && frame >= 20) isDead = true;
    if (en.type === 'BossDemon' && en.animFrame >= 21) isDead = true;

    if (isDead) {
      clearInterval(dying);
      A.enemies = A.enemies.filter(e => e !== en);
      if (A.enemies.length === 0) {
        stageClear();
      }
    }
  }, 25);
}

function spawnNextEnemy() {
  const count = Math.min(G.stage, 5);
  let pool = ['Mummy', 'Ranger', 'Tower'];
  if (G.difficulty === 'insane') pool = ['BossDemon'];
  
  A.enemies = [];
  for (let i=0; i<count; i++) {
    const type = pool[Math.floor(Math.random() * pool.length)];
    const s = ENEMY_STATS[type] || ENEMY_STATS.Mummy;
    const offset = (i - (count - 1) / 2) * TS; 
    
    A.enemies.push({
      id: i,
      type: type,
      hp: s.hp,
      maxHp: s.hp,
      x: 11 * TS + offset,
      y: 1 * TS,
      dirX: -1,
      bob: 0,
      shake: 0,
      flash: 0,
      anim: 'idle',
      animFrame: 0,
      frameTimer: 0,
      scale: 1.0,
      alpha: 0,
      dying: false,
      spawning: true,
      fireCooldown: s.fireRate + Math.random()
    });
  }
  
  updateHUD();
  document.getElementById('enemyBadge').textContent = 'vs HORDE';

  let sf = 0;
  const spawning = setInterval(() => {
    sf++;
    A.enemies.forEach(en => {
      if(en.spawning) {
        en.y += (2 * TS) / 20; 
        en.alpha = Math.min(1, sf / 10);
      }
    });
    if (sf >= 20) {
      clearInterval(spawning);
      A.enemies.forEach(en => { en.spawning = false; en.alpha = 1.0; });
    }
  }, 25);
}

function skipQuestion() {
  if (G.busy) return;
  document.getElementById('codeEditor').blur();
  clearInterval(G.timerInterval);
  doHeroDamage(20);
  setTimeout(loadQuestion, 1500);
}

function showHint() {
  if (heroData.hints > 0 && G.hintsLeft <= 0) return;
  if (heroData.hints > 0) G.hintsLeft--;
  const box = document.getElementById('hintBox');
  box.textContent = '💡 ' + G.hint;
  box.classList.remove('hidden');
  document.getElementById('hintBtn').textContent = '💡 Hint (' + G.hintsLeft + ')';
}
function clearCode() { document.getElementById('codeEditor').value = ''; }
function showResult(ok, msg, actual, expected) {
  const box = document.getElementById('resultBox');
  box.classList.remove('hidden');
  document.getElementById('resultIcon').textContent = ok ? '✅' : '❌';
  const m = document.getElementById('resultMsg');
  m.textContent = msg; m.className = 'result-msg ' + (ok ? 'correct' : 'wrong');
  document.getElementById('resultOutput').textContent = (actual ? 'Your output:\n'+actual+'\n' : '') + (expected ? 'Expected:\n'+expected : '');
}
function hideResult() { document.getElementById('resultBox').classList.add('hidden'); }

function stageClear() {
  clearInterval(G.timerInterval);
  document.getElementById('stageClearOverlay').classList.remove('hidden');
}

document.getElementById('btn-next-stage').addEventListener('click', () => {
  document.getElementById('stageClearOverlay').classList.add('hidden');
  G.stage++;
  if (G.stage > 10) { document.getElementById('victoryOverlay').classList.remove('hidden'); return; }
  spawnNextEnemy();
  loadQuestion();
});

function gameOver() {
  clearInterval(G.timerInterval);
  // show death animation
  A.heroAnim = 'death';
  A.heroAnimFrame = 0;
  document.getElementById('gameOverOverlay').classList.remove('hidden');
}
document.getElementById('btn-restart').addEventListener('click', () => location.reload());

// ── Main Render & Physics Loop ──
function loop(timestamp) {
  const dtRaw = (timestamp - A.lastTime) / 1000 || 0;
  A.lastTime = timestamp;
  const dt = Math.min(dtRaw, 0.1) * G.timeScale; 

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (A.heroShake > 0) A.heroShake--;
  if (A.heroFlash > 0) A.heroFlash--;

  // Player Movement 
  let dx = 0, dy = 0;
  if (!editorFocused) {
    if (keys.w) dy -= 1; if (keys.s) dy += 1;
    if (keys.a) dx -= 1; if (keys.d) dx += 1;
  }
  if (keys.ArrowUp) dy -= 1; if (keys.ArrowDown) dy += 1;
  if (keys.ArrowLeft) dx -= 1; if (keys.ArrowRight) dx += 1;

    if (dx !== 0 || dy !== 0) {
    const len = Math.sqrt(dx*dx + dy*dy);
    const speed = heroData.speed * dt;
    
    // Attempt movement X — sweep full body bounding box
    const newX = A.heroX + (dx/len) * speed;
    if (!isSolid(newX, A.heroY, TS * 0.42, TS * 0.8)) A.heroX = newX;
    
    // Attempt movement Y
    const newY = A.heroY + (dy/len) * speed;
    if (!isSolid(A.heroX, newY, TS * 0.42, TS * 0.8)) A.heroY = newY;
    
    if (dx !== 0) A.heroDirX = dx > 0 ? 1 : -1;
    A.heroWalk += 15 * dt; 
  } else {
    A.heroWalk = 0;
  }
    // update hero animation state (run when moving and not busy)
    if (A.heroAnim !== 'death' && A.heroAnim !== 'hurt' && A.heroAnim !== 'attack') {
        if (!editorFocused && (dx !== 0 || dy !== 0)) {
           if (A.heroAnim !== 'run') { A.heroAnim = 'run'; A.heroAnimFrame = 0; }
        } else if (!G.busy) {
           if (A.heroAnim !== 'idle') { A.heroAnim = 'idle'; A.heroAnimFrame = 0; }
        }
    }

  // Update Hero Anim
  A.heroFrameTimer = (A.heroFrameTimer || 0) + dt;
  if (A.heroFrameTimer > 0.08) {
     A.heroFrameTimer = 0;
     A.heroAnimFrame = (A.heroAnimFrame || 0) + 1;
     
     if (heroData.img === 'fireknight' && HERO_ANIMS['fireknight'] && HERO_ANIMS['fireknight'][A.heroAnim]) {
       const frames = HERO_ANIMS['fireknight'][A.heroAnim];
       if (A.heroAnim === 'attack' && A.heroAnimFrame >= frames.length) {
         A.heroAnim = 'idle'; A.heroAnimFrame = 0;
       } else if (A.heroAnim === 'hurt' && A.heroAnimFrame >= frames.length) {
         A.heroAnim = 'idle'; A.heroAnimFrame = 0;
       } else if (A.heroAnim !== 'death' && A.heroAnim !== 'attack' && A.heroAnim !== 'hurt') {
         A.heroAnimFrame = A.heroAnimFrame % frames.length;
       } else if (A.heroAnim === 'death') {
         A.heroAnimFrame = Math.min(A.heroAnimFrame, frames.length - 1);
       }
     }
  }

  // Enemy AI
  A.enemies.forEach(en => {
    en.frameTimer = (en.frameTimer || 0) + dt;
    const frameThreshold = (en.type === 'BossDemon' && en.anim === 'attack') ? 0.04 : 0.08;
    if (en.frameTimer > frameThreshold) {
      en.frameTimer = 0;
      en.animFrame = (en.animFrame || 0) + 1;
      
      if (en.type === 'BossDemon') {
        const frames = ENEMY_ANIMS['BossDemon'][en.anim];
        if (frames) {
          if (en.anim === 'attack' && en.animFrame >= frames.length) {
            en.anim = 'idle';
            const stats = ENEMY_STATS[en.type];
            const dist = Math.hypot(A.heroX - en.x, A.heroY - en.y);
            if (dist <= stats.meleeRange + 20) doHeroDamage(stats.dmg);
          } else if (en.anim === 'hurt' && en.animFrame >= frames.length) {
            en.anim = 'idle';
          } else if (en.anim !== 'death' && en.anim !== 'attack' && en.anim !== 'hurt') {
            en.animFrame = en.animFrame % frames.length;
          } else if (en.anim === 'death') {
            en.animFrame = Math.min(en.animFrame, frames.length - 1);
          }
        }
      }
    }

    if (!en.dying && !en.spawning) {
      const stats = ENEMY_STATS[en.type] || ENEMY_STATS.Mummy;
      const edx = A.heroX - en.x, edy = A.heroY - en.y;
      const dist = Math.sqrt(edx*edx + edy*edy);
      
      if (en.anim !== 'attack' && en.anim !== 'hurt') {
          if (dist > (stats.meleeRange || 50)) {
            const spd = stats.speed * dt;
            const nx = en.x + (edx/dist) * spd;
            const ny = en.y + (edy/dist) * spd;
            
            let movedX = false, movedY = false;
            if (!isSolid(nx, en.y, TS * 0.38, TS * 0.8)) { en.x = nx; movedX = true; }
            if (!isSolid(en.x, ny, TS * 0.38, TS * 0.8)) { en.y = ny; movedY = true; }
            
            // Wall avoidance
            if (!movedX && Math.abs(edx) > Math.abs(edy)) {
                if (!en.avoidTimer) { en.avoidDir = Math.random() > 0.5 ? 1 : -1; en.avoidTimer = 1.0; }
                if (!isSolid(en.x, en.y + en.avoidDir * spd, TS * 0.38, TS * 0.8)) en.y += en.avoidDir * spd;
            } else if (!movedY && Math.abs(edy) > Math.abs(edx)) {
                if (!en.avoidTimer) { en.avoidDir = Math.random() > 0.5 ? 1 : -1; en.avoidTimer = 1.0; }
                if (!isSolid(en.x + en.avoidDir * spd, en.y, TS * 0.38, TS * 0.8)) en.x += en.avoidDir * spd;
            }
            if (en.avoidTimer) {
                en.avoidTimer -= dt;
                if (en.avoidTimer <= 0) en.avoidTimer = 0;
            }
            
            en.bob += 10 * dt;
            if (en.type === 'BossDemon') en.anim = 'walk';
          } else {
            if (stats.meleeRange) {
              en.fireCooldown -= dt;
              if (en.fireCooldown <= 0) {
                 en.anim = 'attack';
                 en.animFrame = 0;
                 en.fireCooldown = stats.fireRate;
              } else {
                 en.anim = 'idle';
              }
            } else {
                 if (en.type === 'BossDemon') en.anim = 'idle';
            }
          }
      }
      if (edx !== 0 && en.anim !== 'attack') en.dirX = edx > 0 ? 1 : -1;

      if (!stats.meleeRange) {
          en.fireCooldown -= dt;
          if (en.fireCooldown <= 0) {
            spawnBullet(en.x, en.y, A.heroX, A.heroY, false);
            en.fireCooldown = stats.fireRate + Math.random()*0.5;
          }
      }
    }
  });

  // Draw Arena
  drawBg();

  // Draw Shadows
  ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = '#000';
  const heroShadowY = heroData.img === 'fireknight' ? A.heroY + 35 : A.heroY;
  ctx.beginPath(); ctx.ellipse(offsetX + A.heroX, offsetY + heroShadowY, TS*0.5, TS*0.15, 0, 0, Math.PI * 2); ctx.fill();
  A.enemies.forEach(en => {
    const enShadowY = en.type === 'BossDemon' ? en.y + 45 : en.y;
    ctx.beginPath(); ctx.ellipse(offsetX + en.x, offsetY + enShadowY, TS*0.5, TS*0.15, 0, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();

  // Draw Hero
  const hw = Math.sin(A.heroWalk) * 4;
  if (heroData.img !== 'fireknight') {
    drawWeapon(A.heroX, A.heroY + hw, A.heroDirX === -1);
  }
  
  // Canvas fallback: draw hero sprite directly on canvas so it's visible
  const baseKey = heroData.img;
  let animKey = baseKey + '_' + (A.heroAnim || 'idle');
  let heroImg = IMGS[animKey] || IMGS[baseKey] || null;
  
  if (baseKey === 'fireknight' && HERO_ANIMS['fireknight']) {
    const frames = HERO_ANIMS['fireknight'][A.heroAnim || 'idle'];
    if (frames && frames.length > 0) {
      const fIdx = Math.min(A.heroAnimFrame || 0, frames.length - 1);
      heroImg = frames[fIdx];
    }
  }

  if (heroImg) {
    let heroScale = (baseKey === 'knight2') ? 0.15 : 0.48;
    if (baseKey === 'fireknight') heroScale = 1.1;
    
    // The fire knight might need an offset depending on sprite padding
    const yOffset = baseKey === 'fireknight' ? 35 : 0;
    
    const flipX = baseKey === 'fireknight' ? A.heroDirX === -1 : A.heroDirX === -1;
    
    drawSprite(heroImg, A.heroX, A.heroY + hw + yOffset, heroScale, flipX, A.heroShake, A.heroFlash / 8, heroData.tint || null);
  }
  
  // DOM Sprite Update for animated webp support
    const heroDom = document.getElementById('heroDomSprite');
    // Prefer an animation-specific asset if available (e.g. nightborne_run)
    const src = IMG_SRC[animKey] || IMG_SRC[baseKey] || null;
    if (src && !heroDom.src.includes(src)) {
      heroDom.src = src;
      heroDom.classList.remove('hidden');
    }
    
    const hImg = IMGS[animKey] || IMGS[baseKey] || null;
    const hScale = heroData.img === 'knight2' ? 0.15 : 0.48;
    const w = hImg ? hImg.width * hScale : 64;
    const h = hImg ? hImg.height * hScale : 64;
    heroDom.style.width = w + 'px';
    heroDom.style.height = h + 'px';
    
    const sx = offsetX + A.heroX + (A.heroShake > 0 ? (Math.random() - 0.5) * A.heroShake * 2 : 0);
    const sy = offsetY + A.heroY + hw + (A.heroShake > 0 ? (Math.random() - 0.5) * A.heroShake * 0.4 : 0);
    
    heroDom.style.left = (sx - w / 2) + 'px';
    heroDom.style.top = (sy - h) + 'px';
    
    let transformStr = '';
    if (A.heroDirX === -1) transformStr += 'scaleX(-1) ';
    heroDom.style.transform = transformStr;
    
    if (A.heroFlash > 0) {
      heroDom.style.filter = 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)';
    } else {
      heroDom.style.filter = heroData.tint ? `drop-shadow(0 0 5px ${heroData.tint})` : 'none';
    }
  
  // Draw Enemy
  A.enemies.forEach(en => {
    if (en.alpha > 0) {
      if (en.shake > 0) en.shake--;
      if (en.flash > 0) en.flash--;
      
      const eb = en.type === 'BossDemon' ? 0 : Math.sin(en.bob) * 5;
      
      let enImg = IMGS[en.type] || IMGS.Mummy;
      if (en.type === 'BossDemon' && ENEMY_ANIMS['BossDemon']) {
        const frames = ENEMY_ANIMS['BossDemon'][en.anim || 'idle'];
        if (frames && frames.length > 0) {
          const fIdx = Math.min(en.animFrame || 0, frames.length - 1);
          enImg = frames[fIdx];
        }
      }
      
      const enScale = (ENEMY_STATS[en.type]?.scale || 0.48) * en.scale;
      ctx.save(); ctx.globalAlpha = en.alpha;
      const flipX = en.type === 'BossDemon' ? en.dirX === 1 : en.dirX === -1;
      const yOffset = en.type === 'BossDemon' ? 45 : 0;
      drawSprite(enImg, en.x, en.y + eb + yOffset, enScale, flipX, en.shake, en.flash / 8, '#ff3333');
      ctx.restore();
      
      // HP bar for each enemy
      if (!en.dying && !en.spawning) {
         const hpPct = Math.max(0, en.hp / en.maxHp);
         const barY = offsetY + en.y - (en.type === 'BossDemon' ? 120 : 45);
         ctx.fillStyle = 'rgba(0,0,0,0.6)';
         ctx.fillRect(offsetX + en.x - 16, barY, 32, 5);
         ctx.fillStyle = '#ff3333';
         ctx.fillRect(offsetX + en.x - 16, barY, 32 * hpPct, 5);
      }
    }
  });

  drawBullets(dt);
  drawParticles(dt);

  requestAnimationFrame(loop);
}

// ── Init ──
async function init() {
  await loadTmxMap();
  await Promise.all(Object.entries(IMG_SRC).map(([k,s]) => loadImg(k, s)));
  await loadBossFrames();
  await loadFireKnightFrames();
  spawnNextEnemy();
  requestAnimationFrame(loop);
  loadQuestion();
}

init();
