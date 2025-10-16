import { create } from 'zustand';
import type { GameState, CargoItem } from '../types';
import { CARGO_TYPES, ROUTES, WEAPONS, DEFENSES, MERCENARIES, LEGENDARY_TECH, LEGENDARY_CREW } from '../data/gameData';
import { calculateShipmentProfit, calculateExperienceGain, getLevelFromExperience } from '../utils/calculations';

interface GameActions {
  setScreen: (screen: GameState['currentScreen']) => void;
  buyUsffPC: (quantity: number) => void;
  buyHuyman: (quantity: number) => void;
  loadCargoToContainer: (shipId: string, containerIndex: number, cargo: CargoItem) => void;
  deployShip: (shipId: string, routeId: string) => void;
  renameShip: (shipId: string, name: string) => void;
  buyWeapon: (shipId: string, weaponId: string) => void;
  buyDefense: (shipId: string, defenseId: string) => void;
  hireMercenary: (shipId: string, mercId: string) => void;
  applyLegendaryToShip: (legendaryId: string, shipId: string) => void;
  sellLegendary: (legendaryId: string) => void;
  tick: () => void;
  completeTutorial: () => void;
  resetGame: () => void;
}

const INITIAL_STATE: GameState = {
  player: {
    name: 'Captain',
    balance: 5000,
    level: 1,
    experience: 0,
    unlockedContainers: ['20ft'],
    unlockedRoutes: ['local-1', 'local-2']
  },
  inventory: {
    usffPCs: 100,
    usffPCsPremium: 35,
    huymans: 10,
    huymansPremium: 2
  },
  ships: [
    {
      id: 'ship-1',
      name: 'SS Crafty',
      containerCapacity: 1,
      containers: [{
        id: 'container-1',
        type: '20ft',
        cargo: [],
        efficiency: 0.8
      }],
      route: null,
      status: 'idle',
      position: 0,
      weapons: [],
      defenses: [],
      mercenaries: [],
      weaponScore: 0,
      defenseScore: 0
    }
  ],
  currentTime: 0,
  isPaused: false,
  tutorialComplete: false,
  currentScreen: 'tutorial',
  starredResources: [],
  legendaries: []
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...INITIAL_STATE,

  setScreen: (screen) => set({ currentScreen: screen }),

  buyUsffPC: (quantity) => {
    const state = get();
    const cost = quantity * CARGO_TYPES.usffPC.basePrice * 0.5; // Buy at 50% of sell price
    
    if (state.player.balance >= cost) {
      const premiumCount = Math.floor(quantity * 0.35);
      const standardCount = quantity - premiumCount;

      // Legendary chance ~2%
      const legends: any[] = [];
      for (let i = 0; i < quantity; i++) {
        if (Math.random() < 0.02) {
          const pick = LEGENDARY_TECH[Math.floor(Math.random()*LEGENDARY_TECH.length)];
          legends.push({ ...pick, id: `${pick.id}-${Date.now()}-${Math.random().toString(36).slice(2)}` });
        }
      }
      
      set({
        player: { ...state.player, balance: state.player.balance - cost },
        inventory: {
          ...state.inventory,
          usffPCs: state.inventory.usffPCs + standardCount,
          usffPCsPremium: state.inventory.usffPCsPremium + premiumCount
        },
        legendaries: legends.length ? [...state.legendaries, ...legends] : state.legendaries
      });
    }
  },

  buyHuyman: (quantity) => {
    const state = get();
    const cost = quantity * CARGO_TYPES.huyman.basePrice * 0.5;
    
    if (state.player.balance >= cost) {
      const premiumCount = Math.floor(quantity * 0.15);
      const standardCount = quantity - premiumCount;

      // Legendary chance ~1.5%
      const legends: any[] = [];
      for (let i = 0; i < quantity; i++) {
        if (Math.random() < 0.015) {
          const pick = LEGENDARY_CREW[Math.floor(Math.random()*LEGENDARY_CREW.length)];
          legends.push({ ...pick, id: `${pick.id}-${Date.now()}-${Math.random().toString(36).slice(2)}` });
        }
      }
      
      set({
        player: { ...state.player, balance: state.player.balance - cost },
        inventory: {
          ...state.inventory,
          huymans: state.inventory.huymans + standardCount,
          huymansPremium: state.inventory.huymansPremium + premiumCount
        },
        legendaries: legends.length ? [...state.legendaries, ...legends] : state.legendaries
      });
    }
  },

  loadCargoToContainer: (shipId, containerIndex, cargo) => {
    const state = get();
    const ship = state.ships.find(s => s.id === shipId);
    
    if (!ship || ship.status !== 'idle') return;
    
    // Deduct from inventory
    let newInventory = { ...state.inventory };
    
    if (cargo.cargoTypeId === 'usffPC') {
      if (cargo.isPremium) {
        if (newInventory.usffPCsPremium < cargo.quantity) return;
        newInventory.usffPCsPremium -= cargo.quantity;
      } else {
        if (newInventory.usffPCs < cargo.quantity) return;
        newInventory.usffPCs -= cargo.quantity;
      }
    } else if (cargo.cargoTypeId === 'huyman') {
      if (cargo.isPremium) {
        if (newInventory.huymansPremium < cargo.quantity) return;
        newInventory.huymansPremium -= cargo.quantity;
      } else {
        if (newInventory.huymans < cargo.quantity) return;
        newInventory.huymans -= cargo.quantity;
      }
    }
    
    // Update container
    const newShips = state.ships.map(s => {
      if (s.id === shipId) {
        const newContainers = [...s.containers];
        newContainers[containerIndex] = {
          ...newContainers[containerIndex],
          cargo: [...newContainers[containerIndex].cargo, cargo]
        };
        return { ...s, containers: newContainers };
      }
      return s;
    });
    
    set({ ships: newShips, inventory: newInventory });
  },

  deployShip: (shipId, routeId) => {
    const state = get();
    const ship = state.ships.find(s => s.id === shipId);
    const route = ROUTES.find(r => r.id === routeId);
    
    if (!ship || !route || ship.status !== 'idle') return;
    
    // Calculate total cargo value and extra costs
    const { totalValue } = ship.containers.reduce((acc, container) => {
      container.cargo.forEach(c => {
        acc.totalValue += c.totalValue;
        acc.totalExtras += c.totalExtraCost || 0;
      });
      return acc;
    }, { totalValue: 0, totalExtras: 0 });
    
    if (totalValue === 0) return; // Don't deploy empty ship
    
    const newShips = state.ships.map(s => {
      if (s.id === shipId) {
        return {
          ...s,
          route,
          status: 'sailing' as const,
          position: 0,
          arrivalTime: state.currentTime + route.duration
        };
      }
      return s;
    });
    
    set({ ships: newShips });
  },

  tick: () => {
    const state = get();
    if (state.isPaused) return;
    
    const newTime = state.currentTime + 1;
    let newShips = [...state.ships];
    let newBalance = state.player.balance;
    let newExperience = state.player.experience;
    let newStarred = [...state.starredResources];
    
    // Update ships
    newShips = newShips.map(ship => {
      if (ship.status === 'sailing' && ship.route && ship.arrivalTime) {
        const effectiveDuration = Math.max(1, Math.floor(ship.route.duration * (1 - (ship.speedBonus || 0))));
        const progress = (newTime - (ship.arrivalTime - effectiveDuration)) / effectiveDuration;

        // Threat encounters while sailing
        const baseRisk = ship.route.difficulty === 'hard' ? 0.06 : ship.route.difficulty === 'medium' ? 0.04 : 0.02;
        const defense = ship.defenseScore || 0;
        const risk = Math.max(0.005, baseRisk - defense * 0.005);
        if (Math.random() < risk) {
          const r = Math.random();
          const threat = r < 0.5 ? 'pirates' : r < 0.7 ? 'coastguard' : r < 0.85 ? 'army' : 'greenpeace';
          const weapon = ship.weaponScore || 0;
          const mercs = ship.mercenaries?.length || 0;
          const winChance = Math.min(0.9, 0.3 + weapon * 0.1 + mercs * 0.05 + defense * 0.05);
          const win = Math.random() < winChance;

          if (threat === 'pirates') {
            if (win) {
              ship.lastEvent = 'Repelled pirates successfully.';
            } else {
              // lose 30% cargo value
              ship.containers = ship.containers.map(c => ({
                ...c,
                cargo: c.cargo.map(ci => ({ ...ci, totalValue: Math.floor(ci.totalValue * 0.7) }))
              }));
              ship.lastEvent = 'Pirates stole part of your cargo (-30% value).';
            }
          } else if (threat === 'coastguard') {
            if (win) {
              ship.lastEvent = 'Coastguard inspection passed.';
            } else {
              const fine = 300 + defense * 50;
              newBalance -= fine;
              ship.lastEvent = `Coastguard fined you ${fine} MC$.`;
            }
          } else if (threat === 'army') {
            if (win) {
              ship.lastEvent = 'Army blockade avoided.';
            } else {
              // confiscate cargo
              ship.containers = ship.containers.map(c => ({ ...c, cargo: [] }));
              ship.lastEvent = 'Army seized your cargo!';
            }
          } else if (threat === 'greenpeace') {
            if (win) {
              ship.lastEvent = 'Greenpeace protest negotiated.';
            } else {
              ship.arrivalTime += Math.ceil(ship.route.duration * 0.2);
              ship.lastEvent = 'Greenpeace blockade delayed arrival (+20%).';
            }
          }
        }
        
        if (newTime >= ship.arrivalTime) {
          // Ship arrived!
          const { cargoValue, extraCosts } = ship.containers.reduce((acc, container) => {
            container.cargo.forEach(c => {
              acc.cargoValue += c.totalValue;
              acc.extraCosts += c.totalExtraCost || 0;
            });
            return acc;
          }, { cargoValue: 0, extraCosts: 0 });
          
          const profitBonus = 1 + (ship.profitBonus || 0);
          const profit = calculateShipmentProfit(Math.floor(cargoValue * profitBonus), ship.route.priceMultiplier, 500, extraCosts);
          const xpGain = calculateExperienceGain(
            profit,
            ship.containers[0].type,
            ship.route.difficulty
          );
          
          newBalance += profit;
          newExperience += xpGain;
          
          // Reset ship
          return {
            ...ship,
            status: 'idle' as const,
            route: null,
            position: 0,
            arrivalTime: undefined,
            containers: ship.containers.map(c => ({ ...c, cargo: [] }))
          };
        }
        
        return { ...ship, position: Math.min(progress, 1) };
      }
      return ship;
    });

    // Randomly spawn a starred resource sometimes
    if (Math.random() < 0.03) { // ~3% per tick
      const names = ['Star Crystal', 'Ancient Cog', 'Ocean Pearl', 'Ender Bloom', 'Meteor Alloy'];
      const pick = names[Math.floor(Math.random() * names.length)];
      newStarred = [
        { id: `res-${newTime}-${Math.random().toString(36).slice(2)}`, name: pick, description: 'A rare resource discovered during operations.', createdAt: newTime },
        ...newStarred
      ].slice(0, 10);
    }
    
    const newLevel = getLevelFromExperience(newExperience);
    const unlockedContainers = (newLevel >= 5 ? (['20ft', '40ft'] as const) : (['20ft'] as const)) as unknown as GameState['player']['unlockedContainers'];
    const unlockedRoutes = newLevel >= 3 
      ? ['local-1', 'local-2', 'regional-1', 'regional-2']
      : ['local-1', 'local-2'];
    
    set({
      currentTime: newTime,
      ships: newShips,
      starredResources: newStarred,
      player: {
        ...state.player,
        balance: newBalance,
        experience: newExperience,
        level: newLevel,
        unlockedContainers,
        unlockedRoutes
      }
    });
  },

  renameShip: (shipId, name) => set((state) => ({
    ships: state.ships.map(s => s.id === shipId ? { ...s, name } : s)
  })),

  buyWeapon: (shipId, weaponId) => set((state) => {
    const weapon = WEAPONS.find(w => w.id === weaponId);
    const ship = state.ships.find(s => s.id === shipId);
    if (!weapon || !ship || state.player.balance < weapon.cost) return {} as any;
    return {
      player: { ...state.player, balance: state.player.balance - weapon.cost },
      ships: state.ships.map(s => s.id === shipId ? {
        ...s,
        weapons: [...(s.weapons || []), weapon.id],
        weaponScore: (s.weaponScore || 0) + (weapon.weaponBonus || 0),
        defenseScore: (s.defenseScore || 0) + (weapon.defenseBonus || 0)
      } : s)
    } as any;
  }),

  buyDefense: (shipId, defenseId) => set((state) => {
    const def = DEFENSES.find(d => d.id === defenseId);
    const ship = state.ships.find(s => s.id === shipId);
    if (!def || !ship || state.player.balance < def.cost) return {} as any;
    return {
      player: { ...state.player, balance: state.player.balance - def.cost },
      ships: state.ships.map(s => s.id === shipId ? {
        ...s,
        defenses: [...(s.defenses || []), def.id],
        weaponScore: (s.weaponScore || 0) + (def.weaponBonus || 0),
        defenseScore: (s.defenseScore || 0) + (def.defenseBonus || 0)
      } : s)
    } as any;
  }),

  hireMercenary: (shipId, mercId) => set((state) => {
    const merc = MERCENARIES.find(m => m.id === mercId);
    const ship = state.ships.find(s => s.id === shipId);
    if (!merc || !ship || state.player.balance < merc.cost) return {} as any;
    return {
      player: { ...state.player, balance: state.player.balance - merc.cost },
      ships: state.ships.map(s => s.id === shipId ? {
        ...s,
        mercenaries: [...(s.mercenaries || []), merc.id],
        weaponScore: (s.weaponScore || 0) + (merc.weaponBonus || 0),
        defenseScore: (s.defenseScore || 0) + (merc.defenseBonus || 0)
      } : s)
    } as any;
  }),

  applyLegendaryToShip: (legendaryId, shipId) => set((state) => {
    const leg = state.legendaries.find(l => l.id === legendaryId);
    if (!leg) return {} as any;
    return {
      legendaries: state.legendaries.filter(l => l.id !== legendaryId),
      ships: state.ships.map(s => s.id === shipId ? {
        ...s,
        weaponScore: (s.weaponScore || 0) + (leg.weaponBonus || 0),
        defenseScore: (s.defenseScore || 0) + (leg.defenseBonus || 0),
        profitBonus: (s.profitBonus || 0) + (leg.profitBonus || 0),
        speedBonus: (s.speedBonus || 0) + (leg.speedBonus || 0)
      } : s)
    } as any;
  }),

  sellLegendary: (legendaryId) => set((state) => {
    const leg = state.legendaries.find(l => l.id === legendaryId);
    if (!leg) return {} as any;
    return {
      legendaries: state.legendaries.filter(l => l.id !== legendaryId),
      player: { ...state.player, balance: state.player.balance + leg.sellValue }
    } as any;
  }),

  completeTutorial: () => set({ tutorialComplete: true, currentScreen: 'dashboard' }),

  resetGame: () => set(INITIAL_STATE)
}));
