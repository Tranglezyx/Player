import { formatNumber, formatPercent } from '../utils/number';
import MAPS from '../config/maps';
import REALMS from '../config/realms';

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

    const padX = 8;
    const w = canvas.width;

    ctx.save();

    // Background
    ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    ctx.fillRect(0, 0, w, 52);

    ctx.fillStyle = '#C9A96E';
    ctx.fillRect(0, 52, w, 2);

    // Line 1: Map name
    const mapName = MAPS[GameGlobal.databus.currentMapId]?.name || '青竹林';
    ctx.fillStyle = '#FFD700';
    ctx.font = '12px sans-serif';
    ctx.fillText(`▶ ${mapName}`, padX, 16);

    // Line 2: Cultivation progress + spirit
    ctx.fillStyle = '#F5E6C8';
    ctx.font = '11px sans-serif';
    const cultivPercent = Math.min(100, Math.floor((player.cultivation / player.maxCultivation) * 100));
    ctx.fillText(`修为: ${cultivPercent}% (+${this.cultivationPerMin}/分)`, padX, 32);

    // Spirit bar
    const spiritRatio = player.spirit / player.maxSpirit;
    ctx.fillStyle = '#333';
    const barStart = w - 140;
    ctx.fillRect(barStart, 22, 130, 8);
    ctx.fillStyle = '#42A5F5';
    ctx.fillRect(barStart, 22, 130 * spiritRatio, 8);
    ctx.fillStyle = '#F5E6C8';
    ctx.font = '9px sans-serif';
    ctx.fillText(`灵力 ${player.spirit}/${player.maxSpirit}`, barStart + 2, 40);

    // Line 3: Spirit stone
    ctx.fillStyle = '#00BCD4';
    ctx.font = '11px sans-serif';
    const paused = GameGlobal.databus.cultivationPaused;
    ctx.fillText(`灵石: ${formatNumber(player.spiritStone)} (+${this.stonePerMin}/分)${paused ? ' [修炼暂停]' : ''}`, padX, 48);

    // Level info right side
    ctx.fillStyle = '#FFD700';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Lv.${player.getGlobalLevel()}`, w - padX, 48);
    ctx.textAlign = 'left';

    ctx.restore();
  }
}
