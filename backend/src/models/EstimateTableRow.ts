// EstimateTableRow型定義
export interface DimensionData {
  partType: string;
  length?: number;
  width?: number;
  height?: number;
  thickness?: number;
  diameter?: number;
  radius?: number;
  custom?: string;
  [key: string]: any;
}

export interface EstimateTableRow {
  id: string;
  modelNumber: string;
  name: string;
  partType: string;
  material: string;
  dimensions: DimensionData;
  quantity: number;
  weight: number;
  unitPrice: number;
  price: number;
  autoDisplay: boolean;
  isAuto: boolean;
  isAutoInput: boolean;
  isTemplateDiff: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ParseMode = '個別解析' | '2ファイル統合' | '3ファイル統合' | '2ファイル+価格参考';

