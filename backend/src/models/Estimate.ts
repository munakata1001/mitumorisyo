// 見積書データの型定義
import type { EstimateTableRow } from './EstimateTableRow';

export interface ProjectInfo {
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
}

export interface CostCalculation {
  materialCost: number;
  processingCost: number;
  paintingCost: number;
  externalInspectionCost: number;
  transportationCost: number;
  factoryInspectionCost: number;
  designCost: number;
  directCost: number;
  manufacturingCost: number;
  totalCost: number;
  paintingArea: number;
}

export interface ApprovalInfo {
  assessor: string;
  assessmentDate: Date | string;
  approver: string;
  approvalDate: Date | string;
  finalApprover: string;
  seal1: string;
  seal2: string;
  seal3: string;
  seal4: string;
  personInCharge: string;
}

export interface RemarksData {
  remarks: string[];
  materialCostNotes: string[];
  internalProcessingNotes: string[];
  externalProcessingNotes: string[];
}

export interface Estimate {
  id: string;
  projectInfo: ProjectInfo;
  tableData: EstimateTableRow[];
  costCalculation: CostCalculation;
  remarksData: RemarksData;
  approvalInfo: ApprovalInfo;
  createdAt: Date | string;
  updatedAt: Date | string;
}

