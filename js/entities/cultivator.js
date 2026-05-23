import Sprite from '../base/sprite';
import REALMS from '../config/realms';
import INNER_SKILLS from '../config/innerSkills';
import { OUTER_SKILLS } from '../config/outerSkills';
import {
  drawBreakthroughAura,
  drawSpiritParticle,
} from '../ui/uiPainter';

export default class Cultivator {
  constructor() {
    this.name = '无名修士';
    this.realmIndex = 0;
    this.realm = REALMS[0].name;
    this.level = 1;

    this.attack = 10;
    this.attackSpeed = 2.0;
    this.critRate = 0.05;
    this.critDamage = 2.0;

    this.spirit = 50;
    this.maxSpirit = 50;
    this.spiritRegen = 5;

    this.cultivation = 0;
    this.maxCultivation = 600;
    this.cultivationSpeed = 1;
    this.spiritStone = 0;
    this.autoCultivate = true;

    this.equipment = {
      weapon: null,
      helmet: null,
      armor: null,
      boots: null,
      accessory: null,
    };
    this.bag = [];

    this.innerSkills = [];
    this.outerSkills = [];

    this.x = 0;
    this.y = 0;
    this.state = 'idle';
    this.attackTimer = 0;
    this.breathTimer = 0;
    this.particles = [];

    this.initPosition();
  }

  initPosition() {
    const topMargin = 100;
    const bottomMargin = 70;
    const combatArea = canvas.height - topMargin - bottomMargin;
    this.x = canvas.width / 2 - 32;
    this.y = topMargin + combatArea * 0.72;
  }

  getGlobalLevel() {
    return this.realmIndex * 10 + this.level;
  }

  recalcStats() {
    const realm = REALMS[this.realmIndex];
    const levelMultiplier = 1 + 0.1 * (this.level - 1);

    this.attack = Math.floor(realm.attackBase * levelMultiplier);
    this.maxSpirit = Math.floor(realm.spiritBase * levelMultiplier);
    this.spiritRegen = realm.spiritRegen;
    this.attackSpeed = Math.max(0.5, 2.0);
    this.critRate = 0.05;
    this.critDamage = 2.0;

    // equipment bonuses
    Object.values(this.equipment).forEach(eq => {
      if (!eq) return;
      if (eq.stats.attack) this.attack += Math.floor(eq.stats.attack);
      if (eq.stats.maxSpirit) this.maxSpirit += Math.floor(eq.stats.maxSpirit);
      if (eq.stats.spiritRegen) this.spiritRegen += eq.stats.spiritRegen;
      if (eq.stats.attackSpeed) this.attackSpeed = Math.max(0.3, this.attackSpeed - eq.stats.attackSpeed);
      if (eq.stats.critRate) this.critRate += eq.stats.critRate;
      if (eq.stats.critDamage) this.critDamage += eq.stats.critDamage;
    });

    // outer skill passive bonuses
    this.outerSkills.forEach(skill => {
      if (skill.type === 'passive' || skill.type === 'aura') {
        this.applySkillBonus(skill);
      }
    });

    // inner skill bonuses
    this.innerSkills.forEach(skill => {
      this.applyInnerSkillBonus(skill);
    });

    // cultivation speed
    this.cultivationSpeed = 1;
    this.innerSkills.forEach(skill => {
      if (skill.effectType === 'cultivateSpeed') {
        this.cultivationSpeed += skill.baseEffect * skill.getMultiplier();
      }
      if (skill.effectType === 'cultivateSpeedAndSpirit') {
        this.cultivationSpeed += skill.baseEffect * skill.getMultiplier();
      }
      if (skill.effectType === 'cultivateSpeedExtraCost') {
        this.cultivationSpeed += skill.baseEffect * skill.getMultiplier();
      }
      if (skill.effectType === 'attackAndCultivate') {
        this.cultivationSpeed += skill.baseEffect * skill.getMultiplier();
      }
    });

    // spirit bound
    if (this.spirit > this.maxSpirit) this.spirit = this.maxSpirit;
  }

