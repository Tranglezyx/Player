import MAPS from '../config/maps';

export default class MapSystem {
  constructor() {
    this.dailyFirstKill = {};
  }

  getCurrentMap() {
    const id = GameGlobal.databus.currentMapId;
    return MAPS[id] || MAPS[0];
  }

  isMapUnlocked(mapId, globalLevel) {
    const map = MAPS[mapId];
    if (!map) return false;
    return globalLevel >= map.unlockLevel;
  }

  getUnlockedMaps(globalLevel) {
    return MAPS.filter(m => globalLevel >= m.unlockLevel);
  }

  getRecommendedMap(globalLevel) {
    const unlocked = this.getUnlockedMaps(globalLevel);
    if (unlocked.length === 0) return MAPS[0];
    // return the highest unlocked map
    return unlocked[unlocked.length - 1];
  }

  switchMap(mapId) {
    const player = GameGlobal.databus.cultivator;
    if (!this.isMapUnlocked(mapId, player.getGlobalLevel())) return false;

    GameGlobal.databus.currentMapId = mapId;
    // respawn monster
    if (GameGlobal.databus.combatSystem) {
      GameGlobal.databus.combatSystem.currentMonster = null;
      GameGlobal.databus.combatSystem.monsterSpawnTimer = 0;
    }
    return true;
  }

  getDailyFirstKillReward(mapId) {
    const today = new Date().toDateString();
    if (this.dailyFirstKill[mapId] !== today) {
      this.dailyFirstKill[mapId] = today;
      return true;
    }
    return false;
  }

  getMonsterTierForMap(mapId) {
    const map = MAPS[mapId];
    if (!map || !map.tiers.length) return 1;
    return map.tiers[Math.floor(Math.random() * map.tiers.length)];
  }
}
