const OUTER_SKILLS = [
  { id: 'sword_art', name: '飞剑术', type: 'active', spiritCost: 10, baseEffect: 2.0, effectType: 'damage', desc: '攻击伤害' },
  { id: 'thunder_art', name: '雷霆咒', type: 'active', spiritCost: 15, baseEffect: 1.5, effectType: 'damage', desc: '雷电伤害' },
  { id: 'spirit_realm', name: '灵蕴诀', type: 'passive', spiritCost: 0, baseEffect: 0.2, effectType: 'maxSpirit', desc: '灵力上限' },
  { id: 'flame_palm', name: '烈火掌', type: 'active', spiritCost: 12, baseEffect: 1.8, effectType: 'damage', desc: '火焰伤害' },
  { id: 'sword_heart', name: '剑心通明', type: 'passive', spiritCost: 0, baseEffect: 0.1, effectType: 'critRate', desc: '暴击率' },
  { id: 'mystic_gong', name: '玄元功', type: 'passive', spiritCost: 0, baseEffect: 0.25, effectType: 'spiritRegen', desc: '灵力回复速度' },
  { id: 'gather_spirit_array', name: '聚灵阵', type: 'aura', spiritCost: 0, baseEffect: 0.15, effectType: 'stoneDropRate', desc: '战斗灵石掉落' },
  { id: 'slaughter_domain', name: '杀戮领域', type: 'aura', spiritCost: 0, baseEffect: 0.1, effectType: 'attack', desc: '攻击力' },
  { id: 'frost_soul', name: '冰魄诀', type: 'active', spiritCost: 20, baseEffect: 2.4, effectType: 'damage', desc: '冰霜伤害' },
  { id: 'diamond_body', name: '金刚体', type: 'passive', spiritCost: 0, baseEffect: 0.15, effectType: 'attackSpeed', desc: '攻击速度' },
];

const PROFICIENCY_LEVELS = [
  { name: '入门', multiplier: 1.0, threshold: 0 },
  { name: '小成', multiplier: 1.3, threshold: 100 },
  { name: '大成', multiplier: 1.7, threshold: 500 },
  { name: '圆满', multiplier: 2.2, threshold: 2000 },
  { name: '化境', multiplier: 3.0, threshold: 5000 },
];

export { OUTER_SKILLS, PROFICIENCY_LEVELS };
