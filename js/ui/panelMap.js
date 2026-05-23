import MAPS from '../config/maps';
import { PANEL_Y, PANEL_H } from '../render';

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
    const listStartY = py + 40;
    const itemH = 38;

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
    ctx.fillText('选择修炼地图', px + pw / 2, py + 22);

    // maps
    const listStartY = py + 44;
    let curY = listStartY;

    MAPS.forEach((map, i) => {
      if (curY > py + ph - 20) return;

      const itemH = 34;
      const unlocked = globalLevel >= map.unlockLevel;
      const isCurrent = currentMapId === map.id;

      ctx.fillStyle = isCurrent ? 'rgba(201, 169, 110, 0.2)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(px + 5, curY, pw - 10, itemH);

      const icon = unlocked ? (isCurrent ? '▶' : '✅') : '🔒';
      ctx.fillStyle = unlocked ? '#F5E6C8' : '#666';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${icon} ${map.name}`, px + 15, curY + 14);

      ctx.fillStyle = '#999';
      ctx.font = '10px sans-serif';
      const tierInfo = `等阶 ${map.tiers.join('~')}`;
      ctx.fillText(unlocked ? tierInfo : `Lv.${map.unlockLevel}解锁`, px + 15, curY + 28);

      ctx.fillText(map.desc, px + 120, curY + 28);

      curY += itemH + 2;
    });

    ctx.restore();
  }
}
