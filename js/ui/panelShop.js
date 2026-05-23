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
  }

  show() { this.visible = true; }
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

    const refreshBtnY = py + 38;
    const refreshBtnH = 26;
    const refreshBtnX = px + pw - 100;
    const refreshBtnW = 90;

    if (x >= refreshBtnX && x <= refreshBtnX + refreshBtnW && y >= refreshBtnY && y <= refreshBtnY + refreshBtnH) {
      if (GameGlobal.databus.shopSystem) {
        GameGlobal.databus.shopSystem.manualRefresh();
      }
      return true;
    }

    const listStartY = py + 72;
    const itemH = 56;
    const shopSystem = GameGlobal.databus.shopSystem;
    if (!shopSystem) return true;

    const tapY = y - listStartY;
    const tapIndex = Math.floor(tapY / (itemH + 2));

    if (tapIndex >= 0 && tapIndex < shopSystem.items.length) {
      if (x > px + pw - 34) {
        shopSystem.toggleLock(tapIndex);
      } else {
        shopSystem.buy(tapIndex);
      }
    }

    return true;
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
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`下次刷新: ${hours}h${minutes}m`, px + 15, py + 38);

    const refreshCost = 50 * (player.realmIndex + 1) * (1 + shopSystem.manualRefreshCount * 0.2);
    drawButton(ctx, px + pw - 100, py + 30, 90, 24, `刷新 ${formatNumber(Math.floor(refreshCost))}`, false, false);

    // 商品列表
    const listStartY = py + 68;
    let curY = listStartY;

    shopSystem.items.forEach((item, i) => {
      if (curY > py + ph - 24) return;

      const itemH = 54;
      drawListItem(ctx, px + 5, curY, pw - 10, itemH, i, item.locked);

      // 锁定图标区
      const lockColor = item.locked ? PALETTE.textHighlight : '#444';
      ctx.fillStyle = lockColor;
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(item.locked ? '🔒 锁定' : '🔓 购买', px + pw - 15, curY + 16);
      ctx.textAlign = 'left';

      // 商品名 + 品质
      const nameColor = item.qualityIndex !== undefined ? getQualityColor(item.qualityIndex) : PALETTE.textMain;
      ctx.fillStyle = nameColor;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(item.name, px + 15, curY + 17);

      if (item.qualityIndex !== undefined) {
        drawQualityBadge(ctx, px + 80, curY + 2, item.qualityIndex);
      }

      // 描述
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '12px sans-serif';
      ctx.fillText(item.description || '', px + 15, curY + 35);

      // 价格
      const canAfford = player.spiritStone >= item.price;
      ctx.fillStyle = canAfford ? PALETTE.spiritStone : '#EF5350';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(formatNumber(item.price) + ' 灵石', px + pw - 15, curY + 38);
      ctx.textAlign = 'left';

      curY += itemH + 4;
    });

    if (shopSystem.items.length === 0) {
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无商品', px + pw / 2, listStartY + 30);
    }

    // 底部灵石余额
    ctx.fillStyle = PALETTE.spiritStone;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`持有灵石: ${formatNumber(player.spiritStone)}`, px + pw / 2, py + ph - 10);

    ctx.textAlign = 'left';
    ctx.restore();
  }
}
