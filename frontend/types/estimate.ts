export interface ProjectInfo {
  estimateNumber: string;        // 見積番号
  customer: string;               // 客先
  deliveryDestination: string;   // 向先
  equipmentName: string;         // 機器名
  productionQuantity: number;     // 製作数量
  productionUnit: '台' | '個' | '式'; // 単位
  deliveryDate: Date;            // 納期
  model: string;                 // 機種
  equipmentShape: string;        // 機器形状
  weight: number;                // 重量（kg）
}

export interface DimensionData {
  partType: string;
  length?: number;               // 長さ（mm）
  width?: number;                // 幅（mm）
  height?: number;               // 高さ（mm）
  thickness?: number;            // 厚さ（mm）
  diameter?: number;             // 直径（mm）
  radius?: number;               // 半径（mm）
  custom?: string;              // カスタム寸法（テキスト）
  [key: string]: any;           // その他の寸法データ
}

export interface EstimateTableRow {
  id: string;                    // 行ID（UUID）
  modelNumber: string;            // 型式
  name: string;                  // 名称
  partType: string;              // Part Type
  material: string;              // 材質
  dimensions: DimensionData;     // 寸法情報
  quantity: number;              // 数量
  weight: number;                // 重量（自動計算、kg）
  unitPrice: number;             // 単価（円）
  price: number;                 // 価格（自動計算、円）
  isAuto: boolean;               // 自動計算フラグ
  isAutoInput: boolean;          // 自動入力行フラグ
  isTemplateDiff: boolean;       // テンプレート差分フラグ
  createdAt?: Date;              // 作成日時
  updatedAt?: Date;              // 更新日時
}

export interface CostCalculation {
  // 自動計算項目
  materialCost: number;          // 材料費（円）
  processingCost: number;        // 加工費（円）
  paintingCost: number;         // 塗装費（円）
  
  // 手動入力項目
  externalInspectionCost: number; // 外注検査費（円）
  transportationCost: number;    // 輸送費（円）
  factoryInspectionCost: number;  // 工場検査費（円）
  designCost: number;            // 設計費（円）
  
  // 原価サマリー（自動計算）
  directCost: number;           // 直接原価（円）
  manufacturingCost: number;     // 製造原価（円）
  totalCost: number;            // 総原価（円）
  
  // その他
  paintingArea: number;         // 塗装面積（m²）
}

export interface RemarksData {
  remarks: string[]; // 備考（3行、最大40文字/行）
  materialCostNotes: string[]; // 材料費補足（2行、最大60文字/行）
  internalProcessingNotes: string[]; // 内作加工費補足（2行、最大60文字/行）
  externalProcessingNotes: string[]; // 外注加工等補足（2行、最大60文字/行）
}

export interface ApprovalInfo {
  assessor: string;             // 査定者
  assessmentDate: Date;         // 査定日
  approver: string;             // 承認者
  approvalDate: Date;          // 承認日
  finalApprover: string;       // 最終承認者
  seal1: string;               // 査印1
  seal2: string;               // 査印2
  seal3: string;               // 査印3
  seal4: string;               // 査印4
  personInCharge: string;      // 担当者
}