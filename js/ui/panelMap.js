import MAPS from '../config/maps';
import { PANEL_Y, PANEL_H } from '../render';
import {
  PALETTE,
  drawPanel,
  drawListItem,
  drawMapIcon,
} from './uiPainter';

export default class PanelMap {
  constructor() {
    this.visible = false;
    this.scrollY = 0;
  }

  show() { this.visible = true; this.scrollY = 0; }
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
    const globalLevel = player.getGlobalLevel();
    const listStartY = py + 44;
    const itemH = 40;

    const tapY = y - listStartY;
    const tapIndex = Math.floor(tapY / (itemH + 2));

    if (tapIndex >= 0 && tapIndex < MAPS.length) {
      const map = MAPS[tapIndex];
      if (globalLevel >= map.unlockLevel && GameGlobal.databus.mapSystem) {
        GameGlobal.databus.mapSystem.switchMap(map.id);
        this.hide();
      }
    }

    return true;
  }

  render(ctx) {
    if (!this.visible) return;

    const player = GameGlobal.databus.cultivator;
    const globalLevel = player.getGlobalLevel();
    const currentMapId = GameGlobal.databus.currentMapId;

    const px = 10;
    const py = PANEL_Y;
    const pw = canvas.width - 20;
    const ph = PANEL_H;

    ctx.save();

    ctx.fillStyle = PALETTE.overlay;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPanel(ctx, px, py, pw, ph, '选择修炼地图');

    const listStartY = py + 48;
    let curY = listStartY;

    MAPS.forEach((map, i) => {
      if (curY > py + ph - 20) return;

      const itemH = 38;
      const unlocked = globalLevel >= map.unlockLevel;
      const isCurrent = currentMapId === map.id;

      if (isCurrent) {
        ctx.fillStyle = 'rgba(201, 169, 110, 0.15)';
        ctx.fillRect(px + 5, curY, pw - 10, itemH);
        ctx.strokeStyle = PALETTE.uiBorder;
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 5, curY, pw - 10, itemH);
      } else {
        drawListItem(ctx, px + 5, curY, pw - 10, itemH, i);
      }

      // 状态图标
      const icon = unlocked ? (isCurrent ? '▶' : '✅') : '🔒';
      ctx.fillStyle = isCurrent ? PALETTE.textHighlight : (unlocked ? PALETTE.textMain : '#666');
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(icon, px + 14, curY + 15);

      // 地图图标
      if (unlocked) {
        drawMapIcon(ctx, px + 36, curY + 12, 12);
      }

      // 地图名
      ctx.fillStyle = isCurrent ? PALETTE.textHighlight : (unlocked ? PALETTE.textMain : '#666');
      ctx.font = isCurrent ? 'bold 14px sans-serif' : '14px sans-serif';
      ctx.fillText(map.name, px + 52, curY + 15);

      // 等阶信息
      ctx.fillStyle = unlocked ? PALETTE.textMuted : '#555';
      ctx.font = '12px sans-serif';
      const tierInfo = `等阶 ${map.tiers.join('~')}`;
      ctx.fillText(unlocked ? tierInfo : `Lv.${map.unlockLevel}解锁`, px + 52, curY + 30);

      // 描述（右侧）
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(map.desc, px + pw - 14, curY + 30);
      ctx.textAlign = 'left';

      curY += itemH + 3;
    });

    ctx.restore();
  }
}
