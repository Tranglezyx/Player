import { MONSTER_TIERS, MONSTER_NAMES } from '../config/monsters';

// 等阶配色表（每阶 3 种变体）
const TIER_PALETTE = [
  '#F5F5F5','#E0E0E0','#CFD8DC',  // 1
  '#A1887F','#BCAAA4','#8D6E63',  // 2
  '#81C784','#66BB6A','#A5D6A7',  // 3
  '#EF5350','#FF7043','#FF8A65',  // 4
  '#B0BEC5','#90A4AE','#78909C',  // 5
  '#AB47BC','#7E57C2','#5E35B1',  // 6
  '#FF8F00','#FF6D00','#FFB300',  // 7
  '#4FC3F7','#81D4FA','#29B6F6',  // 8
  '#7B1FA2','#6A1B9A','#8E24AA',  // 9
  '#FFEB3B','#FFF176','#FDD835',  //10
  '#512DA8','#4527A0','#283593',  //11
  '#00897B','#0097A7','#26A69A',  //12
  '#C62828','#AD1457','#D81B60',  //13
  '#F9A825','#FFB300','#FFCA28',  //14
  '#1565C0','#1976D2','#1E88E5',  //15
  '#6D4C41','#5D4037','#795548',  //16
  '#FF5722','#FF6F00','#FF8F00',  //17
  '#00ACC1','#0097A7','#26C6DA',  //18
  '#E040FB','#EA80FC','#CE93D8',  //19
  '#FFFFFF','#FFFDE7','#FFE082',  //20
];

export default class Monster {
  constructor() {
    this.name = '';
    this.tier = 1;
    this.hp = 0;
    this.maxHp = 0;
    this.defense = 0;
    this.stoneBase = 0;
    this.stoneRange = 0;
    this.fragmentDropRate = 0.05;
    this.monsterIndex = 0; // 同阶怪物的第几个造型

    this.x = 0;
    this.y = 0;
    this.state = 'idle';
    this.isActive = false;
    this.isAnimating = false;
    this.bobOffset = 0;
    this.bobTimer = 0;
    this.deathTimer = 0;
  }

  init(tier) {
    tier = Math.max(1, Math.min(20, tier));
    const tierConfig = MONSTER_TIERS.find(t => t.tier === tier) || MONSTER_TIERS[0];

    this.tier = tier;
    this.hp = tierConfig.hp;
    this.maxHp = tierConfig.hp;
    this.defense = tierConfig.defense;
    this.stoneBase = tierConfig.stoneBase;
    this.stoneRange = tierConfig.stoneRange;
    this.fragmentDropRate = 0.05;

    const names = MONSTER_NAMES[Math.min(tier - 1, MONSTER_NAMES.length - 1)];
    this.monsterIndex = Math.floor(Math.random() * names.length);
    this.name = names[this.monsterIndex];

    const topMargin = 100;
    const bottomMargin = 70;
    const combatArea = canvas.height - topMargin - bottomMargin;
    this.x = canvas.width / 2 - 40;
    this.y = topMargin + combatArea * 0.25;
    this.state = 'idle';
    this.isActive = true;
    this.isAnimating = false;
    this.bobOffset = 0;
    this.bobTimer = Math.random() * Math.PI * 2;
    this.deathTimer = 0;
  }

  takeDamage(damage) {
    if (this.state === 'dead') return;
    this.hp -= damage;
    this.state = 'hurt';
    if (this.hurtTimer) clearTimeout(this.hurtTimer);
    this.hurtTimer = setTimeout(() => {
      if (this.isActive && this.state !== 'dead') this.state = 'idle';
    }, 200);
  }

  update(dt) {
    if (!this.isActive) return;
    this.bobTimer += dt * 2;
    this.bobOffset = Math.sin(this.bobTimer) * 3;
  }

  render(ctx) {
    if (!this.isActive) return;

    const mx = this.x;
    const my = this.y + this.bobOffset;
    const size = Math.min(72, 36 + this.tier * 2);
    const s = size;

    ctx.save();

    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.save();
    ctx.translate(mx + s / 2, my + s + 4);
    ctx.scale(1, 0.25);
    ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 配色
    const ci = Math.min((this.tier - 1) * 3 + this.monsterIndex, TIER_PALETTE.length - 1);
    const bodyColor = TIER_PALETTE[ci];
    const darkColor = TIER_PALETTE[Math.min(ci + 1, TIER_PALETTE.length - 1)];

    // 受伤闪烁
    if (this.state === 'hurt') {
      ctx.globalAlpha = 0.6;
    }

    // 高阶光环
    if (this.tier >= 10) {
      ctx.strokeStyle = bodyColor;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 2;
      ctx.strokeRect(mx - 3, my - 3, s + 6, s + 6);
      ctx.globalAlpha = this.state === 'hurt' ? 0.6 : 1;
    }

    // 身体
    ctx.fillStyle = bodyColor;
    ctx.fillRect(mx + s * 0.2, my + s * 0.3, s * 0.6, s * 0.5);

    // 头部
    ctx.fillRect(mx + s * 0.25, my, s * 0.5, s * 0.25);

    // 耳朵/角
    ctx.fillStyle = darkColor;
    ctx.fillRect(mx + s * 0.2, my - s * 0.05, s * 0.12, s * 0.15);
    ctx.fillRect(mx + s * 0.68, my - s * 0.05, s * 0.12, s * 0.15);

    // 翅膀（高阶翼型）
    if (this.tier >= 6) {
      ctx.fillStyle = darkColor;
      ctx.fillRect(mx + s * 0.02, my + s * 0.3, s * 0.18, s * 0.12);
      ctx.fillRect(mx + s * 0.8, my + s * 0.3, s * 0.18, s * 0.12);
    }

    // 眼睛
    ctx.fillStyle = this.state === 'hurt' ? '#F44336' : '#FFF';
    ctx.fillRect(mx + s * 0.38, my + s * 0.1, s * 0.08, s * 0.08);
    ctx.fillRect(mx + s * 0.55, my + s * 0.1, s * 0.08, s * 0.08);

    ctx.fillStyle = '#000';
    ctx.fillRect(mx + s * 0.4, my + s * 0.12, s * 0.04, s * 0.04);
    ctx.fillRect(mx + s * 0.57, my + s * 0.12, s * 0.04, s * 0.04);

    ctx.globalAlpha = 1;

    // HP 条
    const barW = size;
    const barH = 6;
    const barX = mx;
    const barY = my - 12;
    const ratio = this.hp / this.maxHp;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);

    ctx.fillStyle = '#F44336';
    ctx.fillRect(barX, barY, barW * ratio, barH);

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(barX, barY, barW, barH / 2);

    // 怪物名
    ctx.fillStyle = '#F5E6C8';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, barX + barW / 2, barY - 4);

    ctx.restore();
  }

  getStoneReward() {
    const base = this.stoneBase;
    const range = this.stoneRange;
    return Math.floor(base + (Math.random() * 2 - 1) * range);
  }
}
