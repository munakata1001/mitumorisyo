import PDFDocument from 'pdfkit';
import type { Estimate } from '../models/Estimate';

// PDFKitの型定義
declare module 'pdfkit' {
  interface PDFDocument {
    on(event: 'data', listener: (chunk: Buffer) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
  }
}

/**
 * 見積書をPDF形式で生成
 */
export async function generatePdf(estimate: Estimate): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // ヘッダー
      doc.fontSize(20).text('見積書', { align: 'center' });
      doc.moveDown();

      // 基本情報
      doc.fontSize(14).text('基本情報', { underline: true });
      doc.fontSize(10);
      doc.text(`見積番号: ${estimate.projectInfo.estimateNumber}`);
      doc.text(`客先: ${estimate.projectInfo.customer}`);
      doc.text(`向先: ${estimate.projectInfo.deliveryDestination}`);
      doc.text(`機器名: ${estimate.projectInfo.equipmentName}`);
      doc.text(`製作数量: ${estimate.projectInfo.productionQuantity} ${estimate.projectInfo.productionUnit}`);
      doc.text(`納期: ${new Date(estimate.projectInfo.deliveryDate).toLocaleDateString('ja-JP')}`);
      doc.text(`機種: ${estimate.projectInfo.model}`);
      doc.text(`機器形状: ${estimate.projectInfo.equipmentShape}`);
      doc.text(`重量: ${estimate.projectInfo.weight} kg`);
      doc.moveDown();

      // 原価明細テーブル
      if (estimate.tableData && estimate.tableData.length > 0) {
        doc.fontSize(14).text('原価明細', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(8);

        // テーブルヘッダー
        const startY = doc.y;
        let currentY = startY;
        const rowHeight = 20;
        const colWidths = [60, 80, 50, 50, 40, 50, 60, 60, 60];
        const headers = ['型式', '名称', 'Part Type', '材質', '数量', '重量', '単価', '価格', '自動'];

        // ヘッダー行
        let x = 50;
        headers.forEach((header, i) => {
          doc.rect(x, currentY, colWidths[i], rowHeight).stroke();
          doc.text(header, x + 5, currentY + 5, { width: colWidths[i] - 10, align: 'left' });
          x += colWidths[i];
        });
        currentY += rowHeight;

        // データ行
        estimate.tableData.forEach((row) => {
          if (currentY > 700) {
            // ページを追加
            doc.addPage();
            currentY = 50;
          }

          x = 50;
          const rowData = [
            row.modelNumber,
            row.name,
            row.partType,
            row.material,
            row.quantity.toString(),
            row.weight.toFixed(2),
            row.unitPrice.toLocaleString(),
            row.price.toLocaleString(),
            row.isAuto ? '✓' : '',
          ];

          rowData.forEach((cell, i) => {
            doc.rect(x, currentY, colWidths[i], rowHeight).stroke();
            doc.text(cell, x + 5, currentY + 5, { width: colWidths[i] - 10, align: 'left' });
            x += colWidths[i];
          });

          currentY += rowHeight;
        });

        doc.moveDown();
      }

      // 原価計算
      if (estimate.costCalculation) {
        doc.fontSize(14).text('原価計算', { underline: true });
        doc.fontSize(10);
        doc.text(`材料費: ${estimate.costCalculation.materialCost.toLocaleString()} 円`);
        doc.text(`加工費: ${estimate.costCalculation.processingCost.toLocaleString()} 円`);
        doc.text(`塗装費: ${estimate.costCalculation.paintingCost.toLocaleString()} 円`);
        doc.text(`外注検査費: ${estimate.costCalculation.externalInspectionCost.toLocaleString()} 円`);
        doc.text(`輸送費: ${estimate.costCalculation.transportationCost.toLocaleString()} 円`);
        doc.text(`工場検査費: ${estimate.costCalculation.factoryInspectionCost.toLocaleString()} 円`);
        doc.text(`設計費: ${estimate.costCalculation.designCost.toLocaleString()} 円`);
        doc.moveDown();
        doc.fontSize(12).text(`総原価: ${estimate.costCalculation.totalCost.toLocaleString()} 円`, { align: 'right' });
        doc.moveDown();
      }

      // 備考
      if (estimate.remarksData && estimate.remarksData.remarks.length > 0) {
        doc.fontSize(14).text('備考', { underline: true });
        doc.fontSize(10);
        estimate.remarksData.remarks.forEach((remark, index) => {
          if (remark) {
            doc.text(`備考${index + 1}: ${remark}`);
          }
        });
        doc.moveDown();
      }

      // 査印欄
      if (estimate.approvalInfo) {
        doc.fontSize(14).text('査印欄', { underline: true });
        doc.fontSize(10);
        doc.text(`査定者: ${estimate.approvalInfo.assessor}`);
        doc.text(`査定日: ${new Date(estimate.approvalInfo.assessmentDate).toLocaleDateString('ja-JP')}`);
        doc.text(`承認者: ${estimate.approvalInfo.approver}`);
        doc.text(`承認日: ${new Date(estimate.approvalInfo.approvalDate).toLocaleDateString('ja-JP')}`);
        doc.moveDown();
      }

      // フッター
      doc.fontSize(8).text(
        `作成日: ${new Date(estimate.createdAt).toLocaleDateString('ja-JP')} | 更新日: ${new Date(estimate.updatedAt).toLocaleDateString('ja-JP')}`,
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

