import './render';
import { SAFE_TOP, TOP_BAR_H } from './render';
import DataBus from './databus';
import Cultivator from './entities/cultivator';
import CombatSystem from './systems/combat';
import CultivationSystem from './systems/cultivation';
import SkillSystem from './systems/skill';
import EquipmentSystem from './systems/equipment';
import ShopSystem from './systems/shop';
import MapSystem from './systems/map';
import { loadSaveData, saveToStorage } from './utils/storage';
import { calculateOfflineRewards, applyOfflineRewards } from './systems/offline';
import TopBar from './ui/topBar';
import BottomBar from './ui/bottomBar';
import PanelCultivation from './ui/panelCultivation';
import PanelSkill from './ui/panelSkill';
import PanelBag from './ui/panelBag';
import PanelShop from './ui/panelShop';
import PanelMap from './ui/panelMap';
import FloatingText from './ui/floatingText';
import REALMS from './config/realms';
import { SkillInstance } from './systems/skill';
import INNER_SKILLS from './config/innerSkills';
import { OUTER_SKILLS } from './config/outerSkills';

const ctx = canvas.getContext('2d');

GameGlobal.databus = new DataBus();

export default class Main {
  constructor() {
    this.aniId = 0;
    this.lastTime = Date.now();

    this.initSystems();
    this.initUI();
    this.loadGame();
    this.bindEvents();
    this.loop();
  }

  initSystems() {
    const bus = GameGlobal.databus;
    bus.cultivationSystem = new CultivationSystem();
    bus.combatSystem = new CombatSystem();
    bus.skillSystem = new SkillSystem();
    bus.equipmentSystem = new EquipmentSystem();
    bus.shopSystem = new ShopSystem();
    bus.mapSystem = new MapSystem();
  }

  initUI() {
    this.topBar = new TopBar();
    this.bottomBar = new BottomBar();
    this.panelCultivation = new PanelCultivation();
    this.panelSkill = new PanelSkill();
    this.panelBag = new PanelBag();
    this.panelShop = new PanelShop();
    this.panelMap = new PanelMap();
    this.floatingText = new FloatingText();
  }

  loadGame() {
    const bus = GameGlobal.databus;
    const player = new Cultivator();
    bus.cultivator = player;

    const saveData = loadSaveData();

    if (saveData) {
      player.realmIndex = saveData.realmIndex;
      player.level = saveData.level;
      player.realm = REALMS[player.realmIndex].name;
      player.cultivation = saveData.cultivation;
      player.maxCultivation = saveData.maxCultivation || bus.cultivationSystem.calcCultivationRequired(saveData.realmIndex, true);
      player.spiritStone = saveData.spiritStone;
      player.spirit = saveData.spirit !== undefined ? saveData.spirit : REALMS[player.realmIndex].spiritBase;
      player.equipment = saveData.equipment || { weapon: null, helmet: null, armor: null, boots: null, accessory: null };
      player.bag = saveData.bag || [];
      player.fragments = saveData.fragments || {};

      // restore skills
      if (saveData.innerSkills) {
        player.innerSkills = saveData.innerSkills.map(s => {
          const cfg = INNER_SKILLS.find(c => c.id === s.id);
          if (!cfg) return null;
          const inst = new SkillInstance(cfg, 'inner');
          inst.proficiency = s.proficiency || 0;
          inst.proficiencyLevel = s.proficiencyLevel || 0;
          return inst;
        }).filter(Boolean);
      }

      if (saveData.outerSkills) {
        player.outerSkills = saveData.outerSkills.map(s => {
          const cfg = OUTER_SKILLS.find(c => c.id === s.id);
          if (!cfg) return null;
          const inst = new SkillInstance(cfg, 'outer');
          inst.proficiency = s.proficiency || 0;
          inst.proficiencyLevel = s.proficiencyLevel || 0;
          return inst;
        }).filter(Boolean);
      }

      bus.currentMapId = saveData.currentMapId || 0;
      bus.totalKills = saveData.totalKills || 0;

      // restore shop state
      if (bus.shopSystem && saveData.shopTimer !== undefined) {
        bus.shopSystem.timer = saveData.shopTimer;
        bus.shopSystem.items = saveData.shopItems || [];
        bus.shopSystem.manualRefreshCount = saveData.shopManualRefreshCount || 0;
      } else {
        bus.shopSystem.autoRefresh();
      }

      // offline rewards
      if (saveData.lastOnlineTime) {
        const offlineSec = (Date.now() - saveData.lastOnlineTime) / 1000;
        if (offlineSec > 60) {
          const rewards = calculateOfflineRewards(offlineSec);
          if (rewards) {
            bus.lastOfflineReward = rewards;
            bus.needShowOffline = true;
          }
        }
      }

      // 兼容旧存档：同步熟练度等级
      player.innerSkills.forEach(s => s.updateProficiency());
      player.outerSkills.forEach(s => s.updateProficiency());

      player.recalcStats();
    } else {
      // new player: initialize
      player.recalcStats();
      player.spiritStone = 100;
      player.spirit = player.maxSpirit;
      bus.shopSystem.autoRefresh();
      bus.skillSystem.unlockRealmSkills(0);
    }

    // init per-min rates
    this.topBar.updatePerMinRates();
  }

