import { formatNumber } from '../utils/number';
import { QUALITIES } from '../config/equipment';
import { PANEL_Y, PANEL_H } from '../render';

export default class PanelBag {
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

    const player = GameGlobal.databus.cultivator;
    const itemH = 44;
    const listStartY = py + 110;
    const tapY = y - listStartY;
    const tapIndex = Math.floor(tapY / (itemH + 2));

    if (tapIndex >= 0 && tapIndex < player.bag.length) {
      if (GameGlobal.databus.equipmentSystem) {
        GameGlobal.databus.equipmentSystem.sellItem(player, tapIndex);
      }
    }

    return true;
  }

  render(ctx) {
    if (!this.visible) return;

    const player = GameGlobal.databus.cultivator;

    const px = 10;
    const py = PANEL_Y;
    const pw = canvas.width - 20;
    const ph = PANEL_H;

    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(26, 26, 46, 0.97)';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#C9A96E';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('背包', px + pw / 2, py + 22);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#F5E6C8';
    ctx.font = '12px sans-serif';
    ctx.fillText('已装备:', px + 15, py + 42);

    const slots = ['weapon', 'helmet', 'armor', 'boots', 'accessory'];
    const slotNames = ['武器', '头盔', '衣服', '鞋子', '饰品'];
    let eqY = py + 58;

    slots.forEach((slot, i) => {
      const item = player.equipment[slot];
      const info = item ? `${item.name}` : '空';
      const color = item ? (QUALITIES[item.qualityIndex]?.color || '#CCC') : '#666';
      ctx.fillStyle = color;
      ctx.font = '11px sans-serif';
      ctx.fillText(`${slotNames[i]}: ${info}`, px + 20, eqY);
      eqY += 16;
    });

    ctx.fillStyle = '#F5E6C8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`背包 (${player.bag.length}件，点击出售):`, px + 15, eqY + 6);

    const listStartY = eqY + 22;
    let curY = listStartY;
    const itemH = 44;

    player.bag.forEach((item, i) => {
      if (curY > py + ph - 20) return;

      const qColor = item.qualityIndex !== undefined ? QUALITIES[item.qualityIndex]?.color || '#CCC' : '#CCC';
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(px + 5, curY, pw - 10, itemH);

      ctx.fillStyle = qColor;
      ctx.font = '12px sans-serif';
      ctx.fillText(item.name, px + 15, curY + 18);

      ctx.fillStyle = '#999';
      ctx.font = '10px sans-serif';
      ctx.fillText(`售价: ${formatNumber(Math.floor(item.price * 0.5))}`, px + 15, curY + 35);

      curY += itemH + 2;
    });

    if (player.bag.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('背包空空如也', px + pw / 2, listStartY + 30);
      ctx.textAlign = 'left';
    }

    ctx.restore();
  }
}
