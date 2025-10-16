// Core game types for MCTC Shipping Tycoon

export interface CargoType {
  id: string;
  name: string;
  volume: number; // liters
  weight: number; // kg
  basePrice: number; // MC$
  premiumVariants?: PremiumVariant[];
}

export interface PremiumVariant {
  name: string;
  percentage: number; // 0-1
  multiplier: number; // price multiplier
  description: string;
  extraCostPerUnit?: number; // additional cost per unit (licenses, supplies, care)
}

export interface CargoItem {
  cargoTypeId: string;
  quantity: number;
  isPremium: boolean;
  premiumVariantName?: string;
  totalValue: number;
  totalWeight: number;
  totalVolume: number;
  totalExtraCost?: number; // accumulated extra costs (per-unit)
}

export type ContainerType = '20ft' | '40ft';

export interface ContainerSpecs {
  type: ContainerType;
  volume: number; // m³
  weight: number; // kg max payload
  usableVolume: number; // at 80% efficiency
}

export interface Container {
  id: string;
  type: ContainerType;
  cargo: CargoItem[];
  efficiency: number; // 0.6-0.9
}

export interface ContainerAnalysis {
  containerType: ContainerType;
  cargoType: CargoType;
  capacityByVolume: number;
  capacityByWeight: number;
  actualCapacity: number;
  limitingFactor: 'volume' | 'weight';
  totalValue: number;
  valuePerCubicFoot: number;
  valuePerPound: number;
}

export type Threat = 'pirates' | 'coastguard' | 'army' | 'greenpeace';

export interface SecurityItem {
  id: string;
  name: string;
  cost: number;
  weaponBonus?: number;
  defenseBonus?: number;
  description?: string;
}

export interface Mercenary {
  id: string;
  name: string;
  cost: number;
  weaponBonus?: number;
  defenseBonus?: number;
  description?: string;
}

export interface Ship {
  id: string;
  name: string;
  containerCapacity: number;
  containers: Container[];
  route: Route | null;
  status: 'idle' | 'loading' | 'sailing' | 'unloading';
  position: number; // 0-1 progress on route
  arrivalTime?: number;
  weapons?: string[]; // ids of SecurityItem
  defenses?: string[]; // ids of SecurityItem
  mercenaries?: string[]; // ids of Mercenary
  weaponScore?: number; // aggregated bonuses
  defenseScore?: number; // aggregated bonuses
  profitBonus?: number; // multiplier additive e.g., 0.1 for +10%
  speedBonus?: number; // multiplier additive on duration e.g., 0.1 for +10% faster
  lastEvent?: string;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number; // km
  duration: number; // seconds
  priceMultiplier: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Player {
  name: string;
  balance: number; // MC$
  level: number;
  experience: number;
  unlockedContainers: ContainerType[];
  unlockedRoutes: string[];
}

export interface Inventory {
  usffPCs: number;
  usffPCsPremium: number; // Windows 11 compatible
  huymans: number;
  huymansPremium: number; // Basketball-skilled
}

export interface StarredResource {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface LegendaryItem {
  id: string;
  name: string;
  kind: 'tech' | 'crew';
  weaponBonus?: number;
  defenseBonus?: number;
  profitBonus?: number;
  speedBonus?: number;
  sellValue: number; // black market value
  description?: string;
}

export interface GameState {
  player: Player;
  inventory: Inventory;
  ships: Ship[];
  currentTime: number;
  isPaused: boolean;
  tutorialComplete: boolean;
  currentScreen: 'dashboard' | 'loading' | 'market' | 'routes' | 'tutorial' | 'security';
  starredResources: StarredResource[];
  legendaries: LegendaryItem[];
}

export interface ValueDensity {
  valuePerCubicFoot: number;
  valuePerPound: number;
  totalValue: number;
  totalVolume: number; // cubic feet
  totalWeight: number; // pounds
}
