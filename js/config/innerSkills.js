const INNER_SKILLS = [
  { id: 'breath_art', name: '吐纳术', baseEffect: 0.2, effectType: 'cultivateSpeed', desc: '修炼速度' },
  { id: 'clear_mind', name: '静心诀', baseEffect: 0.3, effectType: 'cultivateCap', desc: '修为上限' },
  { id: 'focus_spirit', name: '凝神术', baseEffect: 0.15, effectType: 'stoneCost', desc: '灵石消耗减少' },
  { id: 'sky_mind', name: '天元心法', baseEffect: 0.35, effectType: 'cultivateSpeed', desc: '修炼速度' },
  { id: 'return_spirit', name: '归元诀', baseEffect: 0.2, effectType: 'spiritRegen', desc: '灵力回复速度' },
  { id: 'barrier_heart', name: '破障心经', baseEffect: 0.1, effectType: 'breakthroughCost', desc: '突破灵石消耗减少' },
  { id: 'taichi_xuan', name: '太极玄功', baseEffect: 0.25, effectType: 'cultivateSpeedAndSpirit', desc: '修炼速度+灵力上限' },
  { id: 'primordial_chaos', name: '混元经', baseEffect: 0.4, effectType: 'cultivateSpeedExtraCost', desc: '修为获取（灵石消耗+10%）' },
  { id: 'immortal_sutra', name: '长生经', baseEffect: 0.25, effectType: 'offlineBonus', desc: '离线收益' },
  { id: 'star_art', name: '周天星诀', baseEffect: 0.15, effectType: 'attackAndCultivate', desc: '攻击力+修炼速度' },
];

export default INNER_SKILLS;
