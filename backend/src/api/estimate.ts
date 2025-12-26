import express, { Router, Request, Response } from 'express';
import {
  saveEstimate,
  getEstimate,
  findEstimateByNumber,
  getAllEstimates,
  deleteEstimate,
} from '../services/estimateService';
import type { Estimate } from '../models/Estimate';

const router: Router = express.Router();

// POST: 見積書を保存
router.post('/', (req: Request, res: Response) => {
  try {
    const estimateData = req.body as Estimate;

    // バリデーション
    if (!estimateData.projectInfo || !estimateData.projectInfo.estimateNumber) {
      return res.status(400).json({
        success: false,
        message: '見積番号は必須です',
      });
    }

    // 見積書を保存
    const savedEstimate = saveEstimate(estimateData);

    return res.status(200).json({
      success: true,
      data: savedEstimate,
      message: '見積書を保存しました',
    });
  } catch (error) {
    console.error('Error in POST /api/estimate:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET: 見積書を取得（ID指定）
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const estimate = getEstimate(id);

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    return res.status(200).json({
      success: true,
      data: estimate,
    });
  } catch (error) {
    console.error('Error in GET /api/estimate/:id:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET: 見積番号で検索
router.get('/search/:estimateNumber', (req: Request, res: Response) => {
  try {
    const { estimateNumber } = req.params;
    const estimate = findEstimateByNumber(estimateNumber);

    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    return res.status(200).json({
      success: true,
      data: estimate,
    });
  } catch (error) {
    console.error('Error in GET /api/estimate/search/:estimateNumber:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET: すべての見積書を取得
router.get('/', (req: Request, res: Response) => {
  try {
    const estimates = getAllEstimates();

    return res.status(200).json({
      success: true,
      data: estimates,
      count: estimates.length,
    });
  } catch (error) {
    console.error('Error in GET /api/estimate:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE: 見積書を削除
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = deleteEstimate(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    return res.status(200).json({
      success: true,
      message: '見積書を削除しました',
    });
  } catch (error) {
    console.error('Error in DELETE /api/estimate/:id:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

