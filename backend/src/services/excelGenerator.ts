import ExcelJS from 'exceljs';
import type { Estimate } from '../models/Estimate';

/**
 * 見積書をExcel形式で生成
 */
export async function generateExcel(estimate: Estimate): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  
  // 基本情報シート
  const infoSheet = workbook.addWorksheet('基本情報');
  infoSheet.columns = [
    { header: '項目', key: 'key', width: 20 },
    { header: '値', key: 'value', width: 30 },
  ];

  infoSheet.addRow({ key: '見積番号', value: estimate.projectInfo.estimateNumber });
  infoSheet.addRow({ key: '客先', value: estimate.projectInfo.customer });
  infoSheet.addRow({ key: '向先', value: estimate.projectInfo.deliveryDestination });
  infoSheet.addRow({ key: '機器名', value: estimate.projectInfo.equipmentName });
  infoSheet.addRow({ key: '製作数量', value: `${estimate.projectInfo.productionQuantity} ${estimate.projectInfo.productionUnit}` });
  infoSheet.addRow({ key: '納期', value: new Date(estimate.projectInfo.deliveryDate).toLocaleDateString('ja-JP') });
  infoSheet.addRow({ key: '機種', value: estimate.projectInfo.model });
  infoSheet.addRow({ key: '機器形状', value: estimate.projectInfo.equipmentShape });
  infoSheet.addRow({ key: '重量', value: `${estimate.projectInfo.weight} kg` });

  // ヘッダー行のスタイル設定
  infoSheet.getRow(1).font = { bold: true };
  infoSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // 原価明細シート
  const detailSheet = workbook.addWorksheet('原価明細');
  detailSheet.columns = [
    { header: '型式', key: 'modelNumber', width: 15 },
    { header: '名称', key: 'name', width: 25 },
    { header: 'Part Type', key: 'partType', width: 15 },
    { header: '材質', key: 'material', width: 15 },
    { header: '数量', key: 'quantity', width: 10 },
    { header: '重量', key: 'weight', width: 12 },
    { header: '単価', key: 'unitPrice', width: 15 },
    { header: '価格', key: 'price', width: 15 },
    { header: '自動', key: 'isAuto', width: 10 },
  ];

  // データ行を追加
  if (estimate.tableData && estimate.tableData.length > 0) {
    estimate.tableData.forEach((row) => {
      detailSheet.addRow({
        modelNumber: row.modelNumber,
        name: row.name,
        partType: row.partType,
        material: row.material,
        quantity: row.quantity,
        weight: row.weight,
        unitPrice: row.unitPrice,
        price: row.price,
        isAuto: row.isAuto ? '✓' : '',
      });
    });
  }

  // ヘッダー行のスタイル設定
  detailSheet.getRow(1).font = { bold: true };
  detailSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // 数値列の書式設定
  detailSheet.getColumn('quantity').numFmt = '#,##0';
  detailSheet.getColumn('weight').numFmt = '#,##0.00';
  detailSheet.getColumn('unitPrice').numFmt = '#,##0';
  detailSheet.getColumn('price').numFmt = '#,##0';

  // 原価計算シート
  const costSheet = workbook.addWorksheet('原価計算');
  costSheet.columns = [
    { header: '項目', key: 'key', width: 25 },
    { header: '金額', key: 'value', width: 20 },
  ];

  if (estimate.costCalculation) {
    costSheet.addRow({ key: '材料費', value: estimate.costCalculation.materialCost });
    costSheet.addRow({ key: '加工費', value: estimate.costCalculation.processingCost });
    costSheet.addRow({ key: '塗装費', value: estimate.costCalculation.paintingCost });
    costSheet.addRow({ key: '外注検査費', value: estimate.costCalculation.externalInspectionCost });
    costSheet.addRow({ key: '輸送費', value: estimate.costCalculation.transportationCost });
    costSheet.addRow({ key: '工場検査費', value: estimate.costCalculation.factoryInspectionCost });
    costSheet.addRow({ key: '設計費', value: estimate.costCalculation.designCost });
    costSheet.addRow({ key: '直接原価', value: estimate.costCalculation.directCost });
    costSheet.addRow({ key: '製造原価', value: estimate.costCalculation.manufacturingCost });
    costSheet.addRow({ key: '総原価', value: estimate.costCalculation.totalCost });
  }

  // ヘッダー行のスタイル設定
  costSheet.getRow(1).font = { bold: true };
  costSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // 金額列の書式設定
  costSheet.getColumn('value').numFmt = '#,##0';

  // 備考シート
  if (estimate.remarksData) {
    const remarksSheet = workbook.addWorksheet('備考・補足');
    remarksSheet.columns = [
      { header: 'カテゴリ', key: 'category', width: 30 },
      { header: '内容', key: 'content', width: 50 },
    ];

    // 備考
    if (estimate.remarksData.remarks.length > 0) {
      estimate.remarksData.remarks.forEach((remark, index) => {
        if (remark) {
          remarksSheet.addRow({ category: `備考${index + 1}`, content: remark });
        }
      });
    }

    // 材料費補足
    if (estimate.remarksData.materialCostNotes.length > 0) {
      estimate.remarksData.materialCostNotes.forEach((note, index) => {
        if (note) {
          remarksSheet.addRow({ category: `材料費補足${index + 1}`, content: note });
        }
      });
    }

    // 内作加工費補足
    if (estimate.remarksData.internalProcessingNotes.length > 0) {
      estimate.remarksData.internalProcessingNotes.forEach((note, index) => {
        if (note) {
          remarksSheet.addRow({ category: `内作加工費補足${index + 1}`, content: note });
        }
      });
    }

    // 外注加工等補足
    if (estimate.remarksData.externalProcessingNotes.length > 0) {
      estimate.remarksData.externalProcessingNotes.forEach((note, index) => {
        if (note) {
          remarksSheet.addRow({ category: `外注加工等補足${index + 1}`, content: note });
        }
      });
    }

    // ヘッダー行のスタイル設定
    remarksSheet.getRow(1).font = { bold: true };
    remarksSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
  }

  // 査印情報シート
  if (estimate.approvalInfo) {
    const approvalSheet = workbook.addWorksheet('査印情報');
    approvalSheet.columns = [
      { header: '項目', key: 'key', width: 20 },
      { header: '値', key: 'value', width: 30 },
    ];

    approvalSheet.addRow({ key: '査定者', value: estimate.approvalInfo.assessor });
    approvalSheet.addRow({ key: '査定日', value: new Date(estimate.approvalInfo.assessmentDate).toLocaleDateString('ja-JP') });
    approvalSheet.addRow({ key: '承認者', value: estimate.approvalInfo.approver });
    approvalSheet.addRow({ key: '承認日', value: new Date(estimate.approvalInfo.approvalDate).toLocaleDateString('ja-JP') });
    approvalSheet.addRow({ key: '最終承認者', value: estimate.approvalInfo.finalApprover });
    approvalSheet.addRow({ key: '査印1', value: estimate.approvalInfo.seal1 });
    approvalSheet.addRow({ key: '査印2', value: estimate.approvalInfo.seal2 });
    approvalSheet.addRow({ key: '査印3', value: estimate.approvalInfo.seal3 });
    approvalSheet.addRow({ key: '査印4', value: estimate.approvalInfo.seal4 });
    approvalSheet.addRow({ key: '担当者', value: estimate.approvalInfo.personInCharge });

    // ヘッダー行のスタイル設定
    approvalSheet.getRow(1).font = { bold: true };
    approvalSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
  }

  // バッファに変換
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

