import { generateEquipment } from './equipment';
import { OUTER_SKILLS } from './outerSkills';
import INNER_SKILLS from './innerSkills';
import REALMS from './realms';

const SHOP_REFRESH_INTERVAL = 4 * 3600;

function getRefreshCost(realmIndex, manualRefreshCount) {
  return 50 * (realmIndex + 1) * (1 + manualRefreshCount * 0.2);
}

function generateShopItem(realmIndex) {
  const roll = Math.random() * 100;
  if (roll < 45) return generateEquipmentItem(realmIndex);
  if (roll < 72) return generateSkillFragment(realmIndex, 'outer');
  if (roll < 90) return generateSkillFragment(realmIndex, 'inner');
  return generateCompleteSkill(realmIndex);
}

function generateEquipmentItem(realmIndex) {
  const slotNames = { weapon: '武器', helmet: '冠', armor: '袍', boots: '靴', accessory: '佩' };
  const statLabels = { attack: '攻击', maxSpirit: '灵力上限', spiritRegen: '灵力回复', attackSpeed: '攻速', critRate: '暴击' };
  const equip = generateEquipment(realmIndex);
  const statText = Object.entries(equip.stats).map(([k, v]) => `${statLabels[k] || k}+${v}`).join(' ');
  return {
    id: `shop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: 'equipment',
    name: equip.name,
    qualityIndex: equip.qualityIndex,
    description: `${slotNames[equip.slot]} | ${equip.quality} | ${statText}`,
    price: equip.price,
    data: equip,
    locked: false,
  };
}

function generateSkillFragment(realmIndex, skillType) {
  const skills = skillType === 'outer' ? OUTER_SKILLS : INNER_SKILLS;
  const realmConfig = REALMS[realmIndex];
  const available = skills.filter((s) => realmConfig.unlockSkills.includes(s.id)).slice(0, 6);
  const skill = available[Math.floor(Math.random() * Math.max(1, available.length))] || skills[0];
  const price = skillType === 'outer' ? 30 + realmIndex * 10 : 40 + realmIndex * 15;
  return {
    id: `shop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: 'skill_fragment',
    name: `${skill.name}·残卷`,
    description: `${skillType === 'outer' ? '术法' : '心法'} ${skill.type || ''} | ${skill.desc}`,
    price: Math.floor(price * (1 + realmIndex * 0.3)),
    data: { skillId: skill.id, skillType },
    locked: false,
  };
}

function generateCompleteSkill(realmIndex) {
  const allSkills = [...OUTER_SKILLS, ...INNER_SKILLS];
  const realmConfig = REALMS[realmIndex];
  const available = allSkills.filter(s => realmConfig.unlockSkills.includes(s.id));
  const skill = available[Math.floor(Math.random() * Math.max(1, available.length))] || allSkills[0];
  const typeLabel = OUTER_SKILLS.find(s => s.id === skill.id) ? '术法' : '心法';
  return {
    id: `shop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: 'skill_complete',
    name: `完整${skill.name}`,
    description: `${typeLabel} | ${skill.desc}`,
    price: Math.floor((skill.type === 'active' ? 300 : 400) * (1 + realmIndex * 0.5)),
    data: { skillId: skill.id, skillType: typeLabel === '术法' ? 'outer' : 'inner' },
    locked: false,
  };
}

export { SHOP_REFRESH_INTERVAL, getRefreshCost, generateShopItem };
