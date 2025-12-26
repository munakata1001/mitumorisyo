import { NextRequest, NextResponse } from 'next/server';
// import type { ProjectInfo } from '@/types/estimate'; // 型定義が見つからないエラーのため一時的にコメントアウト

// 一時的なProjectInfo型の定義（本来は types/estimate からインポートすること）
type ProjectInfo = {
  estimateNumber: string;
  customer: string;
  deliveryDestination: string;
  equipmentName: string;
  productionQuantity: number;
  productionUnit: '台' | '個' | '式';
  deliveryDate: Date | string;
  model: string;
  equipmentShape: string;
  weight: number;
};

// バリデーション関数
function validateProjectInfo(data: any): { isValid: boolean; errors: Partial<Record<keyof ProjectInfo, string>> } {
  const errors: Partial<Record<keyof ProjectInfo, string>> = {};

  // 見積番号のバリデーション
  if (!data.estimateNumber || typeof data.estimateNumber !== 'string' || data.estimateNumber.trim() === '') {
    errors.estimateNumber = '見積番号は必須です';
  }

  // 客先のバリデーション
  if (!data.customer || typeof data.customer !== 'string' || data.customer.trim() === '') {
    errors.customer = '客先は必須です';
  }

  // 向先のバリデーション
  if (!data.deliveryDestination || typeof data.deliveryDestination !== 'string' || data.deliveryDestination.trim() === '') {
    errors.deliveryDestination = '向先は必須です';
  }

  // 機器名のバリデーション
  if (!data.equipmentName || typeof data.equipmentName !== 'string' || data.equipmentName.trim() === '') {
    errors.equipmentName = '機器名は必須です';
  }

  // 製作数量のバリデーション
  if (typeof data.productionQuantity !== 'number' || data.productionQuantity < 0) {
    errors.productionQuantity = '製作数量は0以上の数値で入力してください';
  }

  // 単位のバリデーション
  if (!data.productionUnit || !['台', '個', '式'].includes(data.productionUnit)) {
    errors.productionUnit = '単位を選択してください';
  }

  // 納期のバリデーション
  if (!data.deliveryDate) {
    errors.deliveryDate = '納期は必須です';
  } else {
    const deliveryDate = new Date(data.deliveryDate);
    if (isNaN(deliveryDate.getTime())) {
      errors.deliveryDate = '有効な日付を入力してください';
    }
  }

  // 機種のバリデーション
  if (!data.model || typeof data.model !== 'string' || data.model.trim() === '') {
    errors.model = '機種は必須です';
  }

  // 機器形状のバリデーション
  if (!data.equipmentShape || typeof data.equipmentShape !== 'string' || data.equipmentShape.trim() === '') {
    errors.equipmentShape = '機器形状は必須です';
  }

  // 重量のバリデーション
  if (typeof data.weight !== 'number' || data.weight < 0) {
    errors.weight = '重量は0以上の数値で入力してください';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// データを正規化する関数
function normalizeProjectInfo(data: any): ProjectInfo {
  return {
    estimateNumber: String(data.estimateNumber || '').trim(),
    customer: String(data.customer || '').trim(),
    deliveryDestination: String(data.deliveryDestination || '').trim(),
    equipmentName: String(data.equipmentName || '').trim(),
    productionQuantity: Number(data.productionQuantity) || 0,
    productionUnit: (data.productionUnit || '台') as '台' | '個' | '式',
    deliveryDate: data.deliveryDate ? (typeof data.deliveryDate === 'string' ? data.deliveryDate : new Date(data.deliveryDate).toISOString()) : new Date().toISOString(),
    model: String(data.model || '').trim(),
    equipmentShape: String(data.equipmentShape || '').trim(),
    weight: Number(data.weight) || 0,
  };
}

// POST: 基本情報の保存
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // データの正規化
    const projectInfo = normalizeProjectInfo(body);
    
    // バリデーション
    const validation = validateProjectInfo(projectInfo);
    
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors,
          message: 'バリデーションエラーがあります',
        },
        { status: 400 }
      );
    }

    // 成功レスポンス
    // 実際の実装では、ここでデータベースに保存する処理を追加
    return NextResponse.json(
      {
        success: true,
        data: projectInfo,
        message: '基本情報が正常に保存されました',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/project-info:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET: 基本情報の取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const estimateNumber = searchParams.get('estimateNumber');

    // パラメータチェック
    if (!id && !estimateNumber) {
      return NextResponse.json(
        {
          success: false,
          message: 'IDまたは見積番号が必要です',
        },
        { status: 400 }
      );
    }

    // 実際の実装では、ここでデータベースから取得する処理を追加
    // 現時点では、空のデータを返す
    return NextResponse.json(
      {
        success: true,
        data: null,
        message: 'データが見つかりませんでした',
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error in GET /api/project-info:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT: 基本情報の更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...projectInfoData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'IDが必要です',
        },
        { status: 400 }
      );
    }

    // データの正規化
    const projectInfo = normalizeProjectInfo(projectInfoData);
    
    // バリデーション
    const validation = validateProjectInfo(projectInfo);
    
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors,
          message: 'バリデーションエラーがあります',
        },
        { status: 400 }
      );
    }

    // 実際の実装では、ここでデータベースを更新する処理を追加
    return NextResponse.json(
      {
        success: true,
        data: { id, ...projectInfo },
        message: '基本情報が正常に更新されました',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/project-info:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'サーバーエラーが発生しました',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

