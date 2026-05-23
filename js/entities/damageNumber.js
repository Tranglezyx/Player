import { formatNumber } from '../utils/number';

export default class DamageNumber {
  constructor() {
    this.value = 0;
    this.x = 0;
    this.y = 0;
    this.alpha = 1;
    this.vy = -60;
    this.color = '#FFFFFF';
    this.isCrit = false;
    this.isActive = false;
    this.lifeTime = 0;
    this.maxLifeTime = 1.0;
  }

  init(x, y, value, isCrit, type) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.alpha = 1;
    this.lifeTime = 0;
    this.isCrit = isCrit;
    this.isActive = true;

    if (type === 'skill') {
      this.color = '#42A5F5';
      this.maxLifeTime = 1.2;
    } else if (isCrit) {
      this.color = '#FFD700';
      this.maxLifeTime = 1.2;
    } else {
      this.color = '#FFFFFF';
      this.maxLifeTime = 0.8;
    }
  }

  update(dt) {
    if (!this.isActive) return;
    this.y += this.vy * dt;
    this.lifeTime += dt;
    this.alpha = 1 - (this.lifeTime / this.maxLifeTime);

    if (this.lifeTime >= this.maxLifeTime) {
      this.isActive = false;
    }
  }

  render(ctx) {
    if (!this.isActive) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    const fontSize = this.isCrit ? 22 : 18;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeText('-' + formatNumber(this.value), this.x, this.y);
    ctx.fillText('-' + formatNumber(this.value), this.x, this.y);
    ctx.restore();
  }
}
