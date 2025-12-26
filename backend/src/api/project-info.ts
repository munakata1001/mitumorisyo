import express, { Router, Request, Response } from 'express';
import { validateProjectInfo, normalizeProjectInfo } from '../services/projectInfoService';

const router: Router = express.Router();

// POST: 基本情報の保存
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    
    // データの正規化
    const projectInfo = normalizeProjectInfo(body);
    
    // バリデーション
    const validation = validateProjectInfo(projectInfo);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
        message: 'バリデーションエラーがあります',
      });
    }

    // 成功レスポンス
    // 実際の実装では、ここでデータベースに保存する処理を追加
    return res.status(200).json({
      success: true,
      data: projectInfo,
      message: '基本情報が正常に保存されました',
    });
  } catch (error) {
    console.error('Error in POST /api/project-info:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET: 基本情報の取得
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estimateNumber } = req.query;

    // パラメータチェック
    if (!id && !estimateNumber) {
      return res.status(400).json({
        success: false,
        message: 'IDまたは見積番号が必要です',
      });
    }

    // 実際の実装では、ここでデータベースから取得する処理を追加
    // 現時点では、空のデータを返す
    return res.status(404).json({
      success: true,
      data: null,
      message: 'データが見つかりませんでした',
    });
  } catch (error) {
    console.error('Error in GET /api/project-info:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT: 基本情報の更新
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectInfoData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'IDが必要です',
      });
    }

    // データの正規化
    const projectInfo = normalizeProjectInfo(projectInfoData);
    
    // バリデーション
    const validation = validateProjectInfo(projectInfo);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
        message: 'バリデーションエラーがあります',
      });
    }

    // 実際の実装では、ここでデータベースを更新する処理を追加
    return res.status(200).json({
      success: true,
      data: { id, ...projectInfo },
      message: '基本情報が正常に更新されました',
    });
  } catch (error) {
    console.error('Error in PUT /api/project-info:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

