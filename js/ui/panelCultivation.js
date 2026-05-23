import { formatNumber } from '../utils/number';
import REALMS from '../config/realms';
import { PANEL_Y, PANEL_H } from '../render';
import {
  PALETTE,
  drawPanel,
  drawButton,
  drawProgressBar,
  drawQualityBadge,
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

    const panelX = 10;
    const panelY = PANEL_Y;
    const panelW = canvas.width - 20;
    const panelH = PANEL_H;

    if (x < panelX || x > panelX + panelW || y < panelY || y > panelY + panelH) {
      this.hide();
      return false;
    }

    // Breakthrough button
    const btnX = panelX + 20;
    const btnY = panelY + panelH - 60;
    const btnW = panelW - 40;
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

    // 遮罩 + 面板
    ctx.fillStyle = PALETTE.overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPanel(ctx, px, py, pw, ph, '修炼');

    const contentX = px + 18;
    let curY = py + 48;

    // 境界信息 + 品质标签
    ctx.fillStyle = PALETTE.textMain;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`境界: ${player.realm}·${player.level}层`, contentX, curY);
    drawQualityBadge(ctx, contentX + 120, curY - 13, Math.min(player.realmIndex, 5));
    curY += 20;

    ctx.fillStyle = PALETTE.textMuted;
    ctx.font = '13px sans-serif';
    ctx.fillText(`全局等级: Lv.${player.getGlobalLevel()}`, contentX, curY);
    curY += 26;

    // 修为进度条
    const percent = Math.min(1, player.cultivation / player.maxCultivation);
    drawProgressBar(ctx, contentX, curY, pw - 36, 18, percent, PALETTE.cultivation, '#333', `${formatNumber(player.cultivation)} / ${formatNumber(player.maxCultivation)}`);
    curY += 30;

    // 属性列表（两列布局）
    const col2X = px + pw / 2 + 8;
    const lineH = 22;

    const stats = [
      { icon: 'attack', label: '攻击力', value: formatNumber(player.attack) },
      { icon: 'spirit', label: '灵力', value: `${player.spirit}/${player.maxSpirit}` },
      { icon: 'cultivation', label: '修炼速度', value: `${player.cultivationSpeed}/秒` },
      { icon: 'spirit', label: '灵力回复', value: `${player.spiritRegen}/秒` },
    ];

    ctx.fillStyle = PALETTE.textMain;
    ctx.font = '13px sans-serif';

    // 左列
    let leftY = curY;
    stats.slice(0, 2).forEach((stat) => {
      if (stat.icon === 'attack') drawAttackIcon(ctx, contentX + 6, leftY - 4, 10);
      else if (stat.icon === 'spirit') drawSpiritIcon(ctx, contentX + 6, leftY - 4, 10);
      else drawCultivationIcon(ctx, contentX + 6, leftY - 4, 10);
      ctx.fillStyle = PALETTE.textMuted;
      ctx.fillText(stat.label, contentX + 18, leftY);
      ctx.fillStyle = PALETTE.textMain;
      ctx.fillText(String(stat.value), contentX + 68, leftY);
      leftY += lineH;
    });

    // 右列
    let rightY = curY;
    stats.slice(2).forEach((stat) => {
      if (stat.icon === 'attack') drawAttackIcon(ctx, col2X + 6, rightY - 4, 10);
      else if (stat.icon === 'spirit') drawSpiritIcon(ctx, col2X + 6, rightY - 4, 10);
      else drawCultivationIcon(ctx, col2X + 6, rightY - 4, 10);
      ctx.fillStyle = PALETTE.textMuted;
      ctx.fillText(stat.label, col2X + 18, rightY);
      ctx.fillStyle = PALETTE.textMain;
      ctx.fillText(String(stat.value), col2X + 78, rightY);
      rightY += lineH;
    });

    curY = Math.max(leftY, rightY) + 10;

    // 其他属性
    ctx.fillStyle = PALETTE.textMuted;
    ctx.font = '13px sans-serif';
    ctx.fillText(`攻击间隔: ${player.attackSpeed.toFixed(1)}秒    暴击率: ${(player.critRate * 100).toFixed(1)}%`, contentX, curY);
    curY += 18;
    ctx.fillText(`灵石消耗: ${realm.stoneCostPerSec}/秒    突破消耗: ${formatNumber(realm.breakthroughCost)}`, contentX, curY);

    // 突破按钮
    const btnX = px + 20;
    const btnY = py + ph - 54;
    const btnW = pw - 40;
    const btnH = 38;

    const canB = GameGlobal.databus.cultivationSystem.canBreakthrough();
    const nextRealm = REALMS[Math.min(REALMS.length - 1, player.realmIndex + 1)];

    if (player.level >= 10 && !canB) {
      let hint = '';
      if (player.cultivation < player.maxCultivation) {
        hint = `突破需要修为满 (${formatNumber(player.cultivation)}/${formatNumber(player.maxCultivation)})`;
      } else {
        hint = `突破需要灵石 ${formatNumber(realm.breakthroughCost)}`;
      }
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(hint, px + pw / 2, btnY + 22);
    } else if (player.level < 10) {
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`升至第${player.level + 1}层后可突破`, px + pw / 2, btnY + 22);
    }

    if (player.realmIndex >= REALMS.length - 1 && player.level >= 10) {
      ctx.fillStyle = PALETTE.textHighlight;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('已至最高境界！', px + pw / 2, btnY + 22);
    } else if (canB) {
      drawButton(ctx, btnX, btnY, btnW, btnH, `突破至 ${nextRealm.name}`, false, false);
    }

    ctx.textAlign = 'left';
    ctx.restore();
  }
}
