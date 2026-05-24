import { BOTTOM_BAR_H, SAFE_BOTTOM } from '../render';
import { PALETTE, drawNavIcon, drawRoundRect } from './uiPainter';

export default class BottomBar {
  constructor() {
    this.buttons = [
      { id: 'cultivation', label: '修炼', x: 0, y: 0, w: 0, h: 0 },
      { id: 'skill', label: '功法', x: 0, y: 0, w: 0, h: 0 },
      { id: 'bag', label: '背包', x: 0, y: 0, w: 0, h: 0 },
      { id: 'shop', label: '商店', x: 0, y: 0, w: 0, h: 0 },
    ];
    this.activePanel = null;
    this.h = BOTTOM_BAR_H;
  }

  get y() {
    return canvas.height - this.h - SAFE_BOTTOM;
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
        const wasActive = this.activePanel === btn.id;
        this.activePanel = wasActive ? null : btn.id;
        return wasActive ? null : btn.id;
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

    // 背景
    ctx.fillStyle = PALETTE.uiBgTransparent;
    ctx.fillRect(0, this.y, canvas.width, this.h);

    // 顶部边框线
    ctx.fillStyle = PALETTE.uiBorder;
    ctx.fillRect(0, this.y, canvas.width, 2);

    // 按钮
    const w = canvas.width;
    const btnW = w / this.buttons.length;

    this.buttons.forEach((btn, i) => {
      const bx = i * btnW;
      const by = this.y + 2;
      const isActive = this.activePanel === btn.id;

      // 激活态背景（略微留边距，更宽松）
      if (isActive) {
        ctx.fillStyle = 'rgba(201, 169, 110, 0.12)';
        ctx.fillRect(bx + 4, by + 3, btnW - 8, this.h - 7);
        ctx.strokeStyle = PALETTE.uiBorder;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 6, by + 5, btnW - 12, this.h - 11);
      }

      // 分隔线（更淡更细，上留白更多）
      if (i > 0) {
        ctx.fillStyle = 'rgba(201, 169, 110, 0.12)';
        ctx.fillRect(bx, by + 14, 1, this.h - 28);
      }

      // 像素风格图标
      const iconSize = 24;
      const iconX = bx + btnW / 2 - iconSize / 2;
      const iconY = by + 8;
      const iconColor = isActive ? PALETTE.textHighlight : PALETTE.uiBorder;
      drawNavIcon(ctx, btn.id, iconX, iconY, iconSize, iconColor);

      // 标签（更靠下，与图标留出间距）
      ctx.fillStyle = isActive ? PALETTE.textHighlight : PALETTE.textMain;
      ctx.font = isActive ? 'bold 15px sans-serif' : '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, bx + btnW / 2, by + this.h - 12);
    });

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.restore();
  }
}
