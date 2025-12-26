import type { Estimate, CostCalculation } from '../models/Estimate';
import type { EstimateTableRow } from '../models/EstimateTableRow';
import { v4 as uuidv4 } from 'uuid';

// メモリストレージ（実際の実装ではデータベースを使用）
const estimates: Map<string, Estimate> = new Map();

/**
 * 見積書を保存
 */
export function saveEstimate(estimate: Estimate): Estimate {
  const now = new Date();
  
  // IDが存在しない場合は新規作成
  if (!estimate.id) {
    estimate.id = uuidv4();
    estimate.createdAt = now;
  }
  
  estimate.updatedAt = now;
  
  // メモリストレージに保存
  estimates.set(estimate.id, { ...estimate });
  
  return { ...estimate };
}

/**
 * 見積書を取得
 */
export function getEstimate(id: string): Estimate | null {
  const estimate = estimates.get(id);
  return estimate ? { ...estimate } : null;
}

/**
 * 見積番号で見積書を検索
 */
export function findEstimateByNumber(estimateNumber: string): Estimate | null {
  for (const estimate of estimates.values()) {
    if (estimate.projectInfo.estimateNumber === estimateNumber) {
      return { ...estimate };
    }
  }
  return null;
}

/**
 * すべての見積書を取得
 */
export function getAllEstimates(): Estimate[] {
  return Array.from(estimates.values());
}

/**
 * 見積書を削除
 */
export function deleteEstimate(id: string): boolean {
  return estimates.delete(id);
}

/**
 * 見積書の原価明細を取得
 */
export function getTableData(estimateId: string): EstimateTableRow[] | null {
  const estimate = estimates.get(estimateId);
  return estimate ? [...estimate.tableData] : null;
}

/**
 * 見積書の原価明細を更新
 */
export function updateTableData(
  estimateId: string,
  tableData: EstimateTableRow[]
): EstimateTableRow[] | null {
  const estimate = estimates.get(estimateId);
  if (!estimate) {
    return null;
  }

  estimate.tableData = [...tableData];
  estimate.updatedAt = new Date();
  estimates.set(estimateId, { ...estimate });

  return [...estimate.tableData];
}

/**
 * 原価明細に行を追加
 */
export function addTableRow(estimateId: string): EstimateTableRow | null {
  const estimate = estimates.get(estimateId);
  if (!estimate) {
    return null;
  }

  const newRow: EstimateTableRow = {
    id: uuidv4(),
    modelNumber: '',
    name: '',
    partType: '',
    material: '',
    dimensions: { partType: '' },
    quantity: 1,
    weight: 0,
    unitPrice: 0,
    price: 0,
    autoDisplay: false,
    isAuto: false,
    isAutoInput: false,
    isTemplateDiff: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  estimate.tableData.push(newRow);
  estimate.updatedAt = new Date();
  estimates.set(estimateId, { ...estimate });

  return { ...newRow };
}

/**
 * 原価明細の行を更新
 */
export function updateTableRow(
  estimateId: string,
  rowId: string,
  data: Partial<EstimateTableRow>
): EstimateTableRow | null {
  const estimate = estimates.get(estimateId);
  if (!estimate) {
    return null;
  }

  const rowIndex = estimate.tableData.findIndex((row) => row.id === rowId);
  if (rowIndex === -1) {
    return null;
  }

  estimate.tableData[rowIndex] = {
    ...estimate.tableData[rowIndex],
    ...data,
    updatedAt: new Date(),
  };
  estimate.updatedAt = new Date();
  estimates.set(estimateId, { ...estimate });

  return { ...estimate.tableData[rowIndex] };
}

/**
 * 原価明細の行を削除
 */
export function deleteTableRow(estimateId: string, rowId: string): boolean {
  const estimate = estimates.get(estimateId);
  if (!estimate) {
    return false;
  }

  const rowIndex = estimate.tableData.findIndex((row) => row.id === rowId);
  if (rowIndex === -1) {
    return false;
  }

  estimate.tableData.splice(rowIndex, 1);
  estimate.updatedAt = new Date();
  estimates.set(estimateId, { ...estimate });

  return true;
}

/**
 * 見積書の原価計算データを取得
 */
export function getCostCalculation(estimateId: string): CostCalculation | null {
  const estimate = estimates.get(estimateId);
  return estimate ? { ...estimate.costCalculation } : null;
}

/**
 * 見積書の原価計算データを更新
 */
export function updateCostCalculation(
  estimateId: string,
  costCalculation: Partial<CostCalculation>
): CostCalculation | null {
  const estimate = estimates.get(estimateId);
  if (!estimate) {
    return null;
  }

  // 既存の原価計算データとマージ
  estimate.costCalculation = {
    ...estimate.costCalculation,
    ...costCalculation,
  };
  estimate.updatedAt = new Date();
  estimates.set(estimateId, { ...estimate });

  return { ...estimate.costCalculation };
}


