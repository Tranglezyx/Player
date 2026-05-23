import { PROFICIENCY_LEVELS } from '../config/outerSkills';
import { PANEL_Y, PANEL_H } from '../render';
import {
  PALETTE,
  drawPanel,
  drawListItem,
  drawQualityBadge,
  drawSpiritIcon,
  getQualityColor,
} from './uiPainter';

export default class PanelSkill {
  constructor() {
    this.visible = false;
    this.tab = 'inner';
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

    const tabY = py + 42;
    const tabW = pw / 2;
    if (y >= tabY && y <= tabY + 32) {
      if (x < px + tabW) this.tab = 'inner';
      else this.tab = 'outer';
      return true;
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
    drawPanel(ctx, px, py, pw, ph, '功法');

    // 标签页
    const tabW = pw / 2;
    const tabY = py + 42;
    const tabH = 30;

    // 心法标签
    const innerActive = this.tab === 'inner';
    ctx.fillStyle = innerActive ? 'rgba(201, 169, 110, 0.25)' : 'rgba(255,255,255,0.03)';
    ctx.fillRect(px, tabY, tabW, tabH);
    ctx.fillStyle = innerActive ? PALETTE.uiBorder : '#666';
    ctx.fillRect(px, tabY + tabH - 2, tabW, 2);
    ctx.fillStyle = innerActive ? PALETTE.textHighlight : PALETTE.textMuted;
    ctx.font = innerActive ? 'bold 14px sans-serif' : '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('心法', px + tabW / 2, tabY + 20);

    // 术法标签
    const outerActive = this.tab === 'outer';
    ctx.fillStyle = 'rgba(201, 169, 110, 0.25)';
    ctx.fillRect(px + tabW, tabY, tabW, tabH);
    ctx.fillStyle = outerActive ? PALETTE.uiBorder : '#666';
    ctx.fillRect(px + tabW, tabY + tabH - 2, tabW, 2);
    ctx.fillStyle = outerActive ? PALETTE.textHighlight : PALETTE.textMuted;
    ctx.font = outerActive ? 'bold 14px sans-serif' : '14px sans-serif';
    ctx.fillText('术法', px + tabW + tabW / 2, tabY + 20);

    const listStartY = tabY + tabH + 8;
    let curY = listStartY;

    const skills = this.tab === 'inner' ? player.innerSkills : player.outerSkills;

    if (skills.length === 0) {
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂未习得功法，突破境界可解锁', px + pw / 2, curY + 40);
      ctx.textAlign = 'left';
      ctx.restore();
      return;
    }

    ctx.textAlign = 'left';
    skills.forEach((skill, i) => {
      if (curY > py + ph - 20) return;

      const itemH = 56;
      drawListItem(ctx, px + 5, curY, pw - 10, itemH, i);

      // 功法名称 + 品质色
      const nameColor = skill.proficiencyLevel >= 3 ? PALETTE.quality[4].color : PALETTE.textMain;
      ctx.fillStyle = nameColor;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(skill.name, px + 15, curY + 18);

      // 类型标签
      const typeLabels = { inner: '心法', active: '主动', passive: '被动', aura: '光环' };
      const typeLabel = typeLabels[skill.type] || typeLabels.inner;
      let typeColor = '#4CAF50';
      if (skill.type === 'active') typeColor = '#42A5F5';
      if (skill.type === 'aura') typeColor = PALETTE.textHighlight;

      ctx.fillStyle = typeColor;
      ctx.font = '12px sans-serif';
      ctx.fillText(`[${typeLabel}]`, px + 15, curY + 36);

      // 熟练度
      const profInfo = skill.proficiencyName;
      const nextLevel = PROFICIENCY_LEVELS[skill.proficiencyLevel + 1];
      ctx.fillStyle = PALETTE.textHighlight;
      ctx.font = '12px sans-serif';
      if (nextLevel) {
        ctx.fillText(`${profInfo} ${skill.proficiency}/${nextLevel.threshold}`, px + 70, curY + 36);
      } else {
        ctx.fillText(`${profInfo} (MAX)`, px + 70, curY + 36);
      }

      // 效果值
      const effect = skill.baseEffect * skill.getMultiplier();
      let effectText = '';
      switch (skill.effectType) {
        case 'damage': effectText = `${(effect * 100).toFixed(0)}%伤害`; break;
        case 'cultivateSpeed': effectText = `加速+${(effect * 100).toFixed(0)}%`; break;
        case 'stoneCost': effectText = `消耗-${(effect * 100).toFixed(0)}%`; break;
        case 'maxSpirit': effectText = `灵力上限+${(effect * 100).toFixed(0)}%`; break;
        case 'critRate': effectText = `暴击率+${(effect * 100).toFixed(0)}%`; break;
        case 'spiritRegen': effectText = `灵力回复+${(effect * 100).toFixed(0)}%`; break;
        case 'attack': effectText = `攻击+${(effect * 100).toFixed(0)}%`; break;
        case 'attackSpeed': effectText = `攻速+${(effect * 100).toFixed(0)}%`; break;
        default: effectText = `+${(effect * 100).toFixed(0)}%`;
      }
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(effectText, px + pw - 15, curY + 36);
      ctx.textAlign = 'left';

      // 灵力消耗（主动技能）
      if (skill.spiritCost > 0) {
        drawSpiritIcon(ctx, px + pw - 40, curY + 12, 9);
        ctx.fillStyle = PALETTE.spirit;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${skill.spiritCost}`, px + pw - 15, curY + 18);
        ctx.textAlign = 'left';
      }

      curY += itemH + 4;
    });

    ctx.restore();
  }
}
