// js/ui/uiPainter.js
// 像素风修仙 UI 绘制工具库
// 所有绘制函数均使用 Canvas 2D API，适配微信小程序环境

// ==================== 色板 ====================
export const PALETTE = {
  bgMain: '#2B1B3D',
  bgSub: '#3D5A3C',
  uiBg: '#1A1A2E',
  uiBgTransparent: 'rgba(26, 26, 46, 0.97)',
  uiBorder: '#C9A96E',
  uiBorderLight: '#E8D5A3',
  uiBorderDark: '#8A7040',
  textMain: '#F5E6C8',
  textHighlight: '#FFD700',
  textMuted: '#999999',
  textDark: '#333333',

  // 品质色
  quality: [
    { name: '凡品', color: '#CCCCCC' },
    { name: '良品', color: '#4CAF50' },
    { name: '上品', color: '#42A5F5' },
    { name: '极品', color: '#AB47BC' },
    { name: '仙品', color: '#FF9800' },
    { name: '神器', color: '#EF5350' },
  ],

  // 功能色
  damageNormal: '#FFFFFF',
  damageCrit: '#FFD700',
  damageSkill: '#42A5F5',
  heal: '#4CAF50',
  spiritStone: '#00BCD4',
  cultivation: '#9C27B0',
  health: '#F44336',
  spirit: '#42A5F5',

  // 按钮
  btnBg: 'rgba(201, 169, 110, 0.2)',
  btnBgActive: 'rgba(201, 169, 110, 0.5)',
  btnBgDisabled: 'rgba(100, 100, 100, 0.3)',
  btnText: '#F5E6C8',
  btnTextActive: '#FFD700',

  // 遮罩
  overlay: 'rgba(0, 0, 0, 0.6)',
};

// ==================== 绘制辅助函数 ====================

// 绘制圆角矩形（支持填充和描边）
export function drawRoundRect(ctx, x, y, w, h, r, fill, stroke) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// 绘制像素风边框（仿古书卷四角装饰）
export function drawPixelBorder(ctx, x, y, w, h, color = PALETTE.uiBorder) {
  const cornerSize = 8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // 主体边框
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

  // 四角装饰
  ctx.fillStyle = color;
  // 左上角
  ctx.fillRect(x, y, cornerSize, 2);
  ctx.fillRect(x, y, 2, cornerSize);
  // 右上角
  ctx.fillRect(x + w - cornerSize, y, cornerSize, 2);
  ctx.fillRect(x + w - 2, y, 2, cornerSize);
  // 左下角
  ctx.fillRect(x, y + h - 2, cornerSize, 2);
  ctx.fillRect(x, y + h - cornerSize, 2, cornerSize);
  // 右下角
  ctx.fillRect(x + w - cornerSize, y + h - 2, cornerSize, 2);
  ctx.fillRect(x + w - 2, y + h - cornerSize, 2, cornerSize);

  // 内部细线装饰
  ctx.strokeStyle = 'rgba(201, 169, 110, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
}

// ==================== 面板绘制 ====================

export function drawPanel(ctx, x, y, w, h, title) {
  // 遮罩已在调用处绘制
  // 面板背景
  ctx.fillStyle = PALETTE.uiBgTransparent;
  ctx.fillRect(x, y, w, h);

  // 仿古边框
  drawPixelBorder(ctx, x, y, w, h, PALETTE.uiBorder);

  // 标题栏背景
  if (title) {
    const titleH = 40;
    ctx.fillStyle = 'rgba(201, 169, 110, 0.1)';
    ctx.fillRect(x + 2, y + 2, w - 4, titleH);

    // 标题装饰线
    ctx.fillStyle = PALETTE.uiBorder;
    ctx.fillRect(x + w / 2 - 40, y + titleH + 2, 80, 1);

    // 标题文字
    ctx.fillStyle = PALETTE.textHighlight;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, x + w / 2, y + titleH / 2 + 2);
    ctx.textBaseline = 'alphabetic';
  }
}

// ==================== 按钮绘制 ====================

