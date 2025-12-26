// 型定義（フロントエンドと同じ型を使用）
export interface ProjectInfo {
  estimateNumber: string;
  customer: string;
  deliveryDestination: string;
  equipmentName: string;
  productionQuantity: number;
  productionUnit: '台' | '個' | '式';
  deliveryDate: Date;
  model: string;
  equipmentShape: string;
  weight: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof ProjectInfo, string>>;
}

/**
 * 基本情報のバリデーション
 */
export function validateProjectInfo(data: any): ValidationResult {
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

/**
 * データを正規化する
 */
export function normalizeProjectInfo(data: any): ProjectInfo {
  return {
    estimateNumber: String(data.estimateNumber || '').trim(),
    customer: String(data.customer || '').trim(),
    deliveryDestination: String(data.deliveryDestination || '').trim(),
    equipmentName: String(data.equipmentName || '').trim(),
    productionQuantity: Number(data.productionQuantity) || 0,
    productionUnit: data.productionUnit || '台',
    deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : new Date(),
    model: String(data.model || '').trim(),
    equipmentShape: String(data.equipmentShape || '').trim(),
    weight: Number(data.weight) || 0,
  };
}

