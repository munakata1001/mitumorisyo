import type { ProjectInfo, EstimateTableRow, CostCalculation, RemarksData, ApprovalInfo } from '@/types/estimate';

export interface Estimate {
  id: string;
  projectInfo: ProjectInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  projectInfo?: ProjectInfo;
  tableData?: EstimateTableRow[];
  costCalculation?: CostCalculation;
  remarksData?: RemarksData;
  approvalInfo?: ApprovalInfo;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEYS = {
  ESTIMATES: 'estimates',
  TEMPLATES: 'templates',
};

// 見積書データの保存
export function saveEstimate(estimate: Estimate): void {
  const estimates = getEstimates();
  const index = estimates.findIndex((e) => e.id === estimate.id);
  
  if (index >= 0) {
    estimates[index] = estimate;
  } else {
    estimates.push(estimate);
  }
  
  localStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(estimates));
}

// 見積書データの取得
export function getEstimates(): Estimate[] {
  const data = localStorage.getItem(STORAGE_KEYS.ESTIMATES);
  if (!data) return [];
  
  const estimates = JSON.parse(data);
  return estimates.map((e: any) => ({
    ...e,
    createdAt: new Date(e.createdAt),
    updatedAt: new Date(e.updatedAt),
    projectInfo: {
      ...e.projectInfo,
      deliveryDate: new Date(e.projectInfo.deliveryDate),
    },
  }));
}

// 見積書データの取得（ID指定）
export function getEstimate(id: string): Estimate | null {
  const estimates = getEstimates();
  return estimates.find((e) => e.id === id) || null;
}

// 見積書データの削除
export function deleteEstimate(id: string): void {
  const estimates = getEstimates();
  const filtered = estimates.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(filtered));
}

// 見積書データの検索
export function searchEstimates(query: string): Estimate[] {
  const estimates = getEstimates();
  const lowerQuery = query.toLowerCase();
  
  return estimates.filter((estimate) => {
    const info = estimate.projectInfo;
    return (
      info.estimateNumber.toLowerCase().includes(lowerQuery) ||
      info.customer.toLowerCase().includes(lowerQuery) ||
      info.equipmentName.toLowerCase().includes(lowerQuery) ||
      info.model.toLowerCase().includes(lowerQuery)
    );
  });
}

// テンプレートの保存
export function saveTemplate(template: Template): void {
  const templates = getTemplates();
  const index = templates.findIndex((t) => t.id === template.id);
  
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }
  
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
}

// テンプレートの取得
export function getTemplates(): Template[] {
  const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  if (!data) return [];
  
  const templates = JSON.parse(data);
  return templates.map((t: any) => ({
    ...t,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
    projectInfo: {
      ...t.projectInfo,
      deliveryDate: new Date(t.projectInfo.deliveryDate),
    },
  }));
}

// テンプレートの取得（ID指定）
export function getTemplate(id: string): Template | null {
  const templates = getTemplates();
  return templates.find((t) => t.id === id) || null;
}

// テンプレートの削除
export function deleteTemplate(id: string): void {
  const templates = getTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
}

