const EQUIPMENT_SLOTS = ['weapon', 'helmet', 'armor', 'boots', 'accessory'];

const EQUIPMENT_BASES = {
  weapon: { stat: 'attack', value: 5, name: '剑' },
  helmet: { stat: 'maxSpirit', value: 20, name: '冠' },
  armor: { stat: 'spiritRegen', value: 0.5, name: '袍' },
  boots: { stat: 'attackSpeed', value: 0.1, name: '靴' },
  accessory: { stat: 'critRate', value: 0.02, name: '佩' },
};

const EQUIPMENT_NAMES = {
  weapon: ['铁剑', '青锋剑', '玄铁剑', '飞虹剑', '斩仙剑', '诛仙剑'],
  helmet: ['布冠', '紫金冠', '灵宝冠', '星辰冠', '天元冠', '混元冠'],
  armor: ['布衣', '青袍', '紫绶衣', '星辰袍', '天元衣', '混元衣'],
  boots: ['草鞋', '云履', '风行靴', '流星靴', '天元靴', '混元靴'],
  accessory: ['玉佩', '灵玉', '护心镜', '星辰佩', '天元佩', '混元佩'],
};

const QUALITIES = [
  { name: '凡品', color: '#CCCCCC', index: 0, multiplier: 1.0, probability: 0.70 },
  { name: '良品', color: '#4CAF50', index: 1, multiplier: 1.3, probability: 0.20 },
  { name: '上品', color: '#42A5F5', index: 2, multiplier: 1.7, probability: 0.07 },
  { name: '极品', color: '#AB47BC', index: 3, multiplier: 2.2, probability: 0.025 },
  { name: '仙品', color: '#FF9800', index: 4, multiplier: 3.0, probability: 0.004 },
  { name: '神器', color: '#EF5350', index: 5, multiplier: 5.0, probability: 0.001 },
];

function rollQuality() {
  let roll = Math.random();
  let cumulative = 0;
  for (const q of QUALITIES) {
    cumulative += q.probability;
    if (roll < cumulative) return q;
  }
  return QUALITIES[0];
}

function generateEquipment(realmIndex) {
  const slotIndex = Math.floor(Math.random() * EQUIPMENT_SLOTS.length);
  const slot = EQUIPMENT_SLOTS[slotIndex];
  const quality = rollQuality();
  const base = EQUIPMENT_BASES[slot];
  const namePrefix = EQUIPMENT_NAMES[slot][Math.min(realmIndex, 5)];

  const stats = {};
  const baseValue = base.value * quality.multiplier * (1 + realmIndex * 0.5);
  stats[base.stat] = Math.max(1, Math.floor(baseValue));

  return {
    id: `eq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: `[${quality.name}]${namePrefix}`,
    slot,
    quality: quality.name,
    qualityIndex: quality.index,
    stats,
    price: Math.floor(baseValue * 10 * (quality.index + 1)),
  };
}

export { EQUIPMENT_SLOTS, EQUIPMENT_BASES, QUALITIES, rollQuality, generateEquipment };
