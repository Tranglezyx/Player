import { SHOP_REFRESH_INTERVAL, getRefreshCost, generateShopItem } from '../config/shop';

export default class ShopSystem {
  constructor() {
    this.timer = 0;
    this.items = [];
    this.manualRefreshCount = 0;
  }

  update(dt) {
    this.timer += dt;
    if (this.timer >= SHOP_REFRESH_INTERVAL) {
      this.autoRefresh();
    }
  }

  autoRefresh() {
    this.timer = 0;
    const player = GameGlobal.databus.cultivator;
    const slotCount = player.getGlobalLevel();

    const locked = this.items.filter(item => item.locked);
    const freeSlots = Math.max(0, slotCount - locked.length);

    const newItems = [];
    for (let i = 0; i < freeSlots; i++) {
      newItems.push(generateShopItem(player.realmIndex));
    }

    this.items = [...locked, ...newItems];
  }

  manualRefresh() {
    const player = GameGlobal.databus.cultivator;
    const cost = Math.floor(getRefreshCost(player.realmIndex, this.manualRefreshCount));
    if (player.spiritStone < cost) return false;
    player.spiritStone -= cost;
    this.manualRefreshCount++;
    this.autoRefresh();
    return true;
  }

  resetManualRefreshCost() {
    this.manualRefreshCount = 0;
  }

  toggleLock(index) {
    if (index < 0 || index >= this.items.length) return;
    this.items[index].locked = !this.items[index].locked;
  }

  buy(index) {
    if (index < 0 || index >= this.items.length) return { success: false, reason: '无效商品' };
    const item = this.items[index];
    const player = GameGlobal.databus.cultivator;

    if (player.spiritStone < item.price) return { success: false, reason: '灵石不足' };

    // check if already learned (complete skills)
    if (item.type === 'skill_complete') {
      const { skillId, skillType } = item.data;
      const hasSkill = skillType === 'inner'
        ? player.innerSkills.find(s => s.id === skillId)
        : player.outerSkills.find(s => s.id === skillId);
      if (hasSkill) return { success: false, reason: '已习得该功法' };
    }

    player.spiritStone -= item.price;

    if (item.type === 'equipment') {
      player.addToBag(item.data);
    } else if (item.type === 'skill_fragment') {
      const { skillId, skillType } = item.data;
      const fragKey = `${skillType}_${skillId}`;
      if (!player.fragments) player.fragments = {};
      player.fragments[fragKey] = (player.fragments[fragKey] || 0) + 1;

      // auto combine if 3 fragments
      if (player.fragments[fragKey] >= 3) {
        player.fragments[fragKey] -= 3;
        if (GameGlobal.databus.skillSystem) {
          GameGlobal.databus.skillSystem.learnSkill(skillId, skillType);
        }
      }
    } else if (item.type === 'skill_complete') {
      const { skillId, skillType } = item.data;
      if (GameGlobal.databus.skillSystem) {
        GameGlobal.databus.skillSystem.learnSkill(skillId, skillType);
      }
    }

    this.items.splice(index, 1);
    return { success: true };
  }

  getRemainingTime() {
    return Math.max(0, SHOP_REFRESH_INTERVAL - this.timer);
  }
}
