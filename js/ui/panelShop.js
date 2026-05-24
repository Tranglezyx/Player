import { formatNumber } from '../utils/number';
import { PANEL_Y, PANEL_H } from '../render';
import {
  PALETTE,
  drawPanel,
  drawListItem,
  drawButton,
  drawIconButton,
  drawQualityBadge,
  getQualityColor,
} from './uiPainter';

export default class PanelShop {
  constructor() {
    this.visible = false;
    this._scrollOffset = 0;
    this._touchStartY = 0;
    this._lastTouchY = 0;
    this._isDragging = false;
    this._pendingIndex = -1;
    this._pendingX = 0;
    this._pendingY = 0;
  }

  show() { this.visible = true; this._scrollOffset = 0; }
  hide() { this.visible = false; }

  handleTouch(x, y) {
    if (!this.visible) return false;

    const px = 10;
    const py = PANEL_Y;
    const pw = canvas.width - 20;
    const ph = PANEL_H;

    if (x < px || x > px + pw || y < py || y > py + ph) {
      this.hide();
      return false;
    }

    this._touchStartY = y;
    this._lastTouchY = y;
    this._isDragging = false;
    this._pendingIndex = -1;

    // 刷新按钮：即时响应
    if (y >= py + 30 && y <= py + 54 && x >= px + pw - 100 && x <= px + pw - 10) {
      if (GameGlobal.databus.shopSystem) {
        GameGlobal.databus.shopSystem.manualRefresh();
      }
      return true;
    }

    // 商品列表：延迟处理
    const shopSystem = GameGlobal.databus.shopSystem;
    if (!shopSystem) return true;

    const listStartY = py + 68;
    const itemH = 56;
    const itemGap = 2;

    for (let i = 0; i < shopSystem.items.length; i++) {
      const curY = listStartY - this._scrollOffset + i * (itemH + itemGap);
      if (curY + itemH < listStartY) continue;
      if (curY > py + ph - 24) break;

      if (y >= curY && y <= curY + itemH) {
        this._pendingIndex = i;
        this._pendingX = x;
        this._pendingY = y;
        break;
      }
    }

    return true;
  }

  handleTouchMove(x, y) {
    if (!this.visible) return;
    const dy = this._lastTouchY - y;
    this._lastTouchY = y;

    if (Math.abs(y - this._touchStartY) > 10) {
      this._isDragging = true;
      this._pendingIndex = -1;
    }

    if (this._isDragging) {
      const maxScroll = this._maxScroll || 0;
      this._scrollOffset = Math.max(0, Math.min(maxScroll, this._scrollOffset + dy));
    }
  }

  handleTouchEnd() {
    if (!this.visible) return;
    if (this._isDragging || this._pendingIndex < 0) return;

    const shopSystem = GameGlobal.databus.shopSystem;
    if (!shopSystem) return;
    if (this._pendingIndex >= shopSystem.items.length) return;

    const px = 10;
    const pw = canvas.width - 20;
    if (this._pendingX > px + pw - 34) {
      shopSystem.toggleLock(this._pendingIndex);
    } else {
      shopSystem.buy(this._pendingIndex);
    }
  }

  render(ctx) {
    if (!this.visible) return;

    const player = GameGlobal.databus.cultivator;
    const shopSystem = GameGlobal.databus.shopSystem;
    if (!shopSystem) return;

    const px = 10;
    const py = PANEL_Y;
    const pw = canvas.width - 20;
    const ph = PANEL_H;

    ctx.save();

    ctx.fillStyle = PALETTE.overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPanel(ctx, px, py, pw, ph, '商店');

    // 刷新倒计时 + 手动刷新按钮
    const remaining = shopSystem.getRemainingTime();
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    ctx.fillStyle = PALETTE.textMuted;
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`下次刷新: ${hours}h${minutes}m`, px + 15, py + 38);

    const refreshCost = 50 * (player.realmIndex + 1) * (1 + shopSystem.manualRefreshCount * 0.2);
    drawButton(ctx, px + pw - 100, py + 30, 90, 24, `刷新 ${formatNumber(Math.floor(refreshCost))}`, false, false);

    // 商品列表
    const listStartY = py + 68;
    const itemH = 54;
    const itemGap = 4;
    let curY = listStartY - this._scrollOffset;

    // clamp scroll
    const visibleH = py + ph - 24 - listStartY;
    const totalH = shopSystem.items.length * (itemH + itemGap);
    this._maxScroll = Math.max(0, totalH - visibleH);
    if (this._scrollOffset > this._maxScroll) this._scrollOffset = this._maxScroll;

    shopSystem.items.forEach((item, i) => {
      if (curY + itemH < listStartY) { curY += itemH + itemGap; return; }
      if (curY > py + ph - 24) return;

      drawListItem(ctx, px + 5, curY, pw - 10, itemH, i, item.locked);

      // 锁定图标区
      const lockColor = item.locked ? PALETTE.textHighlight : '#444';
      ctx.fillStyle = lockColor;
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(item.locked ? '🔒 锁定' : '🔓 购买', px + pw - 15, curY + 16);
      ctx.textAlign = 'left';

      // 商品名 + 品质
      const nameColor = item.qualityIndex !== undefined ? getQualityColor(item.qualityIndex) : PALETTE.textMain;
      ctx.fillStyle = nameColor;
      ctx.font = 'bold 16px sans-serif';

      if (item.qualityIndex !== undefined) {
        drawQualityBadge(ctx, px + 80, curY + 2, item.qualityIndex);
        ctx.textAlign = 'left';
      }

      // 描述
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '14px sans-serif';
      ctx.fillText(item.description || '', px + 15, curY + 35);

      // 价格
      const canAfford = player.spiritStone >= item.price;
      ctx.fillStyle = canAfford ? PALETTE.spiritStone : '#EF5350';
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(formatNumber(item.price) + ' 灵石', px + pw - 15, curY + 38);
      ctx.textAlign = 'left';

      curY += itemH + itemGap;
    });

    if (shopSystem.items.length === 0) {
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无商品', px + pw / 2, listStartY + 30);
    }

    // 底部灵石余额
    ctx.fillStyle = PALETTE.spiritStone;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`持有灵石: ${formatNumber(player.spiritStone)}`, px + pw / 2, py + ph - 10);

    ctx.textAlign = 'left';
    ctx.restore();
  }
}
