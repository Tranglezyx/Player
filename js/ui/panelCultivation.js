import { formatNumber } from '../utils/number';
import REALMS from '../config/realms';
import { PANEL_Y, PANEL_H } from '../render';
import {
  PALETTE,
  drawPanel,
  drawButton,
  drawProgressBar,
  drawAttackIcon,
  drawSpiritIcon,
  drawCultivationIcon,
} from './uiPainter';

export default class PanelCultivation {
  constructor() {
    this.visible = false;
  }

  show() { this.visible = true; }
  hide() { this.visible = false; }

  handleTouch(x, y) {
    if (!this.visible) return false;

    const px = 10;
    const pw = canvas.width - 20;
    const py = PANEL_Y;
    const ph = PANEL_H;

    if (x < px || x > px + pw || y < py || y > py + ph) {
      this.hide();
      return false;
    }

    // Breakthrough button
    const btnX = px + 20;
    const btnY = py + ph - 56;
    const btnW = pw - 40;
    const btnH = 40;

    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      if (GameGlobal.databus.cultivationSystem.canBreakthrough()) {
        GameGlobal.databus.cultivationSystem.breakThrough();
        GameGlobal.databus.skillSystem.unlockRealmSkills(GameGlobal.databus.cultivator.realmIndex);
      }
      return true;
    }

    return true;
  }

  render(ctx) {
    if (!this.visible) return;

    const player = GameGlobal.databus.cultivator;
    const realm = REALMS[player.realmIndex];

    const px = 10;
    const py = PANEL_Y;
    const pw = canvas.width - 20;
    const ph = PANEL_H;

    ctx.save();

    ctx.fillStyle = PALETTE.overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPanel(ctx, px, py, pw, ph, '修炼');

    const pad = 20;
    const contentX = px + pad;
    const contentW = pw - pad * 2;
    const midX = px + pw / 2;

    let curY = py + 50;

    // 境界 — 居中
    ctx.fillStyle = PALETTE.textMain;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`境界: ${player.realm}·${player.level}层`, midX, curY);
    ctx.textAlign = 'left';
    curY += 24;

    // 全局等级 — 居中
    ctx.fillStyle = PALETTE.textMuted;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`全局等级: Lv.${player.getGlobalLevel()}`, midX, curY);
    ctx.textAlign = 'left';
    curY += 24;

    // 修为进度条
    const percent = Math.min(1, player.cultivation / player.maxCultivation);
    drawProgressBar(ctx, contentX, curY, contentW, 18, percent, PALETTE.cultivation, '#333', `${formatNumber(player.cultivation)} / ${formatNumber(player.maxCultivation)}`);
    curY += 34;

    // 属性列表
    const iconX = contentX + 4;
    const labelX = contentX + 32;
    const valX = contentX + contentW - 4;
    const lineH = 28;

    ctx.font = '15px sans-serif';

    const rows = [
      ['attack', '攻击力', formatNumber(player.attack)],
      ['spirit', '灵力', `${player.spirit} / ${player.maxSpirit}`],
      ['cultivation', '修炼速度', `${player.cultivationSpeed} / 秒`],
      ['spirit', '灵力回复', `${player.spiritRegen} / 秒`],
      ['attack', '攻击间隔', `${player.attackSpeed.toFixed(1)} 秒`],
      ['attack', '暴击率', `${(player.critRate * 100).toFixed(1)}%`],
      ['spirit', '灵石消耗', `${realm.stoneCostPerSec} / 秒`],
      ['spirit', '突破消耗', formatNumber(realm.breakthroughCost)],
    ];

    rows.forEach(([icon, label, value]) => {
      // 行底纹
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(contentX - 2, curY - 14, contentW + 4, lineH);

      // 图标
      if (icon === 'attack') drawAttackIcon(ctx, iconX, curY - 2, 12);
      else if (icon === 'spirit') drawSpiritIcon(ctx, iconX, curY - 2, 12);
      else drawCultivationIcon(ctx, iconX, curY - 2, 12);

      // 标签
      ctx.fillStyle = PALETTE.textMuted;
      ctx.textAlign = 'left';
      ctx.fillText(label, labelX, curY);

      // 值（右对齐）
      ctx.fillStyle = PALETTE.textMain;
      ctx.textAlign = 'right';
      ctx.fillText(value, valX, curY);

      curY += lineH;
    });

    ctx.textAlign = 'left';
    curY += 8;

    // 突破按钮
    const btnX = px + 20;
    const btnY = py + ph - 56;
    const btnW = pw - 40;
    const btnH = 40;

    const canB = GameGlobal.databus.cultivationSystem.canBreakthrough();
    const nextRealm = REALMS[Math.min(REALMS.length - 1, player.realmIndex + 1)];

    const hintY = btnY - 8;
    if (player.level >= 10 && !canB) {
      let hint = player.cultivation < player.maxCultivation
        ? `突破需要修为满 (${formatNumber(player.cultivation)}/${formatNumber(player.maxCultivation)})`
        : `突破需要灵石 ${formatNumber(realm.breakthroughCost)}`;
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(hint, midX, hintY);
    } else if (player.level < 10) {
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`升至第${player.level + 1}层后可突破`, midX, hintY);
    }

    if (player.realmIndex >= REALMS.length - 1 && player.level >= 10) {
      ctx.fillStyle = PALETTE.textHighlight;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('已至最高境界！', midX, hintY);
    } else if (canB) {
      drawButton(ctx, btnX, btnY, btnW, btnH, `突破至 ${nextRealm.name}`, false, false);
    }

    ctx.textAlign = 'left';
    ctx.restore();
  }
}
