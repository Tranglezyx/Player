import { MONSTER_TIERS, MONSTER_NAMES } from '../config/monsters';
import { drawMonsterHpBar } from '../ui/uiPainter';

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
  }

  takeDamage(damage) {
    this.hp -= damage;
    this.state = 'hurt';
    if (this.hurtTimer) clearTimeout(this.hurtTimer);
    this.hurtTimer = setTimeout(() => {
      if (this.isActive) this.state = 'idle';
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

    ctx.save();

    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(mx + size / 2, my + size + 4, size * 0.4, size * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // 按等阶选择怪物配色方案（每个等阶 2~3 种变体）
    const tierPalettes = [
      // 等阶 1: 兔妖/鼠精 —— 白色/灰色
      { body: '#F5F5F5', accent: '#FFAB91', dark: '#BDBDBD' },
      { body: '#E0E0E0', accent: '#9E9E9E', dark: '#757575' },
      // 等阶 2: 石魔/土精 —— 石灰色
      { body: '#A1887F', accent: '#5D4037', dark: '#3E2723' },
      { body: '#BCAAA4', accent: '#795548', dark: '#4E342E' },
      // 等阶 3: 蛇妖/毒蛙/鳄兽 —— 青绿色
      { body: '#81C784', accent: '#2E7D32', dark: '#1B5E20' },
      { body: '#66BB6A', accent: '#388E3C', dark: '#2E7D32' },
      { body: '#A5D6A7', accent: '#43A047', dark: '#2E7D32' },
      // 等阶 4: 火蝠/炎魔/熔岩龟 —— 火红色
      { body: '#EF5350', accent: '#C62828', dark: '#B71C1C' },
      { body: '#FF7043', accent: '#D84315', dark: '#BF360C' },
      { body: '#FF8A65', accent: '#E64A19', dark: '#BF360C' },
      // 等阶 5: 剑修遗骸/刀修残魂 —— 苍白骨色
      { body: '#CFD8DC', accent: '#546E7A', dark: '#37474F' },
      { body: '#B0BEC5', accent: '#455A64', dark: '#263238' },
      // 等阶 6: 怨魂/骷髅将/邪修 —— 紫黑色
      { body: '#AB47BC', accent: '#6A1B9A', dark: '#4A148C' },
      { body: '#7E57C2', accent: '#4527A0', dark: '#311B92' },
      { body: '#5E35B1', accent: '#4527A0', dark: '#311B92' },
      // 等阶 7: 虎妖/熊兽/鹰妖 —— 橙棕色
      { body: '#FF8F00', accent: '#E65100', dark: '#BF360C' },
      { body: '#FF6D00', accent: '#DD2C00', dark: '#B71C1C' },
      { body: '#FFB300', accent: '#FF6F00', dark: '#E65100' },
      // 等阶 8: 冰狼/雪怪/冰凤雏 —— 冰蓝色
      { body: '#4FC3F7', accent: '#0277BD', dark: '#01579B' },
      { body: '#81D4FA', accent: '#0288D1', dark: '#01579B' },
      { body: '#29B6F6', accent: '#039BE5', dark: '#0277BD' },
      // 等阶 9: 心魔/影魔/噬魂兽 —— 暗影紫
      { body: '#7B1FA2', accent: '#4A148C', dark: '#38006b' },
      { body: '#6A1B9A', accent: '#4A148C', dark: '#38006b' },
      { body: '#8E24AA', accent: '#6A1B9A', dark: '#4A148C' },
      // 等阶 10: 雷灵/电蛟/雷鹰 —— 雷电黄
      { body: '#FFEB3B', accent: '#FBC02D', dark: '#F57F17' },
      { body: '#FFF176', accent: '#F9A825', dark: '#FF6F00' },
      { body: '#FDD835', accent: '#F57F17', dark: '#E65100' },
      // 等阶 11+: 虚空/星域 —— 深紫/星空色
      { body: '#512DA8', accent: '#311B92', dark: '#1A237E' },
      { body: '#4527A0', accent: '#311B92', dark: '#1A237E' },
      { body: '#283593', accent: '#1A237E', dark: '#0D47A1' },
      // 等阶 12+
      { body: '#00897B', accent: '#00695C', dark: '#004D40' },
      { body: '#0097A7', accent: '#00838F', dark: '#006064' },
      { body: '#26A69A', accent: '#00796B', dark: '#004D40' },
      // 等阶 13+
      { body: '#C62828', accent: '#B71C1C', dark: '#880E4F' },
      { body: '#AD1457', accent: '#880E4F', dark: '#560027' },
      { body: '#D81B60', accent: '#AD1457', dark: '#880E4F' },
      // 等阶 14+
      { body: '#F9A825', accent: '#F57F17', dark: '#E65100' },
      { body: '#FFB300', accent: '#FF8F00', dark: '#EF6C00' },
      { body: '#FFCA28', accent: '#FFA000', dark: '#FF6F00' },
      // 等阶 15+
      { body: '#1565C0', accent: '#0D47A1', dark: '#002171' },
      { body: '#1976D2', accent: '#1565C0', dark: '#0D47A1' },
      { body: '#1E88E5', accent: '#1976D2', dark: '#1565C0' },
      // 等阶 16+
      { body: '#6D4C41', accent: '#4E342E', dark: '#3E2723' },
      { body: '#5D4037', accent: '#3E2723', dark: '#281815' },
      { body: '#795548', accent: '#5D4037', dark: '#3E2723' },
      // 等阶 17+
      { body: '#FF5722', accent: '#E64A19', dark: '#BF360C' },
      { body: '#FF6F00', accent: '#E65100', dark: '#BF360C' },
      { body: '#FF8F00', accent: '#FF6F00', dark: '#E65100' },
      // 等阶 18+
      { body: '#00ACC1', accent: '#0097A7', dark: '#006064' },
      { body: '#0097A7', accent: '#00838F', dark: '#006064' },
      { body: '#26C6DA', accent: '#00ACC1', dark: '#0097A7' },
      // 等阶 19+
      { body: '#E040FB', accent: '#D500F9', dark: '#AA00FF' },
      { body: '#EA80FC', accent: '#E040FB', dark: '#D500F9' },
      { body: '#CE93D8', accent: '#AB47BC', dark: '#8E24AA' },
      // 等阶 20: 天门神将/真仙投影 —— 金白色
      { body: '#FFFFFF', accent: '#FFD700', dark: '#FFA000' },
      { body: '#FFFDE7', accent: '#FFEB3B', dark: '#FBC02D' },
    ];

    const paletteIndex = Math.min((this.tier - 1) * 3 + this.monsterIndex, tierPalettes.length - 1);
    const pal = tierPalettes[paletteIndex] || tierPalettes[0];

    // 受伤闪烁
    if (this.state === 'hurt') {
      ctx.globalAlpha = 0.7;
    }

    const s = size;

    // 绘制像素风怪物（根据 monsterIndex 区分造型）
    const shapeType = this.monsterIndex % 3; // 0=圆胖型, 1=瘦高型, 2=翼型

    if (shapeType === 0) {
      // 圆胖型：主体 + 小耳朵/角
      ctx.fillStyle = pal.body;
      ctx.fillRect(mx + s * 0.2, my + s * 0.25, s * 0.6, s * 0.55);
      ctx.fillRect(mx + s * 0.3, my + s * 0.1, s * 0.4, s * 0.25);
      // 耳朵
      ctx.fillStyle = pal.accent;
      ctx.fillRect(mx + s * 0.25, my, s * 0.12, s * 0.15);
      ctx.fillRect(mx + s * 0.63, my, s * 0.12, s * 0.15);
      // 眼睛
      ctx.fillStyle = this.state === 'hurt' ? '#F44336' : '#FFF';
      ctx.fillRect(mx + s * 0.38, my + s * 0.22, s * 0.1, s * 0.1);
      ctx.fillRect(mx + s * 0.55, my + s * 0.22, s * 0.1, s * 0.1);
      ctx.fillStyle = '#000';
      ctx.fillRect(mx + s * 0.4, my + s * 0.24, s * 0.06, s * 0.06);
      ctx.fillRect(mx + s * 0.57, my + s * 0.24, s * 0.06, s * 0.06);
    } else if (shapeType === 1) {
      // 瘦高型：高挑身体
      ctx.fillStyle = pal.body;
      ctx.fillRect(mx + s * 0.3, my + s * 0.1, s * 0.4, s * 0.7);
      // 头部
      ctx.fillRect(mx + s * 0.25, my, s * 0.5, s * 0.25);
      // 角
      ctx.fillStyle = pal.accent;
      ctx.fillRect(mx + s * 0.2, my - s * 0.1, s * 0.1, s * 0.15);
      ctx.fillRect(mx + s * 0.7, my - s * 0.1, s * 0.1, s * 0.15);
      // 眼睛
      ctx.fillStyle = this.state === 'hurt' ? '#F44336' : '#FFF';
      ctx.fillRect(mx + s * 0.38, my + s * 0.1, s * 0.08, s * 0.08);
      ctx.fillRect(mx + s * 0.57, my + s * 0.1, s * 0.08, s * 0.08);
      // 手臂
      ctx.fillStyle = pal.dark;
      ctx.fillRect(mx + s * 0.1, my + s * 0.35, s * 0.15, s * 0.3);
      ctx.fillRect(mx + s * 0.75, my + s * 0.35, s * 0.15, s * 0.3);
    } else {
      // 翼型/飞行型
      ctx.fillStyle = pal.body;
      ctx.fillRect(mx + s * 0.3, my + s * 0.2, s * 0.4, s * 0.5);
      ctx.fillRect(mx + s * 0.35, my + s * 0.05, s * 0.3, s * 0.2);
      // 翅膀
      ctx.fillStyle = pal.accent;
      ctx.fillRect(mx, my + s * 0.25, s * 0.3, s * 0.15);
      ctx.fillRect(mx + s * 0.7, my + s * 0.25, s * 0.3, s * 0.15);
      // 眼睛
      ctx.fillStyle = this.state === 'hurt' ? '#F44336' : '#FFF';
      ctx.fillRect(mx + s * 0.4, my + s * 0.15, s * 0.08, s * 0.08);
      ctx.fillRect(mx + s * 0.55, my + s * 0.15, s * 0.08, s * 0.08);
    }

    // 等阶光环（高阶怪物外发光）
    if (this.tier >= 10) {
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(mx - 2, my - 2, s + 4, s + 4);
      ctx.globalAlpha = 1;
    }

    ctx.globalAlpha = 1;

    // 美化血条
    const barW = size;
    const barH = 7;
    const barX = mx;
    const barY = my - 14;
    drawMonsterHpBar(ctx, barX, barY, barW, barH, this.hp / this.maxHp, this.name);

    ctx.restore();
  }

  getStoneReward() {
    const base = this.stoneBase;
    const range = this.stoneRange;
    return Math.floor(base + (Math.random() * 2 - 1) * range);
  }
}
