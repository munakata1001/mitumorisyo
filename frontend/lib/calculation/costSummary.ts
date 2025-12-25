import type { CostCalculation } from '@/types/estimate';

/**
 * 原価サマリーを計算する
 * @param costCalculation 原価計算データ
 * @returns 原価サマリー
 */
export function calculateCostSummary(costCalculation: CostCalculation): {
  directCost: number;
  manufacturingCost: number;
  totalCost: number;
} {
  const totalCost = 
    costCalculation.materialCost +
    costCalculation.processingCost +
    costCalculation.paintingCost +
    costCalculation.externalInspectionCost +
    costCalculation.transportationCost +
    costCalculation.factoryInspectionCost +
    costCalculation.designCost;
  
  return {
    directCost: totalCost * 0.7,
    manufacturingCost: totalCost * 0.9,
    totalCost: totalCost
  };
}

