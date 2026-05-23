import { formatNumber } from '../utils/number';
import MAPS from '../config/maps';
import REALMS from '../config/realms';
import { SAFE_TOP, TOP_BAR_H } from '../render';

export default class TopBar {
  constructor() {
    this.cultivationPerMin = 0;
    this.stonePerMin = 0;
  }

  updatePerMinRates() {
    const player = GameGlobal.databus.cultivator;
    if (!player) return;

    this.cultivationPerMin = Math.floor(player.cultivationSpeed * 60);

    const realm = REALMS[player.realmIndex];
    let stoneCost = Math.floor(player.cultivationSpeed * realm.stoneCostPerSec);
    player.innerSkills.forEach(skill => {
      if (skill.effectType === 'stoneCost') {
        stoneCost = Math.floor(stoneCost * (1 - skill.baseEffect * skill.getMultiplier()));
      }
    });
    this.stonePerMin = Math.floor(stoneCost * 3 * 60);
  }

  update() {
    // sync per min rates every 60 frames
    if (GameGlobal.databus.frame % 3600 === 0) {
      this.updatePerMinRates();
    }
  }

  render(ctx) {
    const player = GameGlobal.databus.cultivator;
    if (!player) return;

    const padX = 12;
    const w = canvas.width;
    const top = SAFE_TOP;
    const h = TOP_BAR_H;

    ctx.save();

    // Background
    ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    ctx.fillRect(0, top, w, h);

    ctx.fillStyle = '#C9A96E';
    ctx.fillRect(0, top + h, w, 2);

    // Line 1: Map name
    const mapName = MAPS[GameGlobal.databus.currentMapId]?.name || '青竹林';
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`▶ ${mapName}`, padX, top + 20);

    // Line 2: Cultivation progress
    ctx.fillStyle = '#F5E6C8';
    ctx.font = '11px sans-serif';
    const cultivPercent = Math.min(100, Math.floor((player.cultivation / player.maxCultivation) * 100));
    ctx.fillText(`修为: ${cultivPercent}%  (+${this.cultivationPerMin}/分)`, padX, top + 38);

    // Spirit bar (right side)
    const spiritRatio = player.spirit / player.maxSpirit;
    const barStart = w - 150;
    const barY = top + 14;
    ctx.fillStyle = '#333';
    ctx.fillRect(barStart, barY, 130, 8);
    ctx.fillStyle = '#42A5F5';
    ctx.fillRect(barStart, barY, 130 * spiritRatio, 8);
    ctx.fillStyle = '#F5E6C8';
    ctx.font = '9px sans-serif';
    ctx.fillText(`灵力 ${player.spirit}/${player.maxSpirit}`, barStart + 2, barY + 20);

    // Line 3: Spirit stone
    ctx.fillStyle = '#00BCD4';
    ctx.font = '11px sans-serif';
    const paused = GameGlobal.databus.cultivationPaused;
    ctx.fillText(`灵石: ${formatNumber(player.spiritStone)} (+${this.stonePerMin}/分)${paused ? ' [暂停]' : ''}`, padX, top + 55);

    // Level info right side
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Lv.${player.getGlobalLevel()}`, w - padX, top + 38);
    ctx.textAlign = 'left';

    ctx.restore();
  }
}
