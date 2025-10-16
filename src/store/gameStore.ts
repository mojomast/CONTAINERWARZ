import { create } from 'zustand';
import type { GameState, Ship, Container, CargoItem, Route } from '../types';
import { CARGO_TYPES, ROUTES } from '../data/gameData';
import { calculateShipmentProfit, calculateExperienceGain, getLevelFromExperience } from '../utils/calculations';

interface GameActions {
  setScreen: (screen: GameState['currentScreen']) => void;
  buyUsffPC: (quantity: number) => void;
  buyHuyman: (quantity: number) => void;
  loadCargoToContainer: (shipId: string, containerIndex: number, cargo: CargoItem) => void;
  deployShip: (shipId: string, routeId: string) => void;
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
      position: 0
    }
  ],
  currentTime: 0,
  isPaused: false,
  tutorialComplete: false,
  currentScreen: 'tutorial'
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
      
      set({
        player: { ...state.player, balance: state.player.balance - cost },
        inventory: {
          ...state.inventory,
          usffPCs: state.inventory.usffPCs + standardCount,
          usffPCsPremium: state.inventory.usffPCsPremium + premiumCount
        }
      });
    }
  },

  buyHuyman: (quantity) => {
    const state = get();
    const cost = quantity * CARGO_TYPES.huyman.basePrice * 0.5;
    
    if (state.player.balance >= cost) {
      const premiumCount = Math.floor(quantity * 0.15);
      const standardCount = quantity - premiumCount;
      
      set({
        player: { ...state.player, balance: state.player.balance - cost },
        inventory: {
          ...state.inventory,
          huymans: state.inventory.huymans + standardCount,
          huymansPremium: state.inventory.huymansPremium + premiumCount
        }
      });
    }
  },

  loadCargoToContainer: (shipId, containerIndex, cargo) => {
    const state = get();
    const ship = state.ships.find(s => s.id === shipId);
    
    if (!ship || ship.status !== 'idle') return;
    
    // Deduct from inventory
    const cargoType = CARGO_TYPES[cargo.cargoTypeId];
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
    
    // Calculate total cargo value
    const totalValue = ship.containers.reduce((sum, container) => {
      return sum + container.cargo.reduce((cargoSum, c) => cargoSum + c.totalValue, 0);
    }, 0);
    
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
    
    // Update ships
    newShips = newShips.map(ship => {
      if (ship.status === 'sailing' && ship.route && ship.arrivalTime) {
        const progress = (newTime - (ship.arrivalTime - ship.route.duration)) / ship.route.duration;
        
        if (newTime >= ship.arrivalTime) {
          // Ship arrived!
          const cargoValue = ship.containers.reduce((sum, container) => {
            return sum + container.cargo.reduce((cargoSum, c) => cargoSum + c.totalValue, 0);
          }, 0);
          
          const profit = calculateShipmentProfit(cargoValue, ship.route.priceMultiplier);
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
    
    const newLevel = getLevelFromExperience(newExperience);
    const unlockedContainers = newLevel >= 5 ? ['20ft', '40ft'] : ['20ft'];
    const unlockedRoutes = newLevel >= 3 
      ? ['local-1', 'local-2', 'regional-1', 'regional-2']
      : ['local-1', 'local-2'];
    
    set({
      currentTime: newTime,
      ships: newShips,
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

  completeTutorial: () => set({ tutorialComplete: true, currentScreen: 'dashboard' }),

  resetGame: () => set(INITIAL_STATE)
}));
