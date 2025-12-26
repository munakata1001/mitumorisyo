import type { EstimateTableRow } from '../models/EstimateTableRow';

/**
 * 複数ファイルの解析結果を統合
 */
export function mergeFileResults(
  results: EstimateTableRow[][],
  mode: '2ファイル統合' | '3ファイル統合' | '2ファイル+価格参考'
): EstimateTableRow[] {
  if (results.length === 0) {
    return [];
  }

  // 単一ファイルの場合はそのまま返す
  if (results.length === 1) {
    return results[0];
  }

  // IDをキーにしたマップを作成（重複除去用）
  const rowMap = new Map<string, EstimateTableRow>();

  // 各ファイルの結果をマージ
  results.forEach((rows, fileIndex) => {
    rows.forEach(row => {
      // 重複チェック: 型式と名称が同じ行は統合
      const key = `${row.modelNumber}-${row.name}`;
      const existing = rowMap.get(key);

      if (existing) {
        // 既存の行と統合（数量を加算、価格を再計算など）
        existing.quantity += row.quantity;
        existing.price = (existing.unitPrice * existing.quantity) + (row.unitPrice * row.quantity);
        existing.weight = (existing.weight || 0) + (row.weight || 0);
      } else {
        // 新しい行を追加
        rowMap.set(key, { ...row });
      }
    });
  });

  return Array.from(rowMap.values());
}

/**
 * 価格参考データを適用
 */
export function applyPriceReference(
  rows: EstimateTableRow[],
  priceReference: EstimateTableRow[]
): EstimateTableRow[] {
  // 価格参考データをマップ化
  const priceMap = new Map<string, number>();
  priceReference.forEach(ref => {
    const key = `${ref.modelNumber}-${ref.name}`;
    priceMap.set(key, ref.unitPrice);
  });

  // 各行に価格参考を適用
  return rows.map(row => {
    const key = `${row.modelNumber}-${row.name}`;
    const referencePrice = priceMap.get(key);

    if (referencePrice !== undefined && referencePrice > 0) {
      return {
        ...row,
        unitPrice: referencePrice,
        price: referencePrice * row.quantity,
      };
    }

    return row;
  });
}

