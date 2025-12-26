import express, { Router, Request, Response } from 'express';
import {
  getCostCalculation,
  updateCostCalculation,
  getEstimate,
  getTableData,
} from '../services/estimateService';
import { calculateCost } from '../services/costCalculator';
import { validateCostCalculation } from '../utils/costCalculationValidator';
import type { CostCalculation } from '../models/Estimate';

const router: Router = express.Router();

/**
 * GET: 見積書の原価計算データを取得
 */
router.get('/:estimateId', (req: Request, res: Response) => {
  try {
    const { estimateId } = req.params;
    const costCalculation = getCostCalculation(estimateId);

    if (costCalculation === null) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    return res.status(200).json({
      success: true,
      data: costCalculation,
    });
  } catch (error) {
    console.error('Error in GET /api/cost-calculation/:estimateId:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT: 見積書の原価計算データを更新（手動入力項目の更新）
 */
router.put('/:estimateId', (req: Request, res: Response) => {
  try {
    const { estimateId } = req.params;
    const updateData = req.body as Partial<CostCalculation>;

    // バリデーション
    const validation = validateCostCalculation(updateData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'バリデーションエラー',
        errors: validation.errors,
      });
    }

    // 見積書が存在するか確認
    const estimate = getEstimate(estimateId);
    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    // 原価計算データを更新（手動入力項目のみ）
    // 自動計算項目は更新しない（計算APIで更新される）
    const updatedCostCalculation = updateCostCalculation(estimateId, updateData);

    if (updatedCostCalculation === null) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedCostCalculation,
      message: '原価計算データを更新しました',
    });
  } catch (error) {
    console.error('Error in PUT /api/cost-calculation/:estimateId:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST: 見積書の原価計算を実行（自動計算項目を再計算）
 */
router.post('/:estimateId/recalculate', async (req: Request, res: Response) => {
  try {
    const { estimateId } = req.params;

    // 見積書が存在するか確認
    const estimate = getEstimate(estimateId);
    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    // テーブルデータを取得
    const tableData = getTableData(estimateId);
    if (tableData === null) {
      return res.status(404).json({
        success: false,
        message: 'テーブルデータが見つかりません',
      });
    }

    // 現在の原価計算データを取得
    const currentCostCalculation = getCostCalculation(estimateId);
    if (currentCostCalculation === null) {
      return res.status(404).json({
        success: false,
        message: '原価計算データが見つかりません',
      });
    }

    // 原価計算を実行（自動計算項目を計算）
    const recalculatedCostCalculation = calculateCost(
      tableData,
      currentCostCalculation
    );

    // 計算結果を保存
    const updatedCostCalculation = updateCostCalculation(
      estimateId,
      recalculatedCostCalculation
    );

    if (updatedCostCalculation === null) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedCostCalculation,
      message: '原価計算を実行しました',
    });
  } catch (error) {
    console.error('Error in POST /api/cost-calculation/:estimateId/recalculate:', error);
    return res.status(500).json({
      success: false,
      message: '原価計算に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

