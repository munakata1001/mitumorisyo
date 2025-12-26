import type { DimensionData } from '../models/EstimateTableRow';

// 材質別の密度（kg/m³）
const MATERIAL_DENSITY: Record<string, number> = {
  'SUS304': 7930,
  'SUS316': 8000,
  '炭素鋼': 7850,
  'アルミ': 2700,
  'アルミニウム': 2700,
};

/**
 * 重量を計算する
 * @param dimensions 寸法データ
 * @param material 材質
 * @param partType Part Type
 * @returns 重量（kg）
 */
export function calculateWeight(
  dimensions: DimensionData,
  material: string,
  partType: string
): number {
  const density = MATERIAL_DENSITY[material] || 7850; // デフォルト: 炭素鋼

  switch (partType) {
    case '板金':
      if (dimensions.length && dimensions.width && dimensions.thickness) {
        // 体積 = 長さ × 幅 × 厚さ（mm³ → m³）
        const volume = (dimensions.length * dimensions.width * dimensions.thickness) / 1000000000;
        return volume * density;
      }
      break;

    case '円筒':
      if (dimensions.diameter && dimensions.height) {
        // 体積 = π × (直径/2)² × 高さ（mm³ → m³）
        const radius = dimensions.diameter / 2;
        const volume = (Math.PI * radius * radius * dimensions.height) / 1000000000;
        return volume * density;
      }
      break;

    default:
      // その他のPart Typeは0を返す（手動入力）
      return 0;
  }

  return 0;
}

