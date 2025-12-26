'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { DatePicker } from '@/components/common/DatePicker';
import { calculateMaterialCost } from '@/lib/calculation/materialCost';
import { calculateProcessingCost } from '@/lib/calculation/processingCost';
import { calculatePaintingCost, calculatePaintingArea } from '@/lib/calculation/paintingCost';
import { calculateCostSummary } from '@/lib/calculation/costSummary';
import type { CostCalculation, EstimateTableRow, ApprovalInfo } from '@/types/estimate';

interface CostCalculationFormProps {
  costCalculation: CostCalculation;
  onChange: (calc: CostCalculation) => void;
  tableData: EstimateTableRow[];
  approvalInfo: ApprovalInfo;
  onApprovalChange: (info: ApprovalInfo) => void;
  errors?: {
    approval?: Partial<Record<keyof ApprovalInfo, string>>;
  };
  isDirty?: boolean;
  onSave?: () => void;
  onExportPdf?: () => void;
  onExportExcel?: () => void;
}

export const CostCalculationForm: React.FC<CostCalculationFormProps> = ({
  costCalculation,
  onChange,
  tableData,
  approvalInfo,
  onApprovalChange,
  errors = {},
  isDirty = false,
  onSave,
  onExportPdf,
  onExportExcel,
}) => {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // 材料費の自動計算
  const materialCost = useMemo(() => {
    return calculateMaterialCost(tableData);
  }, [tableData]);

  // 加工費の自動計算
  const processingCost = useMemo(() => {
    return calculateProcessingCost(tableData);
  }, [tableData]);

  // 塗装面積の自動計算
  const paintingArea = useMemo(() => {
    return calculatePaintingArea(tableData);
  }, [tableData]);

  // 塗装費の自動計算
  const paintingCost = useMemo(() => {
    return calculatePaintingCost(paintingArea);
  }, [paintingArea]);

  // 原価サマリーの自動計算
  const costSummary = useMemo(() => {
    const totalCost =
      materialCost +
      processingCost +
      paintingCost +
      costCalculation.externalInspectionCost +
      costCalculation.transportationCost +
      costCalculation.factoryInspectionCost +
      costCalculation.designCost;

    return {
      directCost: totalCost * 0.7,
      manufacturingCost: totalCost * 0.9,
      totalCost: totalCost,
    };
  }, [
    materialCost,
    processingCost,
    paintingCost,
    costCalculation.externalInspectionCost,
    costCalculation.transportationCost,
    costCalculation.factoryInspectionCost,
    costCalculation.designCost,
  ]);

  // 自動計算項目が変更されたら、costCalculationを更新
  useEffect(() => {
    const updated = {
      ...costCalculation,
      materialCost,
      processingCost,
      paintingCost,
      paintingArea,
      directCost: costSummary.directCost,
      manufacturingCost: costSummary.manufacturingCost,
      totalCost: costSummary.totalCost,
    };
    
    // 値が変更された場合のみ更新
    if (
      updated.materialCost !== costCalculation.materialCost ||
      updated.processingCost !== costCalculation.processingCost ||
      updated.paintingCost !== costCalculation.paintingCost ||
      updated.paintingArea !== costCalculation.paintingArea ||
      updated.directCost !== costCalculation.directCost ||
      updated.manufacturingCost !== costCalculation.manufacturingCost ||
      updated.totalCost !== costCalculation.totalCost
    ) {
      onChange(updated);
    }
  }, [materialCost, processingCost, paintingCost, paintingArea, costSummary.directCost, costSummary.manufacturingCost, costSummary.totalCost]);

  const handleManualInputChange = (field: keyof CostCalculation, value: number) => {
    onChange({
      ...costCalculation,
      [field]: value,
    });
  };

  // 再計算ボタンのハンドラー
  const handleRecalculate = () => {
    setIsRecalculating(true);
    // 強制的に再計算をトリガーするため、現在の値を再設定
    setTimeout(() => {
      onChange({
        ...costCalculation,
        materialCost,
        processingCost,
        paintingCost,
        paintingArea,
        directCost: costSummary.directCost,
        manufacturingCost: costSummary.manufacturingCost,
        totalCost: costSummary.totalCost,
      });
      setIsRecalculating(false);
    }, 300);
  };

  // 保存ボタンのハンドラー
  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave();
      // 成功メッセージは親コンポーネントで表示
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // PDF出力ボタンのハンドラー
  const handleExportPdf = async () => {
    if (!onExportPdf) return;
    if (!confirm('PDF形式で出力しますか？')) return;
    
    setIsExportingPdf(true);
    try {
      await onExportPdf();
    } catch (error) {
      console.error('PDF出力エラー:', error);
      alert('PDF出力に失敗しました');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Excel出力ボタンのハンドラー
  const handleExportExcel = async () => {
    if (!onExportExcel) return;
    if (!confirm('Excel形式で出力しますか？')) return;
    
    setIsExportingExcel(true);
    try {
      await onExportExcel();
    } catch (error) {
      console.error('Excel出力エラー:', error);
      alert('Excel出力に失敗しました');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // データ入力チェック（出力ボタンの有効/無効判定用）
  const hasData = tableData.length > 0 || costCalculation.totalCost > 0;

  // バリデーション関数
  const validateManualInput = (value: number, fieldName: string): string | undefined => {
    if (value === undefined || value === null || isNaN(value)) {
      return `${fieldName}は必須です`;
    }
    if (value < 0) {
      return '0以上の値を入力してください';
    }
    return undefined;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">原価計算</h2>
        <Button
          onClick={handleRecalculate}
          variant="outline"
          size="sm"
          disabled={isRecalculating}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          }
        >
          {isRecalculating ? '計算中...' : '再計算'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* 見積原価計算 */}
        <section className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-4">見積原価計算</h3>
          <div className="flex flex-row gap-4 flex-wrap">
            {/* 自動計算項目 */}
            <div className="flex-shrink-0" style={{ width: '180px' }}>
              <Input
                label="材料費"
                name="materialCost"
                type="number"
                value={materialCost}
                onChange={() => {}} // 読み取り専用
                disabled
                suffix="円"
                formatNumber
                helperText="テーブルデータの価格合計"
              />
            </div>
            <div className="flex-shrink-0" style={{ width: '180px' }}>
              <Input
                label="加工費"
                name="processingCost"
                type="number"
                value={processingCost}
                onChange={() => {}} // 読み取り専用
                disabled
                suffix="円"
                formatNumber
                helperText="重量と部品種類から計算"
              />
            </div>
            <div className="flex-shrink-0" style={{ width: '180px' }}>
              <Input
                label="塗装費"
                name="paintingCost"
                type="number"
                value={paintingCost}
                onChange={() => {}} // 読み取り専用
                disabled
                suffix="円"
                formatNumber
                helperText="塗装面積から計算"
              />
            </div>
            <div className="flex-shrink-0" style={{ width: '180px' }}>
              <Input
                label="塗装面積"
                name="paintingArea"
                type="number"
                value={paintingArea}
                onChange={() => {}} // 読み取り専用
                disabled
                suffix="m²"
                formatNumber
                helperText="テーブルデータから自動計算"
              />
            </div>
            {/* 手動入力項目 */}
            <div className="flex-shrink-0" style={{ width: '180px' }}>
              <Input
                label="外注検査費"
                name="externalInspectionCost"
                type="number"
                value={costCalculation.externalInspectionCost ?? 0}
                onChange={(value) => handleManualInputChange('externalInspectionCost', Number(value))}
                required
                suffix="円"
                formatNumber
                min={0}
                error={validateManualInput(costCalculation.externalInspectionCost ?? 0, '外注検査費')}
              />
            </div>
            <div className="basis-full"></div> {/* Force a line break here */}
            <div className="flex-shrink-0" style={{ width: '180px' }}>
              <Input
                label="輸送費"
                name="transportationCost"
                type="number"
                value={costCalculation.transportationCost ?? 0}
                onChange={(value) => handleManualInputChange('transportationCost', Number(value))}
                required
                suffix="円"
                formatNumber
                min={0}
                error={validateManualInput(costCalculation.transportationCost ?? 0, '輸送費')}
              />
            </div>
            <div className="flex-shrink-0" style={{ width: '180px' }}>
              <Input
                label="工場検査費"
                name="factoryInspectionCost"
                type="number"
                value={costCalculation.factoryInspectionCost ?? 0}
                onChange={(value) => handleManualInputChange('factoryInspectionCost', Number(value))}
                required
                suffix="円"
                formatNumber
                min={0}
                error={validateManualInput(costCalculation.factoryInspectionCost ?? 0, '工場検査費')}
              />
            </div>
            <div className="flex-shrink-0" style={{ width: '180px' }}>
              <Input
                label="設計費"
                name="designCost"
                type="number"
                value={costCalculation.designCost ?? 0}
                onChange={(value) => handleManualInputChange('designCost', Number(value))}
                required
                suffix="円"
                formatNumber
                min={0}
                error={validateManualInput(costCalculation.designCost ?? 0, '設計費')}
              />
            </div>
          </div>
        </section>

        {/* 区切り線 */}
        <div className="border-t border-gray-300"></div>

        {/* 原価サマリー */}
        <section className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">原価サマリー</h3>
          <div className="flex flex-row gap-4 flex-wrap items-center">
            <div className="flex-shrink-0" style={{ width: '200px' }}>
              <div className="text-sm text-gray-600 font-medium mb-1">直接原価</div>
              <div className="text-xl font-bold text-gray-900">
                {costSummary.directCost.toLocaleString('ja-JP')}円
              </div>
            </div>
            <div className="flex-shrink-0" style={{ width: '200px' }}>
              <div className="text-sm text-gray-600 font-medium mb-1">製造原価</div>
              <div className="text-xl font-bold text-gray-900">
                {costSummary.manufacturingCost.toLocaleString('ja-JP')}円
              </div>
            </div>
            <div className="flex-shrink-0 bg-white rounded-lg px-4 py-3 shadow-sm border-2 border-blue-300" style={{ width: '200px' }}>
              <div className="text-sm text-gray-600 font-medium mb-1">総原価</div>
              <div className="text-2xl font-bold text-blue-600">
                {costSummary.totalCost.toLocaleString('ja-JP')}円
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-600 bg-white p-2 rounded">
            <p>※ 直接原価 = 総原価 × 0.7</p>
            <p>※ 製造原価 = 総原価 × 0.9</p>
          </div>
        </section>

        {/* アクションボタン - 小さく左に配置 */}
        <div className="flex flex-row gap-2 justify-start py-2">
          <Button
            onClick={handleRecalculate}
            variant="primary"
            size="sm"
            disabled={isRecalculating}
            className="!bg-blue-600 !text-white hover:!bg-blue-700 focus:!ring-blue-600 disabled:!bg-gray-400"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            }
          >
            {isRecalculating ? '計算中...' : '計算'}
          </Button>

          <Button
            onClick={handleSave}
            variant="primary"
            size="sm"
            disabled={!isDirty || isSaving}
            className="!bg-blue-600 !text-white hover:!bg-blue-700 focus:!ring-blue-600 disabled:!bg-gray-400"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            }
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>

          <Button
            onClick={handleExportPdf}
            variant="outline"
            size="sm"
            disabled={!hasData || isExportingPdf}
            className="!border-green-500 !text-green-500 hover:!bg-green-50 focus:!ring-green-500 disabled:!border-gray-400 disabled:!text-gray-400"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            }
          >
            {isExportingPdf ? '出力中...' : 'PDF出力'}
          </Button>

          <Button
            onClick={handleExportExcel}
            variant="secondary"
            size="sm"
            disabled={!hasData || isExportingExcel}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          >
            {isExportingExcel ? '出力中...' : 'Excel出力'}
          </Button>
        </div>

        {/* 区切り線 */}
        <div className="border-t border-gray-300"></div>

        {/* 査印欄 */}
        <section className="border border-gray-200 rounded-lg p-4 bg-white">
          <h3 className="font-bold text-gray-700 mb-4">査印欄</h3>
          <div className="flex flex-row gap-4 items-end">
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">最終承認者</label>
              <div className="w-24 h-24 border-2 border-gray-400 bg-white flex items-center justify-center">
                <input
                  type="text"
                  value={approvalInfo.finalApprover || ''}
                  onChange={(e) => onApprovalChange({ ...approvalInfo, finalApprover: e.target.value })}
                  placeholder=""
                  className="w-full h-full text-center font-medium text-gray-800 focus:outline-none bg-transparent border-none"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">査印4</label>
              <div className="w-24 h-24 border-2 border-gray-400 bg-white flex items-center justify-center">
                <input
                  type="text"
                  value={approvalInfo.seal4 || ''}
                  onChange={(e) => onApprovalChange({ ...approvalInfo, seal4: e.target.value })}
                  placeholder=""
                  className="w-full h-full text-center font-medium text-gray-800 focus:outline-none bg-transparent border-none"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">査印3</label>
              <div className="w-24 h-24 border-2 border-gray-400 bg-white flex items-center justify-center">
                <input
                  type="text"
                  value={approvalInfo.seal3 || ''}
                  onChange={(e) => onApprovalChange({ ...approvalInfo, seal3: e.target.value })}
                  placeholder=""
                  className="w-full h-full text-center font-medium text-gray-800 focus:outline-none bg-transparent border-none"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">査印2</label>
              <div className="w-24 h-24 border-2 border-gray-400 bg-white flex items-center justify-center">
                <input
                  type="text"
                  value={approvalInfo.seal2 || ''}
                  onChange={(e) => onApprovalChange({ ...approvalInfo, seal2: e.target.value })}
                  placeholder=""
                  className="w-full h-full text-center font-medium text-gray-800 focus:outline-none bg-transparent border-none"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">査印1</label>
              <div className="w-24 h-24 border-2 border-gray-400 bg-white flex items-center justify-center">
                <input
                  type="text"
                  value={approvalInfo.seal1 || ''}
                  onChange={(e) => onApprovalChange({ ...approvalInfo, seal1: e.target.value })}
                  placeholder=""
                  className="w-full h-full text-center font-medium text-gray-800 focus:outline-none bg-transparent border-none"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">担当者</label>
              <div className="w-24 h-24 border-2 border-gray-400 bg-white flex items-center justify-center">
                <input
                  type="text"
                  value={approvalInfo.personInCharge || ''}
                  onChange={(e) => onApprovalChange({ ...approvalInfo, personInCharge: e.target.value })}
                  placeholder=""
                  className="w-full h-full text-center font-medium text-gray-800 focus:outline-none bg-transparent border-none"
                />
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

