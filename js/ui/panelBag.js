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
    this._expandedSlot = null;
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

    // 已装备槽位点击
    if (this._eqRects) {
      for (const rect of this._eqRects) {
        if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
          if (rect.hasItem) {
            this._expandedSlot = this._expandedSlot === rect.slot ? null : rect.slot;
          }
          return true;
        }
      }
    }

    const listStartY = this._lastListStartY || py + 236;
    const itemH = 48;
    const btnW = 26;
    const btnH = 20;
    const btnGap = 6;
    const btnAreaLeft = px + pw - 10 - btnW * 2 - btnGap;

    for (let i = 0; i < player.bag.length; i++) {
      const curY = listStartY + i * (itemH + 6);
      if (curY > py + ph - 20) break;

      if (y >= curY && y <= curY + itemH) {
        const btnY = curY + (itemH - btnH) / 2;
        const item = player.bag[i];

        if (item.slot && x >= btnAreaLeft && x <= btnAreaLeft + btnW && y >= btnY && y <= btnY + btnH) {
          player.equipItem(item);
          player.bag.splice(i, 1);
          return true;
        }
        if (x >= btnAreaLeft + btnW + btnGap && x <= btnAreaLeft + btnW * 2 + btnGap && y >= btnY && y <= btnY + btnH) {
          if (GameGlobal.databus.equipmentSystem) {
            GameGlobal.databus.equipmentSystem.sellItem(player, i);
          }
          return true;
        }
        break;
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
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('已装备', contentX, py + 44);

    const slots = ['weapon', 'helmet', 'armor', 'boots', 'accessory'];
    const slotNames = ['武器', '头盔', '衣服', '鞋子', '饰品'];
    const slotIcons = ['attack', 'spirit', 'spirit', 'attack', 'attack'];
    let eqY = py + 58;

    this._eqRects = [];
    const statLabels = { attack: '攻击', maxSpirit: '灵力上限', spiritRegen: '灵力回复', attackSpeed: '攻速', critRate: '暴击' };

    slots.forEach((slot, i) => {
      const item = player.equipment[slot];
      const isExpanded = item && this._expandedSlot === slot;
      const boxH = isExpanded ? 38 : 22;
      const step = isExpanded ? 48 : 32;
      const boxX = contentX;
      const boxY = eqY - 12;
      const boxW = pw - 30;

      this._eqRects.push({
        slot,
        x: boxX,
        y: boxY,
        w: boxW,
        h: boxH,
        hasItem: !!item,
      });

      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(boxX, boxY, boxW, boxH);

      if (item) {
        ctx.strokeStyle = getQualityColor(item.qualityIndex);
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        const color = getQualityColor(item.qualityIndex);
        ctx.fillStyle = color;
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(item.name, contentX + 6, eqY + 2);

        drawQualityBadge(ctx, contentX + 90, eqY - 10, item.qualityIndex);
        ctx.textAlign = 'left';

        if (isExpanded) {
          const statEntries = Object.entries(item.stats);
          const statText = statEntries.map(([k, v]) => `${statLabels[k] || k}+${v}`).join('  ');
          ctx.fillStyle = color;
          ctx.font = '13px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(statText, contentX + 6, eqY + 20);
        }
      } else {
        ctx.strokeStyle = 'rgba(100,100,100,0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.fillStyle = '#888';
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${slotNames[i]}: 空`, contentX + 6, eqY + 2);
      }
      eqY += step;
    });

    // 背包区域标题
    ctx.fillStyle = PALETTE.textMain;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`背包 (${player.bag.length}件)`, contentX, eqY + 6);

    const listStartY = eqY + 18;
    this._lastListStartY = listStartY;
    let curY = listStartY;
    const itemH = 48;
    const btnW = 26;
    const btnH = 20;
    const btnGap = 6;
    const btnStartX = px + pw - 10 - btnW * 2 - btnGap;

    player.bag.forEach((item, i) => {
      if (curY > py + ph - 20) return;

      const qColor = item.qualityIndex !== undefined ? getQualityColor(item.qualityIndex) : '#CCC';
      drawListItem(ctx, px + 5, curY, pw - 10, itemH, i);

      // 左侧品质竖条
      ctx.fillStyle = qColor;
      ctx.fillRect(px + 5, curY, 3, itemH);

      ctx.fillStyle = qColor;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.name, px + 18, curY + 18);

      if (item.qualityIndex !== undefined) {
        drawQualityBadge(ctx, px + 100, curY + 2, item.qualityIndex);
        ctx.textAlign = 'left';
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
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(statText, px + 18, curY + 35);

      // 操作按钮
      const btnY = curY + (itemH - btnH) / 2;
      if (item.slot) {
        drawButton(ctx, btnStartX, btnY, btnW, btnH, '穿', false, false);
      }
      drawButton(ctx, btnStartX + btnW + btnGap, btnY, btnW, btnH, '售', false, false);
      ctx.textAlign = 'left';

      curY += itemH + 6;
    });

    if (player.bag.length === 0) {
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('背包空空如也', px + pw / 2, listStartY + 30);
      ctx.textAlign = 'left';
    }

    ctx.restore();
  }
}
