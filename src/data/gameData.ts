import type { CargoType, Route, ContainerSpecs } from '../types';

export const CARGO_TYPES: Record<string, CargoType> = {
  usffPC: {
    id: 'usffPC',
    name: 'USFF PC',
    volume: 1, // liters
    weight: 1, // kg
    basePrice: 20, // MC$
    premiumVariants: [{
      name: 'Windows 11 Compatible',
      percentage: 0.35,
      multiplier: 2.5,
      description: 'Enhanced OS compatibility and security features'
    }]
  },
  huyman: {
    id: 'huyman',
    name: 'Huyman',
    volume: 70, // liters (approximate human body volume)
    weight: 70, // kg (average adult)
    basePrice: 300, // MC$
    premiumVariants: [{
      name: 'Basketball-Skilled',
      percentage: 0.15,
      multiplier: 4.0,
      description: 'Athletic abilities and entertainment value'
    }]
  }
};

export const CONTAINER_SPECS: Record<string, ContainerSpecs> = {
  '20ft': {
    type: '20ft',
    volume: 27.86, // m³
    weight: 21700, // kg max payload
    usableVolume: 22.3 // at 80% efficiency
  },
  '40ft': {
    type: '40ft',
    volume: 67.7, // m³
    weight: 26700, // kg max payload
    usableVolume: 54.16 // at 80% efficiency
  }
};

export const ROUTES: Route[] = [
  {
    id: 'local-1',
    name: 'Port Blocky → Villager Bay',
    origin: 'Port Blocky',
    destination: 'Villager Bay',
    distance: 150,
    duration: 30, // seconds
    priceMultiplier: 1.0,
    difficulty: 'easy'
  },
  {
    id: 'local-2',
    name: 'Villager Bay → Redstone City',
    origin: 'Villager Bay',
    destination: 'Redstone City',
    distance: 200,
    duration: 45,
    priceMultiplier: 1.2,
    difficulty: 'easy'
  },
  {
    id: 'regional-1',
    name: 'Port Blocky → Diamond District',
    origin: 'Port Blocky',
    destination: 'Diamond District',
    distance: 500,
    duration: 90,
    priceMultiplier: 1.5,
    difficulty: 'medium'
  },
  {
    id: 'regional-2',
    name: 'Redstone City → Emerald Isle',
    origin: 'Redstone City',
    destination: 'Emerald Isle',
    distance: 750,
    duration: 120,
    priceMultiplier: 1.8,
    difficulty: 'medium'
  }
];

// Conversion constants
export const LITERS_TO_CUBIC_FEET = 0.0353147;
export const KG_TO_POUNDS = 2.20462;
export const M3_TO_CUBIC_FEET = 35.3147;
