import Sprite from '../base/sprite';
import REALMS from '../config/realms';
import INNER_SKILLS from '../config/innerSkills';
import { OUTER_SKILLS } from '../config/outerSkills';

export default class Cultivator {
  constructor() {
    this.name = '无名修士';
    this.realmIndex = 0;
    this.realm = REALMS[0].name;
    this.level = 1;

    this.attack = 10;
    this.attackSpeed = 2.0;
    this.critRate = 0.05;
    this.critDamage = 2.0;

    this.spirit = 50;
    this.maxSpirit = 50;
    this.spiritRegen = 5;

    this.cultivation = 0;
    this.maxCultivation = 600;
    this.cultivationSpeed = 1;
    this.spiritStone = 0;
    this.autoCultivate = true;

    this.equipment = {
      weapon: null,
      helmet: null,
      armor: null,
      boots: null,
      accessory: null,
    };
    this.bag = [];

    this.innerSkills = [];
    this.outerSkills = [];

    this.x = 0;
    this.y = 0;
    this.state = 'idle';
    this.attackTimer = 0;

    this.initPosition();
  }

  initPosition() {
    this.x = canvas.width / 2 - 32;
    this.y = canvas.height * 0.6;
  }

  getGlobalLevel() {
    return this.realmIndex * 10 + this.level;
  }

  recalcStats() {
    const realm = REALMS[this.realmIndex];
    const levelMultiplier = 1 + 0.1 * (this.level - 1);

    this.attack = Math.floor(realm.attackBase * levelMultiplier);
    this.maxSpirit = Math.floor(realm.spiritBase * levelMultiplier);
    this.spiritRegen = realm.spiritRegen;
    this.attackSpeed = Math.max(0.5, 2.0);
    this.critRate = 0.05;
    this.critDamage = 2.0;

    // equipment bonuses
    Object.values(this.equipment).forEach(eq => {
      if (!eq) return;
      if (eq.stats.attack) this.attack += Math.floor(eq.stats.attack);
      if (eq.stats.maxSpirit) this.maxSpirit += Math.floor(eq.stats.maxSpirit);
      if (eq.stats.spiritRegen) this.spiritRegen += eq.stats.spiritRegen;
      if (eq.stats.attackSpeed) this.attackSpeed = Math.max(0.3, this.attackSpeed - eq.stats.attackSpeed);
      if (eq.stats.critRate) this.critRate += eq.stats.critRate;
      if (eq.stats.critDamage) this.critDamage += eq.stats.critDamage;
    });

    // outer skill passive bonuses
    this.outerSkills.forEach(skill => {
      if (skill.type === 'passive' || skill.type === 'aura') {
        this.applySkillBonus(skill);
      }
    });

    // inner skill bonuses
    this.innerSkills.forEach(skill => {
      this.applyInnerSkillBonus(skill);
    });

    // cultivation speed
    this.cultivationSpeed = 1;
    this.innerSkills.forEach(skill => {
      if (skill.effectType === 'cultivateSpeed') {
        this.cultivationSpeed += skill.baseEffect * skill.getMultiplier();
      }
      if (skill.effectType === 'cultivateSpeedAndSpirit') {
        this.cultivationSpeed += skill.baseEffect * skill.getMultiplier();
      }
      if (skill.effectType === 'cultivateSpeedExtraCost') {
        this.cultivationSpeed += skill.baseEffect * skill.getMultiplier();
      }
      if (skill.effectType === 'attackAndCultivate') {
        this.cultivationSpeed += skill.baseEffect * skill.getMultiplier();
      }
    });

    // spirit bound
    if (this.spirit > this.maxSpirit) this.spirit = this.maxSpirit;

    // cultivation cap from inner skills
    const baseCap = this.maxCultivation;
    this.innerSkills.forEach(skill => {
      if (skill.effectType === 'cultivateCap') {
        // handled in cultivation system, not here
      }
    });
  }

  applySkillBonus(skill) {
    const effect = skill.baseEffect * skill.getMultiplier();
    switch (skill.effectType) {
      case 'maxSpirit': this.maxSpirit = Math.floor(this.maxSpirit * (1 + effect)); break;
      case 'spiritRegen': this.spiritRegen += effect; break;
      case 'critRate': this.critRate += effect; break;
      case 'attack': this.attack = Math.floor(this.attack * (1 + effect)); break;
      case 'attackSpeed': this.attackSpeed = Math.max(0.3, this.attackSpeed * (1 - effect)); break;
    }
  }

  applyInnerSkillBonus(skill) {
    const effect = skill.baseEffect * skill.getMultiplier();
    switch (skill.effectType) {
      case 'spiritRegen': this.spiritRegen *= (1 + effect); break;
      case 'cultivateSpeedAndSpirit': this.maxSpirit = Math.floor(this.maxSpirit * (1 + effect)); break;
      case 'attackAndCultivate': this.attack = Math.floor(this.attack * (1 + effect)); break;
    }
  }

  addInnerSkill(skill) {
    if (this.innerSkills.find(s => s.id === skill.id)) return;
    this.innerSkills.push(skill);
    this.recalcStats();
  }

  addOuterSkill(skill) {
    if (this.outerSkills.find(s => s.id === skill.id)) return;
    this.outerSkills.push(skill);
    this.recalcStats();
  }

  equipItem(item) {
    if (!item || !item.slot) return;
    const old = this.equipment[item.slot];
    if (old) this.bag.push(old);
    this.equipment[item.slot] = item;
    this.recalcStats();
  }

  addToBag(item) {
    this.bag.push(item);
  }

  render(ctx) {
    const cx = this.x;
    const cy = this.y;
    const w = 64;
    const h = 64;

    // Draw simple pixel cultivator
    ctx.save();

    // Body
    ctx.fillStyle = REALMS[this.realmIndex].index <= 1 ? '#CCCCCC' :
      REALMS[this.realmIndex].index <= 3 ? '#8B9DC3' :
      REALMS[this.realmIndex].index <= 5 ? '#9C27B0' :
      REALMS[this.realmIndex].index <= 7 ? '#E1BEE7' :
      '#FFFFFF';

    ctx.fillRect(cx + 20, cy + 20, 24, 28);
    // Head
    ctx.fillStyle = '#FFE0B2';
    ctx.fillRect(cx + 20, cy + 4, 24, 18);
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(cx + 28, cy + 10, 4, 4);
    ctx.fillRect(cx + 36, cy + 10, 4, 4);

    // Spirit bar above head
    ctx.fillStyle = '#333';
    ctx.fillRect(cx + 8, cy - 8, 48, 6);
    ctx.fillStyle = '#42A5F5';
    ctx.fillRect(cx + 8, cy - 8, 48 * (this.spirit / this.maxSpirit), 6);

    // Label
    ctx.fillStyle = '#F5E6C8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.realm}·${this.level}层`, cx + 32, cy + 60);

    ctx.restore();
  }
}
