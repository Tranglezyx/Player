GameGlobal.canvas = wx.createCanvas();

const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();

canvas.width = windowInfo.screenWidth;
canvas.height = windowInfo.screenHeight;

export const SCREEN_WIDTH = windowInfo.screenWidth;
export const SCREEN_HEIGHT = windowInfo.screenHeight;

// 安全区域偏移，防止内容被状态栏/刘海遮挡
// statusBarHeight 在 iOS 刘海屏约 44-48px，Android 约 24-32px
const statusBarHeight = windowInfo.statusBarHeight || 48;

// 底部安全距离：全面屏（statusBarHeight >= 40）留更多，普通屏留 8px
const isNotchScreen = statusBarHeight >= 40;
export const SAFE_BOTTOM = isNotchScreen ? 24 : 8;

export const SAFE_TOP = statusBarHeight + 4;
export const TOP_BAR_H = 60;
export const BOTTOM_BAR_H = 66;

// 面板区域（全屏弹窗，留出顶部栏和底部栏空间）
export const PANEL_Y = SAFE_TOP + TOP_BAR_H + 2;
export const PANEL_H = windowInfo.screenHeight - PANEL_Y - BOTTOM_BAR_H - SAFE_BOTTOM;