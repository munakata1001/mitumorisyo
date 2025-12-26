import pdf from 'pdf-parse';
import type { EstimateTableRow, DimensionData } from '../models/EstimateTableRow';
import { v4 as uuidv4 } from 'uuid';

/**
 * PDFファイルを解析してEstimateTableRow[]に変換
 */
export async function parsePdfFile(buffer: Buffer): Promise<EstimateTableRow[]> {
  const data = await pdf(buffer);
  const text = data.text;

  const rows: EstimateTableRow[] = [];

  // PDFテキストから表データを抽出
  // 実際のPDFフォーマットに合わせて解析ロジックを実装
  const lines = text.split('\n').filter(line => line.trim() !== '');

  // ヘッダー行を検出（例: "型式", "名称", "Part Type"などが含まれる行）
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('型式') || lines[i].includes('名称')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error('PDFファイルから表データを検出できませんでした');
  }

  // データ行を解析
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      // タブまたはスペースで区切られたデータを解析
      // 実際のPDFフォーマットに合わせて調整が必要
      const columns = line.split(/\s+/).filter(col => col.trim() !== '');

      if (columns.length < 3) {
        continue; // 最小限の列がない場合はスキップ
      }

      const tableRow: EstimateTableRow = {
        id: uuidv4(),
        modelNumber: columns[0] || '',
        name: columns[1] || '',
        partType: columns[2] || '',
        material: columns[3] || '',
        dimensions: {
          partType: columns[2] || '',
        },
        quantity: parseFloat(columns[4] || '1') || 1,
        weight: parseFloat(columns[5] || '0') || 0,
        unitPrice: parseFloat(columns[6] || '0') || 0,
        price: parseFloat(columns[7] || '0') || 0,
        autoDisplay: false,
        isAuto: false,
        isAutoInput: true,
        isTemplateDiff: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 価格が設定されていない場合は単価×数量で計算
      if (tableRow.price === 0 && tableRow.unitPrice > 0 && tableRow.quantity > 0) {
        tableRow.price = tableRow.unitPrice * tableRow.quantity;
      }

      rows.push(tableRow);
    } catch (error) {
      console.error(`行 ${i} の解析中にエラーが発生しました:`, error);
      // エラーが発生した行はスキップして続行
    }
  }

  return rows;
}

