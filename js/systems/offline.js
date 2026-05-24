import REALMS from '../config/realms';

export function calculateOfflineRewards(offlineSec) {
  const offlineMin = Math.floor(offlineSec / 60);
  const player = GameGlobal.databus.cultivator;

  if (offlineMin <= 0) return null;

  let cultivationSpeed = 1;
  // inner skills bonus
  player.innerSkills.forEach(skill => {
    if (skill.effectType === 'cultivateSpeed') {
      cultivationSpeed += skill.baseEffect * skill.getMultiplier();
    }
    if (skill.effectType === 'cultivateSpeedAndSpirit') {
      cultivationSpeed += skill.baseEffect * skill.getMultiplier();
    }
    if (skill.effectType === 'cultivateSpeedExtraCost') {
      cultivationSpeed += skill.baseEffect * skill.getMultiplier();
    }
    if (skill.effectType === 'attackAndCultivate') {
      cultivationSpeed += skill.baseEffect * skill.getMultiplier();
    }
  });
  cultivationSpeed = Math.floor(cultivationSpeed);

  const realm = REALMS[player.realmIndex];
  let stoneCostPerSec = realm.stoneCostPerSec;

  // stone cost reduction from inner skills
  player.innerSkills.forEach(skill => {
    if (skill.effectType === 'stoneCost') {
      stoneCostPerSec = Math.floor(stoneCostPerSec * (1 - skill.baseEffect * skill.getMultiplier()));
    }
  });
  stoneCostPerSec = Math.max(1, stoneCostPerSec);

  // how many seconds of cultivation can player afford?
  const affordableSec = Math.min(offlineSec, Math.floor(player.spiritStone / stoneCostPerSec));
  const cultivationGain = cultivationSpeed * affordableSec;

  const combatStonePerSec = cultivationSpeed * stoneCostPerSec * 3;
  const combatStoneGain = combatStonePerSec * offlineSec;
  const cultivationCost = stoneCostPerSec * Math.min(offlineSec, affordableSec);
  const netStone = Math.max(0, combatStoneGain - cultivationCost);

  let offlineBonusMultiplier = 1;
  player.innerSkills.forEach(skill => {
    if (skill.effectType === 'offlineBonus') {
      offlineBonusMultiplier += skill.baseEffect * skill.getMultiplier();
    }
  });

  return {
    totalMin: offlineMin,
    cultivation: Math.floor(cultivationGain * offlineBonusMultiplier),
    stone: Math.floor(netStone * offlineBonusMultiplier),
    stoneSpent: Math.floor(cultivationCost),
    skillProficiencyGain: Math.floor(offlineSec * 0.5),
  };
}

export function applyOfflineRewards(rewards) {
  if (!rewards) return;
  const player = GameGlobal.databus.cultivator;
  player.spiritStone += rewards.stone;
  player.cultivation = Math.min(player.maxCultivation, player.cultivation + rewards.cultivation);

  // add half proficiency to skills (capped at 8h = 28800 seconds)
  const profGain = Math.min(rewards.skillProficiencyGain, 28800 * 0.5);
  player.innerSkills.forEach(s => { s.proficiency += Math.floor(profGain / Math.max(1, player.innerSkills.length)); s.updateProficiency(); });
  player.outerSkills.forEach(s => { s.proficiency += Math.floor(profGain / Math.max(1, player.outerSkills.length)); s.updateProficiency(); });
}