  bindEvents() {
    wx.onTouchStart((e) => {
      if (!e.touches || !e.touches.length) return;
      const touch = e.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;

      // offline reward dialog
      if (GameGlobal.databus.needShowOffline) {
        GameGlobal.databus.needShowOffline = false;
        if (GameGlobal.databus.lastOfflineReward) {
          applyOfflineRewards(GameGlobal.databus.lastOfflineReward);
          GameGlobal.databus.lastOfflineReward = null;
        }
        return;
      }

      // top bar map name tap — open map panel
      if (y >= SAFE_TOP && y <= SAFE_TOP + TOP_BAR_H / 2 && x < canvas.width * 0.55 && !this.getActivePanel()) {
        this.handlePanelSwitch('map');
        return;
      }

      // bottom bar handling
      if (y > this.bottomBar.getTop()) {
        const panelId = this.bottomBar.handleTouch(x, y);
        this.handlePanelSwitch(panelId);
        return;
      }

      // panel touch handling (active panel absorbs touches)
      const panel = this.getActivePanel();
      if (panel && panel.visible) {
        panel.handleTouch(x, y);
        return;
      }
    });

    wx.onTouchMove((e) => {
      if (!e.touches || !e.touches.length) return;
      const touch = e.touches[0];
      const panel = this.getActivePanel();
      if (panel && panel.visible && panel.handleTouchMove) {
        panel.handleTouchMove(touch.clientX, touch.clientY);
      }
    });

    wx.onTouchEnd(() => {
      const panel = this.getActivePanel();
      if (panel && panel.visible && panel.handleTouchEnd) {
        panel.handleTouchEnd();
      }
    });
  }

  handlePanelSwitch(panelId) {
    // close all panels
    this.panelCultivation.hide();
    this.panelSkill.hide();
    this.panelBag.hide();
    this.panelShop.hide();
    this.panelMap.hide();

    // open selected
    switch (panelId) {
      case 'cultivation':
        this.panelCultivation.show();
        break;
      case 'skill':
        this.panelSkill.show();
        break;
      case 'bag':
        this.panelBag.show();
        break;
      case 'shop':
        this.panelShop.show();
        break;
      case 'map':
        this.panelMap.show();
        break;
    }
  }

  getActivePanel() {
    const panels = [
      this.panelCultivation,
      this.panelSkill,
      this.panelBag,
      this.panelShop,
      this.panelMap,
    ];
    return panels.find(p => p.visible);
  }

  update(dt) {
    GameGlobal.databus.frame++;

    const bus = GameGlobal.databus;

    // cultivation tick
    bus.cultivationSystem.update(dt);

    // combat tick
    bus.combatSystem.update(dt);

    // shop timer
    bus.shopSystem.update(dt);

    // cultivator update (particles, breath)
    bus.cultivator.update(dt);

    // monster update (bobbing, particles)
    if (bus.combatSystem.currentMonster) {
      bus.combatSystem.currentMonster.update(dt);
    }

    // floating texts
    this.floatingText.update(dt);

    // per-min rates update
    this.topBar.update();

    // auto-save every 600 frames (~10s)
    if (bus.frame % 600 === 0) {
      saveToStorage();
    }

    // reset daily refresh cost
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0 && !this._resetToday) {
      bus.shopSystem.resetManualRefreshCost();
      this._resetToday = true;
    }
    if (now.getHours() !== 0 || now.getMinutes() !== 0) {
      this._resetToday = false;
    }
  }

  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    ctx.fillStyle = '#2B1B3D';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // floor gradient
    const floorY = canvas.height * 0.55;
    const gradient = ctx.createLinearGradient(0, floorY, 0, canvas.height);
    gradient.addColorStop(0, '#3D5A3C');
    gradient.addColorStop(1, '#1A1A2E');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);

    // floor line
    ctx.fillStyle = '#5A4A3A';
    ctx.fillRect(0, floorY, canvas.width, 3);

    // combat (monster + damage numbers)
    GameGlobal.databus.combatSystem.render(ctx);

    // cultivator
    GameGlobal.databus.cultivator.render(ctx);

    // floating texts
    this.floatingText.render(ctx);

    // offline reward dialog
    if (GameGlobal.databus.needShowOffline && GameGlobal.databus.lastOfflineReward) {
      this.renderOfflineReward(ctx);
    }

    // top bar
    this.topBar.render(ctx);

    // bottom bar
    this.bottomBar.render(ctx);

    // panels
    this.panelCultivation.render(ctx);
    this.panelSkill.render(ctx);
    this.panelBag.render(ctx);
    this.panelShop.render(ctx);
    this.panelMap.render(ctx);
  }

  renderOfflineReward(ctx) {
    const r = GameGlobal.databus.lastOfflineReward;
    if (!r) return;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bw = 260;
    const bh = 200;
    const bx = (canvas.width - bw) / 2;
    const by = (canvas.height - bh) / 2;

    ctx.fillStyle = 'rgba(26, 26, 46, 0.97)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#C9A96E';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('离线收益', bx + bw / 2, by + 30);

    ctx.fillStyle = '#F5E6C8';
    ctx.font = '16px sans-serif';
    ctx.fillText(`离线 ${r.totalMin} 分钟`, bx + bw / 2, by + 55);

    ctx.fillStyle = '#00BCD4';
    ctx.font = '16px sans-serif';
    ctx.fillText(`灵石 +${r.stone.toLocaleString()}`, bx + bw / 2, by + 80);

    ctx.fillStyle = '#9C27B0';
    ctx.fillText(`修为 +${r.cultivation.toLocaleString()}`, bx + bw / 2, by + 100);

    if (r.stoneSpent > 0) {
      ctx.fillStyle = '#F44336';
      ctx.fillText(`修炼消耗 -${r.stoneSpent.toLocaleString()}`, bx + bw / 2, by + 120);
    }

    ctx.fillStyle = '#999';
    ctx.font = '15px sans-serif';
    ctx.fillText('点击屏幕领取', bx + bw / 2, by + 160);

    ctx.restore();
  }

  loop() {
    const now = Date.now();
    const dt = Math.min(0.5, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.update(dt);
    this.render();
    this.aniId = requestAnimationFrame(this.loop.bind(this));
  }
}
