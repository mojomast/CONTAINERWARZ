import type { CargoType, Route, ContainerSpecs } from '../types';

export const CARGO_TYPES: Record<string, CargoType> = {
  usffPC: {
    id: 'usffPC',
    name: 'USFF PC',
    volume: 1, // liters
    weight: 1, // kg
    basePrice: 20, // MC$
    premiumVariants: [
      {
        name: 'Windows 11 Compatible',
        percentage: 0.35,
        multiplier: 2.5,
        description: 'Enhanced OS compatibility and security features',
        extraCostPerUnit: 5 // licenses + setup
      },
      {
        name: 'Creator Edition',
        percentage: 0.1,
        multiplier: 3.2,
        description: 'Extra RAM & storage for creators',
        extraCostPerUnit: 8
      },
      {
        name: 'Ruggedized',
        percentage: 0.08,
        multiplier: 2.0,
        description: 'Shock-resistant casing',
        extraCostPerUnit: 3
      },
      {
        name: 'Pro Security Suite',
        percentage: 0.12,
        multiplier: 2.8,
        description: 'Enterprise security bundle',
        extraCostPerUnit: 6
      },
      {
        name: 'Eco Power Pack',
        percentage: 0.15,
        multiplier: 2.2,
        description: 'High-efficiency power supply & chargers',
        extraCostPerUnit: 4
      }
    ]
  },
  huyman: {
    id: 'huyman',
    name: 'Huyman',
    volume: 70, // liters (approximate human body volume)
    weight: 70, // kg (average adult)
    basePrice: 300, // MC$
    premiumVariants: [
      {
        name: 'Basketball-Skilled',
        percentage: 0.15,
        multiplier: 4.0,
        description: 'Athletic abilities and entertainment value',
        extraCostPerUnit: 20 // vitamins & protein
      },
      {
        name: 'Redstone Engineer',
        percentage: 0.08,
        multiplier: 3.5,
        description: 'High technical aptitude',
        extraCostPerUnit: 15
      },
      {
        name: 'Master Trader',
        percentage: 0.1,
        multiplier: 3.2,
        description: 'Superior bartering skills',
        extraCostPerUnit: 10
      },
      {
        name: 'Aquatic Navigator',
        percentage: 0.06,
        multiplier: 2.8,
        description: 'Sea-route savvy',
        extraCostPerUnit: 12
      },
      {
        name: 'Medic Support',
        percentage: 0.05,
        multiplier: 2.6,
        description: 'Keeps crew in top shape',
        extraCostPerUnit: 18
      }
    ]
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

// Security catalog
import type { SecurityItem, Mercenary } from '../types';
export const WEAPONS: SecurityItem[] = [
  { id: 'autocannon', name: 'Deck Autocannon', cost: 1200, weaponBonus: 3, description: 'Basic shipboard cannon.' },
  { id: 'missiles', name: 'Defense Missiles', cost: 2500, weaponBonus: 5, description: 'Guided anti-boat missiles.' },
  { id: 'drones', name: 'Recon Drones', cost: 900, weaponBonus: 1, defenseBonus: 1, description: 'Early warning + light attack.' },
  { id: 'railgun', name: 'Prototype Railgun', cost: 5000, weaponBonus: 7, description: 'High-power experimental weapon.' },
  { id: 'watercannon', name: 'High-Pressure Water Cannons', cost: 800, weaponBonus: 1, defenseBonus: 2, description: 'Non-lethal deterrent.' }
];

export const DEFENSES: SecurityItem[] = [
  { id: 'hullarmor', name: 'Reinforced Hull', cost: 1800, defenseBonus: 3, description: 'Extra plating and bulkheads.' },
  { id: 'ciws', name: 'CIWS Turret', cost: 2200, defenseBonus: 4, weaponBonus: 2, description: 'Close-in weapon system.' },
  { id: 'decoys', name: 'Decoy Flares/Chaff', cost: 700, defenseBonus: 2, description: 'Spoofs targeting systems.' },
  { id: 'jammer', name: 'Comms Jammer', cost: 1500, defenseBonus: 3, description: 'Disrupts hostile coordination.' },
  { id: 'shield', name: 'Energy Shield (Mk I)', cost: 4000, defenseBonus: 6, description: 'Advanced protective field.' }
];

export const MERCENARIES: Mercenary[] = [
  { id: 'crew_marine', name: 'Marine Detachment', cost: 1600, defenseBonus: 2, weaponBonus: 2, description: 'Professionals to secure the ship.' },
  { id: 'crew_privateers', name: 'Privateer Escort', cost: 2800, weaponBonus: 4, description: 'Fast boats with firepower.' },
  { id: 'crew_engineer', name: 'Security Engineer', cost: 900, defenseBonus: 1, description: 'Keeps systems online under fire.' },
  { id: 'crew_snipers', name: 'Marksman Team', cost: 1400, weaponBonus: 3, description: 'Long-range overwatch.' },
  { id: 'crew_negotiator', name: 'Negotiator', cost: 1000, defenseBonus: 1, description: 'Reduces fines and de-escalates.' }
];

// Legendary pools
import type { LegendaryItem } from '../types';
export const LEGENDARY_TECH: LegendaryItem[] = [
  { id: 'leg_ai_nav', name: 'AI Navigator Core', kind: 'tech', speedBonus: 0.15, sellValue: 2500, description: 'Optimizes routes for faster arrivals.' },
  { id: 'leg_quantum_grid', name: 'Quantum Power Grid', kind: 'tech', profitBonus: 0.1, sellValue: 3000, description: 'Cuts overhead; boosts profit.' },
  { id: 'leg_holo_camo', name: 'Holo-Camo Projector', kind: 'tech', defenseBonus: 2, sellValue: 2200, description: 'Confuses hostile targeting.' },
  { id: 'leg_autoload', name: 'Auto-Loader MkIV', kind: 'tech', speedBonus: 0.1, profitBonus: 0.05, sellValue: 2600, description: 'Faster handling and better throughput.' },
  { id: 'leg_rail_refit', name: 'Mini-Rail Refit', kind: 'tech', weaponBonus: 2, sellValue: 2400, description: 'Compact high-power armament.' }
];

export const LEGENDARY_CREW: LegendaryItem[] = [
  { id: 'leg_captain', name: 'Legendary Captain', kind: 'crew', speedBonus: 0.1, profitBonus: 0.05, sellValue: 2800, description: 'Knows every current and wind.' },
  { id: 'leg_quartermaster', name: 'Master Quartermaster', kind: 'crew', profitBonus: 0.12, sellValue: 2600, description: 'Squeezes value from every crate.' },
  { id: 'leg_bodyguard', name: 'Titan Bodyguard', kind: 'crew', defenseBonus: 3, sellValue: 2400, description: 'Intimidates would-be attackers.' },
  { id: 'leg_marksman', name: 'Ace Marksman', kind: 'crew', weaponBonus: 3, sellValue: 2500, description: 'Sharp eyes on every horizon.' },
  { id: 'leg_mediator', name: 'World-Class Mediator', kind: 'crew', defenseBonus: 1, profitBonus: 0.06, sellValue: 2300, description: 'Avoids fines and opens doors.' }
];
