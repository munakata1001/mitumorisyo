import express, { Router, Request, Response } from 'express';
import {
  getTableData,
  updateTableData,
  addTableRow,
  updateTableRow,
  deleteTableRow,
  getEstimate,
} from '../services/estimateService';
import type { EstimateTableRow } from '../models/EstimateTableRow';

const router: Router = express.Router();

/**
 * GET: 見積書の原価明細を取得
 */
router.get('/:estimateId', (req: Request, res: Response) => {
  try {
    const { estimateId } = req.params;
    const tableData = getTableData(estimateId);

    if (tableData === null) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    return res.status(200).json({
      success: true,
      data: tableData,
      count: tableData.length,
    });
  } catch (error) {
    console.error('Error in GET /api/table-data/:estimateId:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT: 見積書の原価明細を更新
 */
router.put('/:estimateId', (req: Request, res: Response) => {
  try {
    const { estimateId } = req.params;
    const tableData = req.body as EstimateTableRow[];

    // バリデーション
    if (!Array.isArray(tableData)) {
      return res.status(400).json({
        success: false,
        message: 'テーブルデータは配列である必要があります',
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

    // 原価明細を更新
    const updatedTableData = updateTableData(estimateId, tableData);

    if (updatedTableData === null) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedTableData,
      message: '原価明細を更新しました',
    });
  } catch (error) {
    console.error('Error in PUT /api/table-data/:estimateId:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST: 原価明細に行を追加
 */
router.post('/:estimateId/rows', (req: Request, res: Response) => {
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

    // 行を追加
    const newRow = addTableRow(estimateId);

    if (newRow === null) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    return res.status(201).json({
      success: true,
      data: newRow,
      message: '行を追加しました',
    });
  } catch (error) {
    console.error('Error in POST /api/table-data/:estimateId/rows:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT: 原価明細の行を更新
 */
router.put('/:estimateId/rows/:rowId', (req: Request, res: Response) => {
  try {
    const { estimateId, rowId } = req.params;
    const updateData = req.body as Partial<EstimateTableRow>;

    // 見積書が存在するか確認
    const estimate = getEstimate(estimateId);
    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    // 行を更新
    const updatedRow = updateTableRow(estimateId, rowId, updateData);

    if (updatedRow === null) {
      return res.status(404).json({
        success: false,
        message: '行が見つかりません',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedRow,
      message: '行を更新しました',
    });
  } catch (error) {
    console.error('Error in PUT /api/table-data/:estimateId/rows/:rowId:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE: 原価明細の行を削除
 */
router.delete('/:estimateId/rows/:rowId', (req: Request, res: Response) => {
  try {
    const { estimateId, rowId } = req.params;

    // 見積書が存在するか確認
    const estimate = getEstimate(estimateId);
    if (!estimate) {
      return res.status(404).json({
        success: false,
        message: '見積書が見つかりません',
      });
    }

    // 行を削除
    const deleted = deleteTableRow(estimateId, rowId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '行が見つかりません',
      });
    }

    return res.status(200).json({
      success: true,
      message: '行を削除しました',
    });
  } catch (error) {
    console.error('Error in DELETE /api/table-data/:estimateId/rows/:rowId:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

