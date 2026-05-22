import { PROFICIENCY_LEVELS } from '../config/outerSkills';

export default class PanelSkill {
  constructor() {
    this.visible = false;
    this.tab = 'inner'; // 'inner' | 'outer'
    this.scrollY = 0;
  }

  show() { this.visible = true; this.scrollY = 0; }
  hide() { this.visible = false; }

  handleTouch(x, y) {
    if (!this.visible) return false;

    const px = 10;
    const py = 60;
    const pw = canvas.width - 20;
    const ph = canvas.height - 140;

    if (x < px || x > px + pw || y < py || y > py + ph) {
      this.hide();
      return false;
    }

    // Tab switch
    const tabY = py + 30;
    const tabW = pw / 2;
    if (y >= tabY && y <= tabY + 30) {
      if (x < px + tabW) this.tab = 'inner';
      else this.tab = 'outer';
      return true;
    }

    // tap inside: close
    return true;
  }

  render(ctx) {
    if (!this.visible) return;

    const player = GameGlobal.databus.cultivator;

    const px = 10;
    const py = 60;
    const pw = canvas.width - 20;
    const ph = canvas.height - 140;

    ctx.save();

    // overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // panel background
    ctx.fillStyle = 'rgba(26, 26, 46, 0.97)';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#C9A96E';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);

    // title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('功法', px + pw / 2, py + 22);

    // tabs
    const tabW = pw / 2;
    const tabY = py + 30;
    ctx.fillStyle = this.tab === 'inner' ? '#C9A96E' : '#444';
    ctx.fillRect(px, tabY, tabW, 28);
    ctx.fillStyle = '#FFF';
    ctx.font = '12px sans-serif';
    ctx.fillText('心法', px + tabW / 2, tabY + 18);

    ctx.fillStyle = this.tab === 'outer' ? '#C9A96E' : '#444';
    ctx.fillRect(px + tabW, tabY, tabW, 28);
    ctx.fillStyle = '#FFF';
    ctx.fillText('术法', px + tabW + tabW / 2, tabY + 18);

    // skill list
    const listStartY = tabY + 40;
    let curY = listStartY;

    const skills = this.tab === 'inner' ? player.innerSkills : player.outerSkills;

    if (skills.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂未习得功法，突破境界可解锁', px + pw / 2, curY + 40);
      ctx.textAlign = 'left';
      ctx.restore();
      return;
    }

    ctx.textAlign = 'left';
    skills.forEach((skill, i) => {
      if (curY > py + ph - 20) return;

      const itemH = 50;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(px + 5, curY, pw - 10, itemH);

      // skill name
      ctx.fillStyle = '#F5E6C8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(skill.name, px + 15, curY + 18);

      // skill type label
      const typeLabels = { inner: '心法', active: '主动', passive: '被动', aura: '光环' };
      const typeLabel = typeLabels[skill.type] || typeLabels.inner;
      ctx.fillStyle = skill.type === 'active' ? '#42A5F5' : '#4CAF50';
      ctx.font = '10px sans-serif';
      ctx.fillText(`[${typeLabel}]`, px + 15, curY + 35);

      // proficiency
      const profInfo = skill.proficiencyName;
      const nextLevel = PROFICIENCY_LEVELS[skill.proficiencyLevel + 1];
      ctx.fillStyle = '#FFD700';
      ctx.font = '10px sans-serif';
      if (nextLevel) {
        ctx.fillText(`${profInfo} ${skill.proficiency}/${nextLevel.threshold}`, px + 80, curY + 35);
      } else {
        ctx.fillText(`${profInfo} (MAX)`, px + 80, curY + 35);
      }

      // effect preview
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
      ctx.fillText(effectText, px + pw - 120, curY + 35);

      // spirit cost for active skills
      if (skill.spiritCost > 0) {
        ctx.fillStyle = '#42A5F5';
        ctx.font = '10px sans-serif';
        ctx.fillText(`灵力${skill.spiritCost}`, px + pw - 120, curY + 18);
      }

      curY += itemH + 2;
    });

    ctx.restore();
  }
}
