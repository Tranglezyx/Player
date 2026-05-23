import { formatNumber } from '../utils/number';
import REALMS from '../config/realms';
import { PANEL_Y, PANEL_H } from '../render';

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
    ctx.fillText('修炼', px + pw / 2, py + 30);

    // realm info
    ctx.fillStyle = '#F5E6C8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`境界: ${player.realm}·${player.level}层`, px + pw / 2, py + 56);
    ctx.fillText(`全局等级: Lv.${player.getGlobalLevel()}`, px + pw / 2, py + 74);

    // cultivation progress
    const progBarY = py + 90;
    const progBarW = pw - 40;
    ctx.fillStyle = '#333';
    ctx.fillRect(px + 20, progBarY, progBarW, 16);
    const percent = Math.min(1, player.cultivation / player.maxCultivation);
    ctx.fillStyle = '#9C27B0';
    ctx.fillRect(px + 20, progBarY, progBarW * percent, 16);
    ctx.fillStyle = '#F5E6C8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${formatNumber(player.cultivation)} / ${formatNumber(player.maxCultivation)}`, px + pw / 2, progBarY + 12);

    // stats
    ctx.textAlign = 'left';
    const statsX = px + 20;
    let statsY = progBarY + 40;
    const lineH = 20;

    const stats = [
      `攻击力: ${formatNumber(player.attack)}`,
      `攻击间隔: ${player.attackSpeed.toFixed(1)}秒`,
      `暴击率: ${(player.critRate * 100).toFixed(1)}%`,
      `灵力: ${player.spirit}/${player.maxSpirit}`,
      `灵力回复: ${player.spiritRegen}/秒`,
      `修炼速度: ${player.cultivationSpeed}/秒`,
      `灵石消耗: ${realm.stoneCostPerSec}/秒`,
    ];

    stats.forEach(stat => {
      ctx.fillText(stat, statsX, statsY);
      statsY += lineH;
    });

    // breakthrough button
    const btnX = px + 20;
    const btnY = py + ph - 50;
    const btnW = pw - 40;
    const btnH = 36;

    const canB = GameGlobal.databus.cultivationSystem.canBreakthrough();
    const nextRealm = REALMS[Math.min(REALMS.length - 1, player.realmIndex + 1)];

    if (player.level >= 10 && !canB) {
      if (player.cultivation < player.maxCultivation) {
        ctx.fillStyle = '#666';
        ctx.fillText(`突破需要修为满 (${formatNumber(player.cultivation)}/${formatNumber(player.maxCultivation)})`, statsX, btnY + 22);
      } else {
        ctx.fillStyle = '#666';
        ctx.fillText(`突破需要灵石 ${formatNumber(realm.breakthroughCost)}`, statsX, btnY + 22);
      }
    } else if (player.level < 10) {
      ctx.fillStyle = '#666';
      ctx.fillText(`升至第${player.level + 1}层后可突破`, statsX, btnY + 22);
    }

    if (player.realmIndex >= REALMS.length - 1 && player.level >= 10) {
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'center';
      ctx.fillText('已至最高境界！', px + pw / 2, btnY + 22);
      ctx.textAlign = 'left';
    } else if (canB) {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`突破至 ${nextRealm.name}`, px + pw / 2, btnY + 24);
    }

    ctx.textAlign = 'left';
    ctx.restore();
  }
}
