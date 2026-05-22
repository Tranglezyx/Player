import { generateEquipment } from '../config/equipment';

export default class EquipmentSystem {
  getEquipableItems(bag) {
    return bag.filter(item => item.slot);
  }

  getBestEquip(bag, slot) {
    const candidates = this.getEquipableItems(bag).filter(i => i.slot === slot);
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => b.qualityIndex - a.qualityIndex)[0];
  }

  autoEquip(player) {
    const slots = ['weapon', 'helmet', 'armor', 'boots', 'accessory'];
    slots.forEach(slot => {
      const best = this.getBestEquip(player.bag, slot);
      if (!best) return;
      const current = player.equipment[slot];
      if (!current || best.qualityIndex > current.qualityIndex) {
        player.bag = player.bag.filter(i => i !== best);
        player.equipItem(best);
      }
    });
  }

  sellItem(player, itemIndex) {
    if (itemIndex < 0 || itemIndex >= player.bag.length) return 0;
    const item = player.bag[itemIndex];
    const price = Math.floor(item.price * 0.5);
    player.bag.splice(itemIndex, 1);
    player.spiritStone += price;
    return price;
  }
}
