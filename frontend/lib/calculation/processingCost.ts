import type { EstimateTableRow } from '@/types/estimate';

/**
 * 加工費を計算する
 * @param tableData テーブルデータ
 * @returns 加工費（円）
 */
export function calculateProcessingCost(tableData: EstimateTableRow[]): number {
  // 総重量を計算
  const totalWeight = tableData.reduce((sum, row) => {
    return sum + (row.weight || 0);
  }, 0);
  
  // 部品種類数を計算
  const partTypeSet = new Set(
    tableData
      .filter(row => row.partType)
      .map(row => row.partType)
  );
  const partTypeCount = partTypeSet.size;
  
  // 計算式: 総重量(kg) × 1000円 + 部品種類数 × 5000円
  return totalWeight * 1000 + partTypeCount * 5000;
}

