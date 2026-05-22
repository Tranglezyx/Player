import Pool from './base/pool';

let instance;

export default class DataBus {
  enemys = [];
  bullets = [];
  animations = [];
  frame = 0;
  score = 0;
  isGameOver = false;
  pool = new Pool();

  monsters = [];
  damageNumbers = [];
  cultivator = null;
  cultivationPaused = false;
  stonePerMin = 0;
  cultivationPerMin = 0;

  combatSystem = null;
  cultivationSystem = null;
  skillSystem = null;
  equipmentSystem = null;
  shopSystem = null;
  mapSystem = null;

  currentMapId = 0;
  totalKills = 0;
  lastOfflineReward = null;
  needShowOffline = false;

  constructor() {
    if (instance) return instance;
    instance = this;
  }

  reset() {
    this.frame = 0;
    this.monsters = [];
    this.damageNumbers = [];
    this.cultivationPaused = false;
    this.stonePerMin = 0;
    this.cultivationPerMin = 0;
    this.totalKills = 0;
    this.currentMapId = 0;
    this.lastOfflineReward = null;
    this.needShowOffline = false;
  }

  gameOver() {
    this.isGameOver = true;
  }

  removeEnemy(enemy) {
    const idx = this.enemys.indexOf(enemy);
    if (idx >= 0) {
      this.enemys.splice(idx, 1);
      this.pool.recover('enemy', enemy);
    }
  }

  removeBullets(bullet) {
    const idx = this.bullets.indexOf(bullet);
    if (idx >= 0) {
      this.bullets.splice(idx, 1);
      this.pool.recover('bullet', bullet);
    }
  }
}
