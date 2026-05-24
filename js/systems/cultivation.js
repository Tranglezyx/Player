import REALMS from '../config/realms';

export default class CultivationSystem {
  constructor() {
    this.timer = 0;
    this.TICK_INTERVAL = 1;
  }

  update(dt) {
    this.timer += dt;
    if (this.timer < this.TICK_INTERVAL) return;
    this.timer = 0;

    const player = GameGlobal.databus.cultivator;
    if (!player || !player.autoCultivate) return;

    // check if cultivation is full and level < 10
    if (player.cultivation >= player.maxCultivation) {
      if (player.level < 10) {
        this.levelUp(player);
      }
      return;
    }

    // calculate stone cost
    const realm = REALMS[player.realmIndex];
    let stoneCost = Math.floor(player.cultivationSpeed * realm.stoneCostPerSec);

    // inner skill: focus_spirit reduces stone cost
    player.innerSkills.forEach(skill => {
      if (skill.effectType === 'stoneCost') {
        stoneCost = Math.floor(stoneCost * (1 - skill.baseEffect * skill.getMultiplier()));
      }
    });
    stoneCost = Math.max(1, stoneCost);

    if (player.spiritStone < stoneCost) {
      GameGlobal.databus.cultivationPaused = true;
      // safety net: auto switch to recommended map after 60s
      if (!this.lowStoneTimer) this.lowStoneTimer = 0;
      this.lowStoneTimer += 1;
      if (this.lowStoneTimer >= 60) {
        this.autoSwitchMap();
        this.lowStoneTimer = 0;
      }
      return;
    }

    this.lowStoneTimer = 0;
    GameGlobal.databus.cultivationPaused = false;

    player.spiritStone -= stoneCost;
    player.cultivation += Math.floor(player.cultivationSpeed);

    // spirit regen
    if (player.spirit < player.maxSpirit) {
      player.spirit = Math.min(player.maxSpirit, player.spirit + Math.floor(player.spiritRegen));
    }

    // inner skills proficiency
    player.innerSkills.forEach(skill => {
      skill.proficiency += 1;
      skill.updateProficiency();
    });

    // check level up
    if (player.cultivation >= player.maxCultivation && player.level < 10) {
      this.levelUp(player);
    }
  }

  levelUp(player) {
    player.level += 1;
    player.cultivation = 0;
    player.maxCultivation = this.calcCultivationRequired(player.realmIndex, true);
    player.recalcStats();
  }

  calcCultivationRequired(realmIndex, isRecalc) {
    const realm = REALMS[realmIndex];
    const level = GameGlobal.databus.cultivator ? GameGlobal.databus.cultivator.level : 1;
    const base = realm.cultivationBase * (1 + 0.15 * (level - 1));

    // inner skill: clear_mind increases cultivation cap
    let cap = Math.ceil(base);
    if (GameGlobal.databus.cultivator) {
      GameGlobal.databus.cultivator.innerSkills.forEach(skill => {
        if (skill.effectType === 'cultivateCap') {
          cap = Math.ceil(cap * (1 + skill.baseEffect * skill.getMultiplier()));
        }
      });
    }
    return cap;
  }

  autoSwitchMap() {
    const mapSystem = GameGlobal.databus.mapSystem;
    const player = GameGlobal.databus.cultivator;
    if (mapSystem && player) {
      const globalLv = player.getGlobalLevel();
      const recommendedMap = mapSystem.getRecommendedMap(globalLv);
      if (recommendedMap) {
        GameGlobal.databus.currentMapId = recommendedMap.id;
      }
    }
  }

  canBreakthrough() {
    const player = GameGlobal.databus.cultivator;
    if (player.level < 10) return false;
    if (player.cultivation < player.maxCultivation) return false;
    const realm = REALMS[player.realmIndex];
    let cost = realm.breakthroughCost;
    player.innerSkills.forEach(skill => {
      if (skill.effectType === 'breakthroughCost') {
        cost = Math.floor(cost * (1 - skill.baseEffect * skill.getMultiplier()));
      }
    });
    return player.spiritStone >= cost;
  }

  breakThrough() {
    const player = GameGlobal.databus.cultivator;
    const realm = REALMS[player.realmIndex];
    let cost = realm.breakthroughCost;
    player.innerSkills.forEach(skill => {
      if (skill.effectType === 'breakthroughCost') {
        cost = Math.floor(cost * (1 - skill.baseEffect * skill.getMultiplier()));
      }
    });
    if (player.spiritStone < cost) return false;

    player.spiritStone -= cost;
    player.realmIndex += 1;
    player.level = 1;
    player.realm = REALMS[player.realmIndex].name;
    player.cultivation = 0;
    player.maxCultivation = this.calcCultivationRequired(player.realmIndex, true);
    player.spirit = player.maxSpirit;

    // unlock new skills from realm
    const unlockSkillIds = REALMS[player.realmIndex].unlockSkills || [];
    unlockSkillIds.forEach(skillId => {
      if (!player.innerSkills.find(s => s.id === skillId) &&
          !player.outerSkills.find(s => s.id === skillId)) {
        // skill will be added by skill system later
      }
    });

    player.recalcStats();
    return true;
  }
}
