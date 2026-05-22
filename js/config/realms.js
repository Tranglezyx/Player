const REALMS = [
  {
    index: 0, name: '炼气期', cultivationBase: 600, maxLevel: 10,
    breakthroughCost: 50, attackBase: 10, spiritBase: 50, spiritRegen: 5,
    stoneCostPerSec: 1, unlockSkills: ['breath_art', 'sword_art'],
  },
  {
    index: 1, name: '筑基期', cultivationBase: 960, maxLevel: 10,
    breakthroughCost: 300, attackBase: 40, spiritBase: 150, spiritRegen: 10,
    stoneCostPerSec: 3, unlockSkills: ['clear_mind', 'thunder_art'],
  },
  {
    index: 2, name: '金丹期', cultivationBase: 1536, maxLevel: 10,
    breakthroughCost: 1500, attackBase: 160, spiritBase: 450, spiritRegen: 20,
    stoneCostPerSec: 9, unlockSkills: ['focus_spirit', 'spirit_realm'],
  },
  {
    index: 3, name: '元婴期', cultivationBase: 2458, maxLevel: 10,
    breakthroughCost: 5000, attackBase: 640, spiritBase: 1350, spiritRegen: 40,
    stoneCostPerSec: 25, unlockSkills: ['sky_mind', 'flame_palm'],
  },
  {
    index: 4, name: '化神期', cultivationBase: 3932, maxLevel: 10,
    breakthroughCost: 15000, attackBase: 2560, spiritBase: 4050, spiritRegen: 80,
    stoneCostPerSec: 70, unlockSkills: ['return_spirit', 'sword_heart'],
  },
  {
    index: 5, name: '炼虚期', cultivationBase: 6291, maxLevel: 10,
    breakthroughCost: 50000, attackBase: 10240, spiritBase: 12150, spiritRegen: 160,
    stoneCostPerSec: 200, unlockSkills: ['barrier_heart', 'mystic_gong'],
  },
  {
    index: 6, name: '合体期', cultivationBase: 10066, maxLevel: 10,
    breakthroughCost: 150000, attackBase: 40960, spiritBase: 36450, spiritRegen: 320,
    stoneCostPerSec: 500, unlockSkills: ['taichi_xuan', 'gather_spirit_array'],
  },
  {
    index: 7, name: '大乘期', cultivationBase: 16106, maxLevel: 10,
    breakthroughCost: 500000, attackBase: 163840, spiritBase: 109350, spiritRegen: 640,
    stoneCostPerSec: 1500, unlockSkills: ['primordial_chaos', 'slaughter_domain'],
  },
  {
    index: 8, name: '渡劫期', cultivationBase: 25770, maxLevel: 10,
    breakthroughCost: 1500000, attackBase: 655360, spiritBase: 328050, spiritRegen: 1280,
    stoneCostPerSec: 4000, unlockSkills: ['immortal_sutra', 'frost_soul'],
  },
  {
    index: 9, name: '真仙境', cultivationBase: 41232, maxLevel: 10,
    breakthroughCost: 5000000, attackBase: 2621440, spiritBase: 984150, spiritRegen: 2560,
    stoneCostPerSec: 12000, unlockSkills: ['star_art', 'diamond_body'],
  },
];

export default REALMS;
