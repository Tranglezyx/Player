import { MONSTER_TIERS, MONSTER_NAMES } from '../config/monsters';

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

    this.x = 0;
    this.y = 0;
    this.state = 'idle';
    this.isActive = false;
    this.isAnimating = false;
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
    this.name = names[Math.floor(Math.random() * names.length)];

    // 怪物位置：顶部信息栏之下，屏幕垂直 30% 处
    const topMargin = 100;
    const bottomMargin = 70;
    const combatArea = canvas.height - topMargin - bottomMargin;
    this.x = canvas.width / 2 - 40;
    this.y = topMargin + combatArea * 0.25;
    this.state = 'idle';
    this.isActive = true;
    this.isAnimating = false;
  }

  takeDamage(damage) {
    this.hp -= damage;
    this.state = 'hurt';
    // reset hurt state after a brief period
    if (this.hurtTimer) clearTimeout(this.hurtTimer);
    this.hurtTimer = setTimeout(() => {
      if (this.isActive) this.state = 'idle';
    }, 200);
  }

  render(ctx) {
    if (!this.isActive) return;

    const mx = this.x;
    const my = this.y;
    const size = Math.min(64, 32 + this.tier * 3);

    ctx.save();

    // Monster colors by tier
    const tierColors = ['#F5F5F5', '#9E9E9E', '#8BC34A', '#FF7043', '#B0BEC5',
      '#7B1FA2', '#FF5722', '#00BCD4', '#3F51B5', '#FFEB3B',
      '#E91E63', '#00E676', '#651FFF', '#FF1744', '#1DE9B6',
      '#FFD600', '#D500F9', '#2979FF', '#FF6D00', '#FFEA00'];

    const color = tierColors[Math.min(this.tier - 1, tierColors.length - 1)];

    // Body
    ctx.fillStyle = color;
    const bodyWidth = size * 0.6;
    const bodyHeight = size * 0.7;
    ctx.fillRect(mx + size * 0.2, my + size * 0.3, bodyWidth, bodyHeight);

    // Head
    const headSize = size * 0.45;
    ctx.fillRect(mx + size * 0.275, my, headSize, headSize);

    // Eyes
    ctx.fillStyle = this.state === 'hurt' ? '#F44336' : '#FFF';
    ctx.fillRect(mx + size * 0.35, my + headSize * 0.25, size * 0.1, size * 0.1);
    ctx.fillRect(mx + size * 0.55, my + headSize * 0.25, size * 0.1, size * 0.1);

    // HP bar
    const barY = my - 10;
    ctx.fillStyle = '#333';
    ctx.fillRect(mx, barY, size, 6);
    ctx.fillStyle = '#F44336';
    ctx.fillRect(mx, barY, size * (this.hp / this.maxHp), 6);

    // Name
    ctx.fillStyle = '#F5E6C8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, mx + size / 2, my + size + 12);

    ctx.restore();
  }

  getStoneReward() {
    const base = this.stoneBase;
    const range = this.stoneRange;
    return Math.floor(base + (Math.random() * 2 - 1) * range);
  }
}
