import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import { validateFiles } from '../utils/fileValidator';
import { parseExcelFile } from '../services/excelParser';
import { parsePdfFile } from '../services/pdfParser';
import { mergeFileResults, applyPriceReference } from '../services/fileMerger';
import type { ParseMode, EstimateTableRow } from '../models/EstimateTableRow';

const router: Router = express.Router();

// multer設定（メモリストレージ）
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xlsm', '.xls', '.pdf'];
    const extension = file.originalname.toLowerCase().substring(
      file.originalname.lastIndexOf('.')
    );
    
    if (allowedTypes.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error(`対応していないファイル形式です: ${extension}`));
    }
  },
});

// POST: ファイルアップロードと解析
router.post('/', upload.array('files', 3), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { parseMode } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ファイルがアップロードされていません',
      });
    }

    // ファイル検証
    const validation = validateFiles(
      files.map(f => ({ name: f.originalname, size: f.size })),
      3
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'ファイル検証エラー',
        errors: validation.errors,
      });
    }

    // 解析モードに応じたファイル数チェック
    const mode = parseMode as ParseMode || '個別解析';
    
    if (mode === '2ファイル統合' && files.length !== 2) {
      return res.status(400).json({
        success: false,
        message: '2ファイル統合モードでは2つのファイルが必要です',
      });
    }

    if (mode === '3ファイル統合' && files.length !== 3) {
      return res.status(400).json({
        success: false,
        message: '3ファイル統合モードでは3つのファイルが必要です',
      });
    }

    if (mode === '2ファイル+価格参考' && files.length !== 2) {
      return res.status(400).json({
        success: false,
        message: '2ファイル+価格参考モードでは2つのファイルが必要です',
      });
    }

    // ファイルを解析
    const parseResults: EstimateTableRow[][] = [];

    for (const file of files) {
      const extension = file.originalname.toLowerCase().substring(
        file.originalname.lastIndexOf('.')
      );

      let rows: EstimateTableRow[];

      try {
        if (extension === '.pdf') {
          rows = await parsePdfFile(file.buffer);
        } else {
          rows = await parseExcelFile(file.buffer);
        }

        parseResults.push(rows);
      } catch (error) {
        console.error(`ファイル ${file.originalname} の解析エラー:`, error);
        return res.status(500).json({
          success: false,
          message: `ファイル ${file.originalname} の解析に失敗しました`,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // 解析モードに応じて結果を統合
    let result: EstimateTableRow[];

    if (mode === '個別解析') {
      // 単一ファイルの場合はそのまま返す
      result = parseResults[0] || [];
    } else if (mode === '2ファイル統合' || mode === '3ファイル統合') {
      result = mergeFileResults(parseResults, mode);
    } else if (mode === '2ファイル+価格参考') {
      // 最初のファイルをメインデータ、2番目のファイルを価格参考として使用
      const mainData = mergeFileResults([parseResults[0]], '2ファイル統合');
      result = applyPriceReference(mainData, parseResults[1] || []);
    } else {
      result = parseResults[0] || [];
    }

    // 成功レスポンス
    return res.status(200).json({
      success: true,
      data: result,
      message: `${files.length}個のファイルの解析が完了しました`,
      parsedCount: result.length,
    });
  } catch (error) {
    console.error('Error in POST /api/file-upload:', error);
    return res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

