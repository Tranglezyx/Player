import { formatNumber } from '../utils/number';
import MAPS from '../config/maps';
import REALMS from '../config/realms';
import { SAFE_TOP, TOP_BAR_H } from '../render';
import {
  PALETTE,
  drawSpiritStoneIcon,
  drawCultivationIcon,
  drawSpiritIcon,
  drawProgressBar,
  drawPixelBorder,
} from './uiPainter';

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

    // 背景（带底部边框的暗色栏）
    ctx.fillStyle = PALETTE.uiBgTransparent;
    ctx.fillRect(0, top, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, top + h, w, 2);

    // 底部古铜金装饰线
    ctx.fillStyle = PALETTE.uiBorder;
    ctx.fillRect(0, top + h - 2, w, 2);

    // 左侧：地图名 + 修为
    const line1Y = top + 18;
    const line2Y = top + 36;
    const line3Y = top + 52;

    // 地图名
    const mapName = MAPS[GameGlobal.databus.currentMapId]?.name || '青竹林';
    ctx.fillStyle = PALETTE.textHighlight;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`▶ ${mapName}（点击切换）`, padX, line1Y);

    // 修为图标 + 修为进度
    drawCultivationIcon(ctx, padX + 6, line2Y - 4, 10);
    const cultivPercent = Math.min(100, Math.floor((player.cultivation / player.maxCultivation) * 100));
    ctx.fillStyle = PALETTE.textMain;
    ctx.font = '15px sans-serif';
    ctx.fillText(`修为: ${cultivPercent}%  (+${this.cultivationPerMin}/分)`, padX + 16, line2Y);

    // 灵石图标 + 灵石数量
    drawSpiritStoneIcon(ctx, padX + 6, line3Y - 4, 10);
    const paused = GameGlobal.databus.cultivationPaused;
    ctx.fillStyle = paused ? PALETTE.textMuted : PALETTE.spiritStone;
    ctx.font = '15px sans-serif';
    ctx.fillText(`灵石: ${formatNumber(player.spiritStone)} (+${this.stonePerMin}/分)${paused ? ' [暂停]' : ''}`, padX + 16, line3Y);

    // 右侧：灵力条 + 等级
    const barAreaX = w - 150;
    const barY = line1Y - 6;
    const barW = 130;
    const barH = 10;
    const spiritRatio = player.spirit / player.maxSpirit;

    // 灵力标签
    ctx.fillStyle = PALETTE.textMuted;
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('灵力', barAreaX + barW, barY - 4);
    ctx.textAlign = 'left';

    drawProgressBar(ctx, barAreaX, barY, barW, barH, spiritRatio, PALETTE.spirit, '#222', `${player.spirit}/${player.maxSpirit}`);

    // 等级信息
    ctx.fillStyle = PALETTE.textHighlight;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${player.realm}·${player.level}层`, w - padX, line2Y);
    ctx.fillStyle = PALETTE.textMuted;
    ctx.font = '14px sans-serif';
    ctx.fillText(`Lv.${player.getGlobalLevel()}`, w - padX, line3Y);
    ctx.textAlign = 'left';

    ctx.restore();
  }
}
