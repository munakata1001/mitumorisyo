import type { EstimateTableRow, DimensionData } from '../models/EstimateTableRow';
import type { CostCalculation } from '../models/Estimate';
import { calculateWeight } from './weightCalculator';
import { calculateMaterialCost } from './materialCostCalculator';
import { calculateProcessingCost } from './processingCostCalculator';
import {
  calculatePaintingCost,
  calculatePaintingArea,
} from './paintingCostCalculator';

/**
 * テーブル行の重量と価格を再計算する
 * @param row テーブル行データ
 * @returns 更新されたテーブル行データ
 */
export function recalculateRowWeightAndPrice(row: EstimateTableRow): EstimateTableRow {
  // 重量を計算
  const weight = calculateWeight(row.dimensions, row.material, row.partType);

  // 価格を計算（自動計算フラグが有効な場合）
  let price = row.price;
  if (row.isAuto) {
    price = row.unitPrice * row.quantity * (weight > 0 ? weight : 1);
  } else {
    // 自動計算が無効な場合は、単価 × 数量で計算
    price = row.unitPrice * row.quantity;
  }

  return {
    ...row,
    weight,
    price,
  };
}

/**
 * すべてのテーブル行の重量と価格を再計算する
 * @param tableData テーブルデータ
 * @returns 更新されたテーブルデータ
 */
export function recalculateAllRows(tableData: EstimateTableRow[]): EstimateTableRow[] {
  return tableData.map((row) => recalculateRowWeightAndPrice(row));
}

/**
 * 原価計算を実行する
 * @param tableData テーブルデータ
 * @param costCalculation 現在の原価計算データ（手動入力項目を含む）
 * @returns 更新された原価計算データ
 */
export function calculateCost(
  tableData: EstimateTableRow[],
  costCalculation: Partial<CostCalculation> = {}
): CostCalculation {
  // まず、すべての行の重量と価格を再計算
  const recalculatedTableData = recalculateAllRows(tableData);

  // 材料費を計算
  const materialCost = calculateMaterialCost(recalculatedTableData);

  // 加工費を計算
  const processingCost = calculateProcessingCost(recalculatedTableData);

  // 塗装面積を計算
  const paintingArea = calculatePaintingArea(recalculatedTableData);

  // 塗装費を計算
  const paintingCost = calculatePaintingCost(paintingArea);

  // 手動入力項目は既存の値を使用（デフォルト値: 0）
  const externalInspectionCost = costCalculation.externalInspectionCost || 0;
  const transportationCost = costCalculation.transportationCost || 0;
  const factoryInspectionCost = costCalculation.factoryInspectionCost || 0;
  const designCost = costCalculation.designCost || 0;

  // 総原価を計算
  const totalCost =
    materialCost +
    processingCost +
    paintingCost +
    externalInspectionCost +
    transportationCost +
    factoryInspectionCost +
    designCost;

  // 直接原価と製造原価を計算
  const directCost = totalCost * 0.7;
  const manufacturingCost = totalCost * 0.9;

  return {
    materialCost,
    processingCost,
    paintingCost,
    externalInspectionCost,
    transportationCost,
    factoryInspectionCost,
    designCost,
    directCost,
    manufacturingCost,
    totalCost,
    paintingArea,
  };
}

/**
 * テーブルデータから原価計算を実行し、テーブルデータも更新する
 * @param tableData テーブルデータ
 * @param costCalculation 現在の原価計算データ（手動入力項目を含む）
 * @returns 更新されたテーブルデータと原価計算データ
 */
export function recalculateEverything(
  tableData: EstimateTableRow[],
  costCalculation: Partial<CostCalculation> = {}
): {
  tableData: EstimateTableRow[];
  costCalculation: CostCalculation;
} {
  // すべての行の重量と価格を再計算
  const recalculatedTableData = recalculateAllRows(tableData);

  // 原価計算を実行
  const recalculatedCostCalculation = calculateCost(
    recalculatedTableData,
    costCalculation
  );

  return {
    tableData: recalculatedTableData,
    costCalculation: recalculatedCostCalculation,
  };
}

