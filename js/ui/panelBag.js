import { formatNumber } from '../utils/number';
import { QUALITIES } from '../config/equipment';
import { PANEL_Y, PANEL_H } from '../render';
import {
  PALETTE,
  drawPanel,
  drawListItem,
  drawQualityBadge,
  drawButton,
  drawAttackIcon,
  drawSpiritIcon,
  getQualityColor,
} from './uiPainter';

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
    const itemH = 48;
    const listStartY = py + 120;
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

    ctx.fillStyle = PALETTE.overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPanel(ctx, px, py, pw, ph, '背包');

    const contentX = px + 15;

    // 已装备区域
    ctx.fillStyle = PALETTE.textMain;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('已装备', contentX, py + 44);

    const slots = ['weapon', 'helmet', 'armor', 'boots', 'accessory'];
    const slotNames = ['武器', '头盔', '衣服', '鞋子', '饰品'];
    const slotIcons = ['attack', 'spirit', 'spirit', 'attack', 'attack'];
    let eqY = py + 58;

    slots.forEach((slot, i) => {
      const item = player.equipment[slot];
      if (item) {
        // 装备格背景
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(contentX, eqY - 12, pw - 30, 22);
        ctx.strokeStyle = getQualityColor(item.qualityIndex);
        ctx.lineWidth = 1;
        ctx.strokeRect(contentX, eqY - 12, pw - 30, 22);

        const color = getQualityColor(item.qualityIndex);
        ctx.fillStyle = color;
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(item.name, contentX + 6, eqY + 2);

        drawQualityBadge(ctx, contentX + 90, eqY - 10, item.qualityIndex);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        ctx.fillRect(contentX, eqY - 12, pw - 30, 22);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(contentX, eqY - 12, pw - 30, 22);

        ctx.fillStyle = '#666';
        ctx.font = '13px sans-serif';
        ctx.fillText(`${slotNames[i]}: 空`, contentX + 6, eqY + 2);
      }
      eqY += 26;
    });

    // 背包区域标题
    ctx.fillStyle = PALETTE.textMain;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`背包 (${player.bag.length}件，点击出售)`, contentX, eqY + 6);

    const listStartY = eqY + 18;
    let curY = listStartY;
    const itemH = 48;

    player.bag.forEach((item, i) => {
      if (curY > py + ph - 20) return;

      const qColor = item.qualityIndex !== undefined ? getQualityColor(item.qualityIndex) : '#CCC';
      drawListItem(ctx, px + 5, curY, pw - 10, itemH, i);

      // 左侧品质竖条
      ctx.fillStyle = qColor;
      ctx.fillRect(px + 5, curY, 3, itemH);

      ctx.fillStyle = qColor;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(item.name, px + 18, curY + 18);

      if (item.qualityIndex !== undefined) {
        drawQualityBadge(ctx, px + 100, curY + 2, item.qualityIndex);
      }

      // 属性简述
      let statText = '';
      if (item.stats) {
        const statEntries = Object.entries(item.stats);
        if (statEntries.length > 0) {
          const [k, v] = statEntries[0];
          const statLabels = { attack: '攻击', maxSpirit: '灵力上限', spiritRegen: '灵力回复', attackSpeed: '攻速', critRate: '暴击' };
          statText = `${statLabels[k] || k} +${v}`;
        }
      }
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '12px sans-serif';
      ctx.fillText(statText, px + 18, curY + 35);

      // 售价
      ctx.fillStyle = PALETTE.spiritStone;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`售 ${formatNumber(Math.floor(item.price * 0.5))}`, px + pw - 15, curY + 26);
      ctx.textAlign = 'left';

      curY += itemH + 4;
    });

    if (player.bag.length === 0) {
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('背包空空如也', px + pw / 2, listStartY + 30);
      ctx.textAlign = 'left';
    }

    ctx.restore();
  }
}
