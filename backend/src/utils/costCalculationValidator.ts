/**
 * 原価計算データのバリデーション
 */
import type { CostCalculation } from '../models/Estimate';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 原価計算データをバリデーション
 */
export function validateCostCalculation(
  costCalculation: Partial<CostCalculation>
): ValidationResult {
  const errors: string[] = [];

  // 手動入力項目のバリデーション（必須、数値、0以上）
  if (costCalculation.externalInspectionCost !== undefined) {
    if (typeof costCalculation.externalInspectionCost !== 'number') {
      errors.push('外注検査費は数値である必要があります');
    } else if (costCalculation.externalInspectionCost < 0) {
      errors.push('外注検査費は0以上である必要があります');
    }
  }

  if (costCalculation.transportationCost !== undefined) {
    if (typeof costCalculation.transportationCost !== 'number') {
      errors.push('輸送費は数値である必要があります');
    } else if (costCalculation.transportationCost < 0) {
      errors.push('輸送費は0以上である必要があります');
    }
  }

  if (costCalculation.factoryInspectionCost !== undefined) {
    if (typeof costCalculation.factoryInspectionCost !== 'number') {
      errors.push('工場検査費は数値である必要があります');
    } else if (costCalculation.factoryInspectionCost < 0) {
      errors.push('工場検査費は0以上である必要があります');
    }
  }

  if (costCalculation.designCost !== undefined) {
    if (typeof costCalculation.designCost !== 'number') {
      errors.push('設計費は数値である必要があります');
    } else if (costCalculation.designCost < 0) {
      errors.push('設計費は0以上である必要があります');
    }
  }

  // 自動計算項目も数値であることを確認（任意）
  const autoFields: Array<keyof CostCalculation> = [
    'materialCost',
    'processingCost',
    'paintingCost',
    'directCost',
    'manufacturingCost',
    'totalCost',
    'paintingArea',
  ];

  autoFields.forEach((field) => {
    if (costCalculation[field] !== undefined) {
      if (typeof costCalculation[field] !== 'number') {
        errors.push(`${field}は数値である必要があります`);
      } else if (costCalculation[field]! < 0) {
        errors.push(`${field}は0以上である必要があります`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

