import { TOP_BAR_H, SAFE_TOP, BOTTOM_BAR_H } from '../render';

export default class FloatingText {
  constructor() {
    this.texts = [];
  }

  show(message, color) {
    const topArea = SAFE_TOP + TOP_BAR_H;
    const bottomArea = BOTTOM_BAR_H;
    const centerY = topArea + (canvas.height - topArea - bottomArea) * 0.3;
    this.texts.push({
      text: message,
      color: color || '#FFD700',
      alpha: 1,
      lifeTime: 0,
      maxLifeTime: 2.5,
      y: centerY,
    });
  }

  update(dt) {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.lifeTime += dt;
      t.alpha = 1 - (t.lifeTime / t.maxLifeTime);
      t.y -= 20 * dt;
      if (t.lifeTime >= t.maxLifeTime) {
        this.texts.splice(i, 1);
      }
    }
  }

  render(ctx) {
    this.texts.forEach(t => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.fillStyle = t.color;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeText(t.text, canvas.width / 2, t.y);
      ctx.fillText(t.text, canvas.width / 2, t.y);
      ctx.restore();
    });
  }
}
