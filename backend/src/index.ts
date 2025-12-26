import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ヘルスチェック
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API ルート
import projectInfoRouter from './api/project-info';
import fileUploadRouter from './api/file-upload';
import estimateRouter from './api/estimate';
import exportRouter from './api/export';
import calculationRouter from './api/calculation';
import tableDataRouter from './api/table-data';
import costCalculationRouter from './api/cost-calculation';

app.use('/api/project-info', projectInfoRouter);
app.use('/api/file-upload', fileUploadRouter);
app.use('/api/estimate', estimateRouter);
app.use('/api/export', exportRouter);
app.use('/api/calculation', calculationRouter);
app.use('/api/table-data', tableDataRouter);
app.use('/api/cost-calculation', costCalculationRouter);

// 404 ハンドラー
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

// エラーハンドラー
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

