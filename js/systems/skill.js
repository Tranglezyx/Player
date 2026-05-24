import INNER_SKILLS from '../config/innerSkills';
import { OUTER_SKILLS, PROFICIENCY_LEVELS } from '../config/outerSkills';
import REALMS from '../config/realms';

class SkillInstance {
  constructor(config, type) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type || 'inner';
    this.effectType = config.effectType;
    this.baseEffect = config.baseEffect;
    this.spiritCost = config.spiritCost || 0;
    this.desc = config.desc;
    this.proficiency = 0;
    this.proficiencyLevel = 0;
  }

  getMultiplier() {
    return PROFICIENCY_LEVELS[this.proficiencyLevel].multiplier;
  }

  get proficiencyName() {
    return PROFICIENCY_LEVELS[this.proficiencyLevel].name;
  }

  updateProficiency() {
    let upgraded = false;
    while (true) {
      const nextLevel = PROFICIENCY_LEVELS[this.proficiencyLevel + 1];
      if (nextLevel && this.proficiency >= nextLevel.threshold) {
        this.proficiencyLevel += 1;
        upgraded = true;
      } else {
        break;
      }
    }
    if (upgraded) {
      GameGlobal.databus.cultivator.recalcStats();
    }
    return upgraded;
  }
}

export { SkillInstance };

export default class SkillSystem {
  unlockRealmSkills(realmIndex) {
    const player = GameGlobal.databus.cultivator;
    const unlockIds = REALMS[realmIndex].unlockSkills || [];

    unlockIds.forEach(skillId => {
      const innerCfg = INNER_SKILLS.find(s => s.id === skillId);
      if (innerCfg) {
        if (!player.innerSkills.find(s => s.id === skillId)) {
          player.addInnerSkill(new SkillInstance(innerCfg, 'inner'));
        }
        return;
      }

      const outerCfg = OUTER_SKILLS.find(s => s.id === skillId);
      if (outerCfg) {
        if (!player.outerSkills.find(s => s.id === skillId)) {
          player.addOuterSkill(new SkillInstance(outerCfg, 'outer'));
        }
      }
    });
  }

  learnSkill(skillId, skillType) {
    const player = GameGlobal.databus.cultivator;
    if (skillType === 'inner') {
      const cfg = INNER_SKILLS.find(s => s.id === skillId);
      if (cfg) player.addInnerSkill(new SkillInstance(cfg, 'inner'));
    } else {
      const cfg = OUTER_SKILLS.find(s => s.id === skillId);
      if (cfg) player.addOuterSkill(new SkillInstance(cfg, 'outer'));
    }
    player.recalcStats();
  }

  getSkillConfig(skillId, skillType) {
    if (skillType === 'inner' || skillType === '心法') {
      return INNER_SKILLS.find(s => s.id === skillId);
    }
    return OUTER_SKILLS.find(s => s.id === skillId);
  }
}