export function drawButton(ctx, x, y, w, h, label, active = false, disabled = false) {
  const r = 4;

  if (disabled) {
    drawRoundRect(ctx, x, y, w, h, r, PALETTE.btnBgDisabled, '#666');
    ctx.fillStyle = '#666';
  } else if (active) {
    // 按下效果：颜色变深，位置微移
    drawRoundRect(ctx, x, y + 1, w, h, r, PALETTE.btnBgActive, PALETTE.uiBorderLight);
    ctx.fillStyle = PALETTE.btnTextActive;
  } else {
    // 正常状态：带高光
    drawRoundRect(ctx, x, y, w, h, r, PALETTE.btnBg, PALETTE.uiBorder);
    // 顶部高光
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x + 2, y + 2, w - 4, h / 2 - 2);
    ctx.fillStyle = PALETTE.btnText;
  }

  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + (active ? 1 : 0));
  ctx.textBaseline = 'alphabetic';
}

// 绘制小图标按钮（用于商店锁定、关闭等）
export function drawIconButton(ctx, x, y, size, icon, active = false) {
  drawRoundRect(ctx, x, y, size, size, 3, active ? PALETTE.btnBgActive : PALETTE.btnBg, PALETTE.uiBorder);
  ctx.fillStyle = active ? PALETTE.textHighlight : PALETTE.textMain;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, x + size / 2, y + size / 2 + 1);
  ctx.textBaseline = 'alphabetic';
}

// ==================== 进度条绘制 ====================

export function drawProgressBar(ctx, x, y, w, h, percent, color, bgColor = '#333', showText = '') {
  // 背景
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, w, h);

  // 填充
  const fillW = Math.max(0, Math.min(w, w * percent));
  if (fillW > 0) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, fillW, h);

    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x, y, fillW, h / 2);
  }

  // 边框
  ctx.strokeStyle = PALETTE.uiBorder;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  // 文字
  if (showText) {
    ctx.fillStyle = PALETTE.textMain;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(showText, x + w / 2, y + h / 2 + 1);
    ctx.textBaseline = 'alphabetic';
  }
}

// ==================== 图标绘制（像素风格） ====================

// 绘制灵石图标（菱形宝石）
export function drawSpiritStoneIcon(ctx, cx, cy, size = 14) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = PALETTE.spiritStone;
  const s = size / 2;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s, 0);
  ctx.lineTo(0, s);
  ctx.lineTo(-s, 0);
  ctx.closePath();
  ctx.fill();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.5, -s * 0.2);
  ctx.lineTo(0, 0);
  ctx.lineTo(-s * 0.5, -s * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 绘制修为图标（莲花形状）
export function drawCultivationIcon(ctx, cx, cy, size = 12) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = PALETTE.cultivation;
  const s = size / 2;
  // 简单莲花：上下左右四个瓣
  ctx.beginPath();
  ctx.arc(0, -s * 0.6, s * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, s * 0.6, s * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-s * 0.6, 0, s * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s * 0.6, 0, s * 0.5, 0, Math.PI * 2);
  ctx.fill();
  // 中心
  ctx.fillStyle = '#E1BEE7';
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 绘制灵力图标（水滴/火焰）
export function drawSpiritIcon(ctx, cx, cy, size = 12) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = PALETTE.spirit;
  const s = size / 2;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s, -s * 0.2, s * 0.3, s * 0.5);
  ctx.quadraticCurveTo(0, s, -s * 0.3, s * 0.5);
  ctx.quadraticCurveTo(-s, -s * 0.2, 0, -s);
  ctx.closePath();
  ctx.fill();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.15, -s * 0.2, s * 0.25, s * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 绘制攻击图标（小剑）
export function drawAttackIcon(ctx, cx, cy, size = 12) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#EF5350';
  const s = size / 2;
  // 剑身
  ctx.fillRect(-s * 0.2, -s, s * 0.4, s * 1.6);
  // 剑尖
  ctx.beginPath();
  ctx.moveTo(-s * 0.2, -s);
  ctx.lineTo(0, -s * 1.4);
  ctx.lineTo(s * 0.2, -s);
  ctx.closePath();
  ctx.fill();
  // 剑柄
  ctx.fillStyle = PALETTE.uiBorder;
  ctx.fillRect(-s * 0.35, s * 0.4, s * 0.7, s * 0.3);
  ctx.fillRect(-s * 0.15, s * 0.7, s * 0.3, s * 0.3);
  ctx.restore();
}

