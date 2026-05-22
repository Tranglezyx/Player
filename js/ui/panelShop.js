import { formatNumber } from '../utils/number';

export default class PanelShop {
  constructor() {
    this.visible = false;
    this.scrollY = 0;
  }

  show() { this.visible = true; this.scrollY = 0; }
  hide() { this.visible = false; }

  handleTouch(x, y) {
    if (!this.visible) return false;

    const px = 10;
    const py = 60;
    const pw = canvas.width - 20;
    const ph = canvas.height - 140;

    if (x < px || x > px + pw || y < py || y > py + ph) {
      this.hide();
      return false;
    }

    // Check if tapped refresh button
    const refreshBtnY = py + 32;
    const refreshBtnH = 24;
    const refreshBtnX = px + pw - 100;
    const refreshBtnW = 85;

    if (x >= refreshBtnX && x <= refreshBtnX + refreshBtnW && y >= refreshBtnY && y <= refreshBtnY + refreshBtnH) {
      if (GameGlobal.databus.shopSystem) {
        GameGlobal.databus.shopSystem.manualRefresh();
      }
      return true;
    }

    // Item tap area
    const listStartY = py + 65;
    const itemH = 52;
    const shopSystem = GameGlobal.databus.shopSystem;
    if (!shopSystem) return true;

    const tapY = y - listStartY;
    const tapIndex = Math.floor(tapY / (itemH + 2));

    if (tapIndex >= 0 && tapIndex < shopSystem.items.length) {
      // toggle lock if tap on right side, else buy
      if (x > px + pw - 30) {
        shopSystem.toggleLock(tapIndex);
      } else {
        const result = shopSystem.buy(tapIndex);
        if (!result.success) {
          // show feedback - just skip for now
        }
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
    const py = 60;
    const pw = canvas.width - 20;
    const ph = canvas.height - 140;

    ctx.save();

    // overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // panel
    ctx.fillStyle = 'rgba(26, 26, 46, 0.97)';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#C9A96E';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);

    // title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('商店', px + pw / 2, py + 22);

    // timer + refresh button
    const remaining = shopSystem.getRemainingTime();
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    ctx.fillStyle = '#999';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`刷新倒计时: ${hours}h${minutes}m`, px + 15, py + 48);

    const refreshCost = 50 * (player.realmIndex + 1) * (1 + shopSystem.manualRefreshCount * 0.2);
    ctx.fillText(`手动刷新 ${formatNumber(Math.floor(refreshCost))}灵石`, px + 15, py + 62);

    // button highlight
    ctx.strokeStyle = '#C9A96E';
    ctx.strokeRect(px + pw - 105, py + 46, 90, 22);

    // items
    const listStartY = py + 75;
    let curY = listStartY;

    shopSystem.items.forEach((item, i) => {
      if (curY > py + ph - 20) return;

      const itemH = 50;
      ctx.fillStyle = item.locked ? 'rgba(201, 169, 110, 0.15)' : 'rgba(255,255,255,0.04)';
      ctx.fillRect(px + 5, curY, pw - 10, itemH);

      ctx.fillStyle = item.locked ? '#FFD700' : '#F5E6C8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.name, px + 15, curY + 17);

      ctx.fillStyle = '#00BCD4';
      ctx.font = '11px sans-serif';
      ctx.fillText(formatNumber(item.price) + '灵石', px + pw - 75, curY + 17);

      ctx.fillStyle = '#999';
      ctx.font = '10px sans-serif';
      ctx.fillText(item.description || '', px + 15, curY + 35);

      // lock indicator
      ctx.fillStyle = item.locked ? '#FFD700' : '#666';
      ctx.font = '11px sans-serif';
      ctx.fillText(item.locked ? '锁定' : '点击购买', px + 15, curY + 48);

      curY += itemH + 2;
    });

    if (shopSystem.items.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无商品', px + pw / 2, listStartY + 30);
    }

    // bottom: spirit stone
    ctx.fillStyle = '#00BCD4';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`灵石: ${formatNumber(player.spiritStone)}`, px + pw / 2, py + ph - 8);

    ctx.textAlign = 'left';
    ctx.restore();
  }
}
