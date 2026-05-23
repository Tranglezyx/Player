import { BOTTOM_BAR_H } from '../render';

export default class BottomBar {
  constructor() {
    this.buttons = [
      { id: 'cultivation', label: '修炼', x: 0, y: 0, w: 0, h: 0 },
      { id: 'skill', label: '功法', x: 0, y: 0, w: 0, h: 0 },
      { id: 'bag', label: '背包', x: 0, y: 0, w: 0, h: 0 },
      { id: 'shop', label: '商店', x: 0, y: 0, w: 0, h: 0 },
      { id: 'map', label: '地图', x: 0, y: 0, w: 0, h: 0 },
    ];
    this.activePanel = null;
    this.h = BOTTOM_BAR_H;
  }

  get y() {
    return canvas.height - this.h;
  }

  getTop() {
    return this.y;
  }

  layout() {
    const w = canvas.width;
    const btnW = w / this.buttons.length;
    const btnH = this.h;

    this.buttons.forEach((btn, i) => {
      btn.x = i * btnW;
      btn.y = this.y;
      btn.w = btnW;
      btn.h = btnH;
    });
  }

  handleTouch(x, y) {
    for (const btn of this.buttons) {
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        this.activePanel = btn.id === this.activePanel ? null : btn.id;
        return btn.id;
      }
    }
    return null;
  }

  closePanel() {
    this.activePanel = null;
  }

  render(ctx) {
    this.layout();

    ctx.save();

    // Background
    ctx.fillStyle = 'rgba(26, 26, 46, 0.95)';
    ctx.fillRect(0, this.y, canvas.width, this.h);

    ctx.fillStyle = '#C9A96E';
    ctx.fillRect(0, this.y, canvas.width, 2);

    // Buttons
    const w = canvas.width;
    const btnW = w / this.buttons.length;

    this.buttons.forEach((btn, i) => {
      const bx = i * btnW;
      const by = this.y + 2;

      // button background
      ctx.fillStyle = this.activePanel === btn.id ? 'rgba(201, 169, 110, 0.3)' : 'transparent';
      ctx.fillRect(bx + 2, by + 2, btnW - 4, this.h - 5);

      // border between buttons
      if (i > 0) {
        ctx.fillStyle = '#C9A96E';
        ctx.fillRect(bx, by + 8, 1, this.h - 18);
      }

      // icon placeholder + label
      const iconArea = { x: bx + btnW / 2 - 12, y: by + 4, w: 24, h: 24 };
      ctx.fillStyle = this.activePanel === btn.id ? '#FFD700' : '#C9A96E';
      ctx.fillRect(iconArea.x, iconArea.y, iconArea.w, iconArea.h);

      // label
      ctx.fillStyle = this.activePanel === btn.id ? '#FFD700' : '#F5E6C8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(btn.label, bx + btnW / 2, by + this.h - 6);
    });

    ctx.textAlign = 'left';
    ctx.restore();
  }
}
