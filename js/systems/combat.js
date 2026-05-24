import Monster from '../entities/monster';
import DamageNumber from '../entities/damageNumber';
import { MONSTER_NAMES } from '../config/monsters';

export default class CombatSystem {
  constructor() {
    this.monsterSpawnTimer = 0;
    this.monsterRespawnCooldown = 1;
    this.currentMonster = null;
    this.damageNumbers = [];
  }

  update(dt) {
    this.updateMonsterSpawn(dt);
    this.updateCombat(dt);
    this.updateDamageNumbers(dt);
    this.updateMonsterDeath(dt);
  }

  updateMonsterSpawn(dt) {
    if (this.currentMonster && this.currentMonster.isActive) return;
    this.monsterSpawnTimer += dt;
    if (this.monsterSpawnTimer >= this.monsterRespawnCooldown) {
      this.monsterSpawnTimer = 0;
      this.spawnMonster();
    }
  }

  spawnMonster() {
    const mapId = GameGlobal.databus.currentMapId;
    const mapSystem = GameGlobal.databus.mapSystem;
    let tier = 1;
    if (mapSystem) {
      const map = mapSystem.getCurrentMap();
      if (map && map.tiers.length > 0) {
        tier = map.tiers[Math.floor(Math.random() * map.tiers.length)];
      }
    }

    const monster = new Monster();
    monster.init(tier);
    this.currentMonster = monster;
  }

  updateCombat(dt) {
    if (!this.currentMonster || !this.currentMonster.isActive || this.currentMonster.state === 'dead') return;

    const player = GameGlobal.databus.cultivator;

    // normal attack timer
    player.attackTimer += dt;
    if (player.attackTimer >= player.attackSpeed) {
      player.attackTimer = 0;
      this.performNormalAttack(player, this.currentMonster);
    }

    // active skills: cast if enough spirit
    const activeSkills = player.outerSkills.filter(s => s.type === 'active');
    activeSkills.forEach(skill => {
      if (player.spirit >= skill.spiritCost && this.currentMonster && this.currentMonster.isActive && this.currentMonster.state !== 'dead') {
        player.spirit -= skill.spiritCost;
        this.performSkillAttack(player, this.currentMonster, skill);
      }
    });
  }

  updateMonsterDeath(dt) {
    if (this.currentMonster && this.currentMonster.state === 'dead') {
      this.currentMonster.deathTimer -= dt;
      if (this.currentMonster.deathTimer <= 0) {
        this.currentMonster.isActive = false;
        this.currentMonster = null;
      }
    }
  }

  performNormalAttack(player, monster) {
    const damage = this.calcDamage(player, monster, 1);
    monster.takeDamage(damage);
    const dmg = new DamageNumber();
    dmg.init(monster.x + 32, monster.y, damage, false, 'normal');
    this.damageNumbers.push(dmg);
    this.checkMonsterDeath(monster);
  }

  performSkillAttack(player, monster, skill) {
    const multiplier = skill.baseEffect * skill.getMultiplier();
    const damage = this.calcDamage(player, monster, multiplier);
    monster.takeDamage(damage);
    const dmg = new DamageNumber();
    dmg.init(monster.x + 32, monster.y - 20, damage, false, 'skill');
    this.damageNumbers.push(dmg);
    skill.proficiency += 1;
    skill.updateProficiency();
    this.checkMonsterDeath(monster);
  }

  calcDamage(attacker, defender, multiplier) {
    const atk = attacker.attack;
    const def = defender.defense;
    let baseDamage = Math.floor((atk * atk) / (atk + def));
    baseDamage = Math.max(1, baseDamage);

    let damage = Math.floor(baseDamage * multiplier);

    // crit check
    if (Math.random() < attacker.critRate) {
      damage = Math.floor(damage * attacker.critDamage);
    }

    return Math.floor(damage);
  }

  checkMonsterDeath(monster) {
    if (monster.hp <= 0 && monster.state !== 'dead') {
      monster.state = 'dead';
      monster.deathTimer = 0.5;

      const player = GameGlobal.databus.cultivator;
      let stoneReward = monster.getStoneReward();

      // aura skill: gather_spirit_array increases stone drop
      player.outerSkills.forEach(skill => {
        if (skill.type === 'aura' && skill.effectType === 'stoneDropRate') {
          stoneReward = Math.floor(stoneReward * (1 + skill.baseEffect * skill.getMultiplier()));
        }
      });

      player.spiritStone += stoneReward;
      player.spirit = Math.min(player.maxSpirit, player.spirit + 5);

      GameGlobal.databus.totalKills++;
      // 延迟清理：由 updateMonsterDeath 在 deathTimer 结束后处理
    }
  }

  updateDamageNumbers(dt) {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      this.damageNumbers[i].update(dt);
      if (!this.damageNumbers[i].isActive) {
        this.damageNumbers.splice(i, 1);
      }
    }
  }

  render(ctx) {
    if (this.currentMonster && this.currentMonster.isActive) {
      this.currentMonster.render(ctx);
    }
    this.damageNumbers.forEach(d => d.render(ctx));
  }
}
