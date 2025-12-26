import express, { Router, Request, Response } from 'express';
import { recalculateEverything } from '../services/costCalculator';
import type { EstimateTableRow } from '../models/EstimateTableRow';
import type { CostCalculation } from '../models/Estimate';

const router: Router = express.Router();

interface CalculateRequest {
  tableData: EstimateTableRow[];
  costCalculation?: Partial<CostCalculation>;
}

/**
 * POST: 原価計算を実行
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { tableData, costCalculation = {} } = req.body as CalculateRequest;

    // バリデーション
    if (!tableData || !Array.isArray(tableData)) {
      return res.status(400).json({
        success: false,
        message: 'テーブルデータが必要です',
      });
    }

    // 原価計算を実行
    const result = recalculateEverything(tableData, costCalculation);

    return res.status(200).json({
      success: true,
      data: result,
      message: '原価計算が完了しました',
    });
  } catch (error) {
    console.error('Error in POST /api/calculation:', error);
    return res.status(500).json({
      success: false,
      message: '原価計算に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

