import type { CargoType, ContainerType, ContainerAnalysis, ValueDensity, ContainerSpecs } from '../types';
import { CONTAINER_SPECS, LITERS_TO_CUBIC_FEET, KG_TO_POUNDS, M3_TO_CUBIC_FEET } from '../data/gameData';

export function calculateContainerCapacity(
  containerType: ContainerType,
  cargoType: CargoType,
  packingEfficiency: number = 0.8
): ContainerAnalysis {
  const container = CONTAINER_SPECS[containerType];
  
  // Convert container volume to liters
  const containerVolumeLiters = container.volume * 1000;
  const usableVolumeLiters = containerVolumeLiters * packingEfficiency;
  
  // Calculate capacity by volume
  const capacityByVolume = Math.floor(usableVolumeLiters / cargoType.volume);
  
  // Calculate capacity by weight
  const capacityByWeight = Math.floor(container.weight / cargoType.weight);
  
  // Actual capacity is limited by the smaller of the two
  const actualCapacity = Math.min(capacityByVolume, capacityByWeight);
  const limitingFactor = capacityByVolume < capacityByWeight ? 'volume' : 'weight';
  
  // Calculate total value (base price only, no premiums for analysis)
  const totalValue = actualCapacity * cargoType.basePrice;
  
  // Calculate value densities
  const totalVolumeCubicFeet = (actualCapacity * cargoType.volume) * LITERS_TO_CUBIC_FEET;
  const totalWeightPounds = (actualCapacity * cargoType.weight) * KG_TO_POUNDS;
  
  const valuePerCubicFoot = totalValue / totalVolumeCubicFeet;
  const valuePerPound = totalValue / totalWeightPounds;
  
  return {
    containerType,
    cargoType,
    capacityByVolume,
    capacityByWeight,
    actualCapacity,
    limitingFactor,
    totalValue,
    valuePerCubicFoot,
    valuePerPound
  };
}

export function calculateValueDensity(
  cargoType: CargoType,
  quantity: number,
  isPremium: boolean = false
): ValueDensity {
  const price = isPremium && cargoType.premiumVariants && cargoType.premiumVariants.length > 0
    ? cargoType.basePrice * cargoType.premiumVariants[0].multiplier
    : cargoType.basePrice;
  
  const totalValue = quantity * price;
  const totalVolumeCubicFeet = (quantity * cargoType.volume) * LITERS_TO_CUBIC_FEET;
  const totalWeightPounds = (quantity * cargoType.weight) * KG_TO_POUNDS;
  
  return {
    totalValue,
    totalVolume: totalVolumeCubicFeet,
    totalWeight: totalWeightPounds,
    valuePerCubicFoot: totalValue / totalVolumeCubicFeet,
    valuePerPound: totalValue / totalWeightPounds
  };
}

export function calculateShipmentProfit(
  cargoValue: number,
  routeMultiplier: number,
  baseCost: number = 500
): number {
  const revenue = cargoValue * routeMultiplier;
  const profit = revenue - baseCost;
  return Math.floor(profit);
}

export function calculateExperienceGain(
  profit: number,
  containerType: ContainerType,
  routeDifficulty: 'easy' | 'medium' | 'hard'
): number {
  const baseXP = Math.floor(profit / 100);
  const containerBonus = containerType === '40ft' ? 1.5 : 1.0;
  const difficultyBonus = {
    easy: 1.0,
    medium: 1.3,
    hard: 1.6
  }[routeDifficulty];
  
  return Math.floor(baseXP * containerBonus * difficultyBonus);
}

export function getLevelFromExperience(experience: number): number {
  // Simple level curve: level = sqrt(xp / 100)
  return Math.floor(Math.sqrt(experience / 100)) + 1;
}

export function getExperienceForNextLevel(currentLevel: number): number {
  return (currentLevel * currentLevel) * 100;
}

export function formatCurrency(amount: number): string {
  return `MC$ ${amount.toLocaleString()}`;
}

export function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
