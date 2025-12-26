import ExcelJS from 'exceljs';
import type { EstimateTableRow, DimensionData } from '../models/EstimateTableRow';
import { v4 as uuidv4 } from 'uuid';

/**
 * Excelファイルを解析してEstimateTableRow[]に変換
 */
export async function parseExcelFile(buffer: Buffer): Promise<EstimateTableRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const rows: EstimateTableRow[] = [];

  // 最初のシートを読み込む
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Excelファイルにシートが見つかりません');
  }

  // ヘッダー行をスキップ（1行目を想定）
  // データが始まる行を探す（ヘッダー行を自動検出する場合は実装を変更）
  const headerRow = 1;
  let dataStartRow = headerRow + 1;

  // ヘッダー行から列のインデックスを取得（オプション：実際のExcelフォーマットに合わせて調整）
  for (let i = dataStartRow; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    
    // 空行はスキップ
    const firstCell = row.getCell(1);
    if (!firstCell || !firstCell.value) {
      continue;
    }

    try {
      const tableRow: EstimateTableRow = {
        id: uuidv4(),
        modelNumber: String(row.getCell(1)?.value || '').trim(),
        name: String(row.getCell(2)?.value || '').trim(),
        partType: String(row.getCell(3)?.value || '').trim(),
        material: String(row.getCell(4)?.value || '').trim(),
        dimensions: parseDimensions(row),
        quantity: parseNumber(row.getCell(6)?.value) || 1,
        weight: parseNumber(row.getCell(7)?.value) || 0,
        unitPrice: parseNumber(row.getCell(8)?.value) || 0,
        price: parseNumber(row.getCell(9)?.value) || 0,
        autoDisplay: false,
        isAuto: Boolean(row.getCell(10)?.value) || false,
        isAutoInput: true, // ファイルから読み込んだデータ
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

/**
 * 寸法データを解析
 */
function parseDimensions(row: ExcelJS.Row): DimensionData {
  const partType = String(row.getCell(3)?.value || '').trim();
  const dimensions: DimensionData = { partType };

  // 寸法データの解析（実際のExcelフォーマットに合わせて調整）
  // 例: 列5-8に寸法データがある場合
  const length = parseNumber(row.getCell(11)?.value);
  const width = parseNumber(row.getCell(12)?.value);
  const height = parseNumber(row.getCell(13)?.value);
  const thickness = parseNumber(row.getCell(14)?.value);
  const diameter = parseNumber(row.getCell(15)?.value);
  const radius = parseNumber(row.getCell(16)?.value);

  if (length) dimensions.length = length;
  if (width) dimensions.width = width;
  if (height) dimensions.height = height;
  if (thickness) dimensions.thickness = thickness;
  if (diameter) dimensions.diameter = diameter;
  if (radius) dimensions.radius = radius;

  return dimensions;
}

/**
 * セルの値を数値に変換
 */
function parseNumber(value: any): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/,/g, ''));
    return isNaN(parsed) ? undefined : parsed;
  }
  
  return undefined;
}