// 绘制地图图标（小山峰）
export function drawMapIcon(ctx, cx, cy, size = 12) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#8BC34A';
  const s = size / 2;
  ctx.beginPath();
  ctx.moveTo(-s, s * 0.6);
  ctx.lineTo(-s * 0.3, -s * 0.4);
  ctx.lineTo(s * 0.2, s * 0.6);
  ctx.lineTo(s * 0.5, -s * 0.1);
  ctx.lineTo(s, s * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-s * 0.15, -s * 0.55, s * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ==================== 底部导航图标 ====================

const NAV_ICON_SIZE = 22;

// 修炼图标（打坐小人简化版）
function drawCultivationNavIcon(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.fillStyle = color;
  const s = size / 2;
  // 头
  ctx.fillRect(-s * 0.25, -s * 0.7, s * 0.5, s * 0.5);
  // 身（打坐姿态）
  ctx.fillRect(-s * 0.4, -s * 0.2, s * 0.8, s * 0.4);
  // 腿
  ctx.fillRect(-s * 0.6, s * 0.15, s * 0.5, s * 0.25);
  ctx.fillRect(s * 0.1, s * 0.15, s * 0.5, s * 0.25);
  ctx.restore();
}

// 心法图标（书卷/竹简）
function drawInnerSkillNavIcon(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.fillStyle = color;
  const s = size / 2;
  // 卷轴筒
  ctx.fillRect(-s * 0.7, -s * 0.6, s * 0.15, s * 1.2);
  ctx.fillRect(s * 0.55, -s * 0.6, s * 0.15, s * 1.2);
  // 中间书页
  ctx.fillRect(-s * 0.5, -s * 0.45, s, s * 0.9);
  // 文字线
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  for (let i = -2; i <= 2; i++) {
    ctx.fillRect(-s * 0.35, i * s * 0.15, s * 0.7, s * 0.06);
  }
  ctx.restore();
}

// 术法图标（飞剑/符咒）
function drawOuterSkillNavIcon(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.fillStyle = color;
  const s = size / 2;
  // 符咒形状
  ctx.fillRect(-s * 0.4, -s * 0.7, s * 0.8, s * 1.4);
  // 顶部三角
  ctx.beginPath();
  ctx.moveTo(-s * 0.4, -s * 0.7);
  ctx.lineTo(0, -s * 0.95);
  ctx.lineTo(s * 0.4, -s * 0.7);
  ctx.closePath();
  ctx.fill();
  // 中心符文（菱形）
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.2);
  ctx.lineTo(s * 0.2, 0);
  ctx.lineTo(0, s * 0.2);
  ctx.lineTo(-s * 0.2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 背包图标（乾坤袋）
function drawBagNavIcon(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.fillStyle = color;
  const s = size / 2;
  // 袋身
  ctx.beginPath();
  ctx.moveTo(-s * 0.6, -s * 0.3);
  ctx.quadraticCurveTo(-s * 0.7, s * 0.6, 0, s * 0.7);
  ctx.quadraticCurveTo(s * 0.7, s * 0.6, s * 0.6, -s * 0.3);
  ctx.closePath();
  ctx.fill();
  // 袋口
  ctx.fillStyle = PALETTE.uiBorder;
  ctx.fillRect(-s * 0.5, -s * 0.45, s, s * 0.2);
  // 绳结
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -s * 0.25, s * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// 商店图标（铜钱）
function drawShopNavIcon(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.fillStyle = color;
  const s = size / 2;
  // 外圆
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2);
  ctx.fill();
  // 内方孔
  ctx.fillStyle = PALETTE.uiBg;
  ctx.fillRect(-s * 0.25, -s * 0.25, s * 0.5, s * 0.5);
  ctx.restore();
}

// 地图图标（简化山峰）
function drawMapNavIcon(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.fillStyle = color;
  const s = size / 2;
  ctx.beginPath();
  ctx.moveTo(-s, s * 0.7);
  ctx.lineTo(-s * 0.2, -s * 0.6);
  ctx.lineTo(s * 0.3, s * 0.2);
  ctx.lineTo(s * 0.7, -s * 0.3);
  ctx.lineTo(s, s * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

const NAV_ICON_DRAWERS = {
  cultivation: drawCultivationNavIcon,
  skill: drawInnerSkillNavIcon,
  bag: drawBagNavIcon,
  shop: drawShopNavIcon,
  map: drawMapNavIcon,
};

export function drawNavIcon(ctx, id, x, y, size, color) {
  const drawer = NAV_ICON_DRAWERS[id];
  if (drawer) drawer(ctx, x, y, size, color);
}

// ==================== 列表项绘制 ====================

export function drawListItem(ctx, x, y, w, h, index, active = false) {
  if (active) {
    ctx.fillStyle = 'rgba(201, 169, 110, 0.15)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = PALETTE.uiBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  } else {
    ctx.fillStyle = index % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)';
    ctx.fillRect(x, y, w, h);
  }
}

// ==================== 文字辅助 ====================

export function getQualityColor(qualityIndex) {
  return PALETTE.quality[Math.min(qualityIndex, PALETTE.quality.length - 1)]?.color || PALETTE.textMain;
}

export function drawQualityText(ctx, text, x, y, qualityIndex, font = '14px sans-serif') {
  ctx.fillStyle = getQualityColor(qualityIndex);
  ctx.font = font;
  ctx.textAlign = 'left';
  ctx.fillText(text, x, y);
}

export function drawTitleText(ctx, text, x, y, fontSize = 15) {
  ctx.fillStyle = PALETTE.textHighlight;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

export function drawLabelValue(ctx, label, value, x, y, valueColor = PALETTE.textMain) {
  ctx.fillStyle = PALETTE.textMuted;
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y);

  const labelWidth = ctx.measureText(label).width;
  ctx.fillStyle = valueColor;
  ctx.fillText(String(value), x + labelWidth + 6, y);
}

// ==================== 遮罩 ====================

export function drawOverlay(ctx) {
  ctx.fillStyle = PALETTE.overlay;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ==================== 品质标签 ====================

export function drawQualityBadge(ctx, x, y, qualityIndex) {
  const q = PALETTE.quality[Math.min(qualityIndex, PALETTE.quality.length - 1)];
  if (!q) return;

  const text = q.name;
  ctx.font = '11px sans-serif';
  const tw = ctx.measureText(text).width + 10;
  const th = 14;

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  drawRoundRect(ctx, x, y, tw, th, 2, null, q.color);

  ctx.fillStyle = q.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + tw / 2, y + th / 2 + 1);
  ctx.textBaseline = 'alphabetic';
}

// ==================== 怪物 HP 条（美化版） ====================

export function drawMonsterHpBar(ctx, x, y, w, h, percent, name) {
  // 背景
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  drawRoundRect(ctx, x, y, w, h, 2, 'rgba(0,0,0,0.6)', null);

  // 填充
  const fillW = Math.max(0, Math.min(w, w * percent));
  if (fillW > 0) {
    const grad = ctx.createLinearGradient(x, y, x + fillW, y);
    grad.addColorStop(0, '#EF5350');
    grad.addColorStop(1, '#FF8A80');
    ctx.fillStyle = grad;
    drawRoundRect(ctx, x, y, fillW, h, 2, grad, null);
  }

  // 高光线
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(x, y, w, h / 2);

  // 边框
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  drawRoundRect(ctx, x, y, w, h, 2, null, 'rgba(255,255,255,0.3)');

  // 名字
  if (name) {
    ctx.fillStyle = PALETTE.textMain;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, x + w / 2, y - 6);
  }
}

// ==================== 特效/粒子 ====================

// 绘制灵气粒子（修炼特效）
export function drawSpiritParticle(ctx, x, y, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PALETTE.cultivation;
  ctx.fillRect(x, y, 2, 2);
  ctx.restore();
}

// 绘制金色突破光环
export function drawBreakthroughAura(ctx, cx, cy, radius, progress) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = 0.6 * progress;
  ctx.strokeStyle = PALETTE.textHighlight;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius * progress, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