  applySkillBonus(skill) {
    const effect = skill.baseEffect * skill.getMultiplier();
    switch (skill.effectType) {
      case 'maxSpirit': this.maxSpirit = Math.floor(this.maxSpirit * (1 + effect)); break;
      case 'spiritRegen': this.spiritRegen += effect; break;
      case 'critRate': this.critRate += effect; break;
      case 'attack': this.attack = Math.floor(this.attack * (1 + effect)); break;
      case 'attackSpeed': this.attackSpeed = Math.max(0.3, this.attackSpeed * (1 - effect)); break;
    }
  }

  applyInnerSkillBonus(skill) {
    const effect = skill.baseEffect * skill.getMultiplier();
    switch (skill.effectType) {
      case 'spiritRegen': this.spiritRegen *= (1 + effect); break;
      case 'cultivateSpeedAndSpirit': this.maxSpirit = Math.floor(this.maxSpirit * (1 + effect)); break;
      case 'attackAndCultivate': this.attack = Math.floor(this.attack * (1 + effect)); break;
    }
  }

  addInnerSkill(skill) {
    if (this.innerSkills.find(s => s.id === skill.id)) return;
    this.innerSkills.push(skill);
    this.recalcStats();
  }

  addOuterSkill(skill) {
    if (this.outerSkills.find(s => s.id === skill.id)) return;
    this.outerSkills.push(skill);
    this.recalcStats();
  }

  equipItem(item) {
    if (!item || !item.slot) return;
    const old = this.equipment[item.slot];
    if (old) this.bag.push(old);
    this.equipment[item.slot] = item;
    this.recalcStats();
  }

  addToBag(item) {
    this.bag.push(item);
  }

