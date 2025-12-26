import express, { Router, Request, Response } from 'express';
import { generatePdf } from '../services/pdfGenerator';
import { generateExcel } from '../services/excelGenerator';
import { getEstimate } from '../services/estimateService';
import type { Estimate } from '../models/Estimate';

const router: Router = express.Router();

// POST: PDF出力
router.post('/pdf', async (req: Request, res: Response) => {
  try {
    const estimateData = req.body as Estimate;

    // バリデーション
    if (!estimateData.projectInfo || !estimateData.projectInfo.estimateNumber) {
      return res.status(400).json({
        success: false,
        message: '見積番号は必須です',
      });
    }

    // PDFを生成
    const pdfBuffer = await generatePdf(estimateData);

    // ファイル名を生成
    const fileName = `見積書_${estimateData.projectInfo.estimateNumber}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;

    // レスポンスヘッダーを設定
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());

    // PDFを送信
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error in POST /api/export/pdf:', error);
    return res.status(500).json({
      success: false,
      message: 'PDF出力に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST: Excel出力
router.post('/excel', async (req: Request, res: Response) => {
  try {
    const estimateData = req.body as Estimate;

    // バリデーション
    if (!estimateData.projectInfo || !estimateData.projectInfo.estimateNumber) {
      return res.status(400).json({
        success: false,
        message: '見積番号は必須です',
      });
    }

    // Excelを生成
    const excelBuffer = await generateExcel(estimateData);

    // ファイル名を生成
    const fileName = `見積書_${estimateData.projectInfo.estimateNumber}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;

    // レスポンスヘッダーを設定
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Length', excelBuffer.length.toString());

    // Excelを送信
    return res.send(excelBuffer);
  } catch (error) {
    console.error('Error in POST /api/export/excel:', error);
    return res.status(500).json({
      success: false,
      message: 'Excel出力に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET: 保存済み見積書のPDF出力（ID指定）
router.get('/pdf/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const estimate = getEstimate(id);

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    // PDFを生成
    const pdfBuffer = await generatePdf(estimate);

    // ファイル名を生成
    const fileName = `見積書_${estimate.projectInfo.estimateNumber}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;

    // レスポンスヘッダーを設定
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());

    // PDFを送信
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error in GET /api/export/pdf/:id:', error);
    return res.status(500).json({
      success: false,
      message: 'PDF出力に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET: 保存済み見積書のExcel出力（ID指定）
router.get('/excel/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const estimate = getEstimate(id);

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    // Excelを生成
    const excelBuffer = await generateExcel(estimate);

    // ファイル名を生成
    const fileName = `見積書_${estimate.projectInfo.estimateNumber}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;

    // レスポンスヘッダーを設定
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Length', excelBuffer.length.toString());

    // Excelを送信
    return res.send(excelBuffer);
  } catch (error) {
    console.error('Error in GET /api/export/excel/:id:', error);
    return res.status(500).json({
      success: false,
      message: 'Excel出力に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

