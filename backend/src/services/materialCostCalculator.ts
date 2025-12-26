import type { EstimateTableRow } from '../models/EstimateTableRow';

/**
 * 材料費を計算する
 * @param tableData テーブルデータ
 * @returns 材料費（円）
 */
export function calculateMaterialCost(tableData: EstimateTableRow[]): number {
  return tableData.reduce((sum, row) => {
    return sum + (row.price || 0);
  }, 0);
}