  update(dt) {
    this.breathTimer += dt * 2;

    // 灵气粒子（高境界才有）
    if (this.realmIndex >= 2 && Math.random() < 0.3 * dt) {
      this.particles.push({
        x: this.x + 20 + Math.random() * 24,
        y: this.y + 40,
        alpha: 1,
        vy: -10 - Math.random() * 10,
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.y += p.vy * dt;
      p.alpha -= dt * 0.8;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }
  }

  render(ctx) {
    const cx = this.x;
    const cy = this.y;
    const w = 64;
    const h = 64;

    ctx.save();

    // 阴影
    ctx.save();
    ctx.translate(cx + 32, cy + h + 4);
    ctx.scale(1, 0.25);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 境界外观对照表
    const realmIdx = this.realmIndex;

    // 服饰颜色
    let robeColor;
    let auraColor = null;
    let auraWidth = 0;

    if (realmIdx <= 0) { // 炼气期 — 灰白布衣
      robeColor = '#CFD8DC';
    } else if (realmIdx <= 1) { // 筑基期 — 青色道袍
      robeColor = '#80CBC4';
      auraColor = 'rgba(128, 203, 196, 0.15)';
      auraWidth = 4;
    } else if (realmIdx <= 2) { // 金丹期 — 蓝白道袍
      robeColor = '#90CAF9';
      auraColor = 'rgba(255, 215, 0, 0.2)';
      auraWidth = 6;
    } else if (realmIdx <= 3) { // 元婴期 — 紫袍
      robeColor = '#CE93D8';
      auraColor = 'rgba(206, 147, 216, 0.25)';
      auraWidth = 8;
    } else if (realmIdx <= 4) { // 化神期 — 金边黑袍
      robeColor = '#424242';
      auraColor = 'rgba(255, 215, 0, 0.3)';
      auraWidth = 10;
    } else if (realmIdx <= 5) { // 炼虚期 — 银白长袍
      robeColor = '#E0E0E0';
      auraColor = 'rgba(176, 190, 197, 0.3)';
      auraWidth = 12;
    } else if (realmIdx <= 6) { // 合体期 — 七彩法袍
      robeColor = '#FFCC80';
      auraColor = 'rgba(255, 215, 0, 0.35)';
      auraWidth = 14;
    } else if (realmIdx <= 7) { // 大乘期 — 纯白仙袍
      robeColor = '#FFFFFF';
      auraColor = 'rgba(255, 255, 255, 0.35)';
      auraWidth = 16;
    } else if (realmIdx <= 8) { // 渡劫期 — 白袍带雷纹
      robeColor = '#FAFAFA';
      auraColor = 'rgba(156, 39, 176, 0.35)';
      auraWidth = 18;
    } else { // 真仙境 — 半透明仙体
      robeColor = 'rgba(255,255,255,0.85)';
      auraColor = 'rgba(255, 215, 0, 0.4)';
      auraWidth = 20;
    }

    // 灵气光环
    if (auraColor && auraWidth > 0) {
      ctx.fillStyle = auraColor;
      ctx.beginPath();
      ctx.arc(cx + 32, cy + 32, 32 + auraWidth, 0, Math.PI * 2);
      ctx.fill();
    }

    const breathOffset = Math.sin(this.breathTimer) * 1.5;

    // 身体（像素风修士）
    ctx.fillStyle = robeColor;
    // 躯干
    ctx.fillRect(cx + 22, cy + 24 + breathOffset, 20, 26);
    // 下摆
    ctx.fillRect(cx + 18, cy + 48 + breathOffset, 28, 12);

    // 头
    ctx.fillStyle = '#FFE0B2';
    ctx.fillRect(cx + 24, cy + 6 + breathOffset, 16, 16);

    // 头发
    ctx.fillStyle = realmIdx >= 8 ? '#FAFAFA' : '#3E2723';
    ctx.fillRect(cx + 24, cy + 4 + breathOffset, 16, 6);
    ctx.fillRect(cx + 22, cy + 6 + breathOffset, 4, 8);
    ctx.fillRect(cx + 38, cy + 6 + breathOffset, 4, 8);

    // 眼睛
    ctx.fillStyle = '#000';
    ctx.fillRect(cx + 28, cy + 14 + breathOffset, 3, 3);
    ctx.fillRect(cx + 35, cy + 14 + breathOffset, 3, 3);

    // 眉毛（高境界更锐利）
    if (realmIdx >= 4) {
      ctx.fillStyle = '#000';
      ctx.fillRect(cx + 27, cy + 11 + breathOffset, 4, 1);
      ctx.fillRect(cx + 35, cy + 11 + breathOffset, 4, 1);
    }

    // 手臂
    ctx.fillStyle = robeColor;
    ctx.fillRect(cx + 10, cy + 28 + breathOffset, 10, 8);
    ctx.fillRect(cx + 44, cy + 28 + breathOffset, 10, 8);

    // 武器（如果有武器装备，显示一把小剑）
    if (this.equipment.weapon) {
      ctx.fillStyle = '#B0BEC5';
      // 剑身
      ctx.fillRect(cx + 52, cy + 22 + breathOffset, 3, 18);
      // 剑尖
      ctx.beginPath();
      ctx.moveTo(cx + 52, cy + 22 + breathOffset);
      ctx.lineTo(cx + 53.5, cy + 16 + breathOffset);
      ctx.lineTo(cx + 55, cy + 22 + breathOffset);
      ctx.closePath();
      ctx.fill();
      // 剑柄
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(cx + 51, cy + 38 + breathOffset, 5, 4);
    }

    // 饰品光环（如果有饰品）
    if (this.equipment.accessory && realmIdx >= 3) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx + 14, cy + 2 + breathOffset, 36, 60);
    }

    // 灵气粒子渲染
    this.particles.forEach(p => {
      drawSpiritParticle(ctx, p.x, p.y, p.alpha);
    });

    // 灵力条（头部上方）
    const barX = cx + 10;
    const barY = cy - 8 + breathOffset;
    const barW = 44;
    const barH = 5;
    const spiritRatio = this.spirit / this.maxSpirit;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    const grad = ctx.createLinearGradient(barX, barY, barX + barW * spiritRatio, barY);
    grad.addColorStop(0, '#42A5F5');
    grad.addColorStop(1, '#90CAF9');
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, barW * spiritRatio, barH);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // 境界标签
    ctx.fillStyle = '#F5E6C8';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.realm}·${this.level}层`, cx + 32, cy + h + 14);

    ctx.restore();
  }
}
