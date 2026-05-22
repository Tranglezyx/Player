const SAVE_KEY = 'cultivation_idle_save';

export function saveToStorage() {
  const player = GameGlobal.databus.cultivator;
  if (!player) return;
  const data = {
    realmIndex: player.realmIndex,
    level: player.level,
    cultivation: player.cultivation,
    maxCultivation: player.maxCultivation,
    spiritStone: player.spiritStone,
    spirit: player.spirit,
    equipment: player.equipment,
    bag: player.bag,
    innerSkills: player.innerSkills.map(s => ({ id: s.id, proficiency: s.proficiency, proficiencyLevel: s.proficiencyLevel })),
    outerSkills: player.outerSkills.map(s => ({ id: s.id, proficiency: s.proficiency, proficiencyLevel: s.proficiencyLevel })),
    currentMapId: GameGlobal.databus.currentMapId,
    shopTimer: GameGlobal.databus.shopSystem ? GameGlobal.databus.shopSystem.timer : 0,
    shopItems: GameGlobal.databus.shopSystem ? GameGlobal.databus.shopSystem.items : [],
    shopManualRefreshCount: GameGlobal.databus.shopSystem ? GameGlobal.databus.shopSystem.manualRefreshCount : 0,
    totalKills: GameGlobal.databus.totalKills,
    lastOnlineTime: Date.now(),
  };
  try {
    wx.setStorageSync(SAVE_KEY, data);
  } catch (e) {
    // storage full or unavailable
  }
}

export function loadSaveData() {
  try {
    const data = wx.getStorageSync(SAVE_KEY);
    if (!data) return null;
    return data;
  } catch (e) {
    return null;
  }
}

export { SAVE_KEY };
