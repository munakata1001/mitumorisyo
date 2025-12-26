import type { EstimateTableRow } from '../models/EstimateTableRow';

/**
 * 塗装費を計算する
 * @param paintingArea 塗装面積（m²）
 * @returns 塗装費（円）
 */
export function calculatePaintingCost(paintingArea: number): number {
  // 計算式: 塗装面積(m²) × 5000円
  return paintingArea * 5000;
}

/**
 * 塗装面積を計算する
 * @param tableData テーブルデータ
 * @returns 塗装面積（m²）
 */
export function calculatePaintingArea(tableData: EstimateTableRow[]): number {
  return tableData.reduce((sum, row) => {
    if (!row.dimensions || row.partType !== '板金') {
      return sum;
    }

    const { length, width, height } = row.dimensions;

    // 板金の場合、表面積を計算
    if (length && width && height) {
      // 6面の表面積を計算（mm² → m²）
      const area =
        (2 * ((length * width) + (width * height) + (height * length))) / 1000000;
      return sum + area * row.quantity;
    }

    return sum;
  }, 0);
}

