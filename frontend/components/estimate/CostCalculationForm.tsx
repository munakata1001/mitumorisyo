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
        {/* 自動計算項目 */}
        <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-4">自動計算項目</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </section>

        {/* 区切り線 */}
        <div className="border-t border-gray-300"></div>

        {/* 手動入力項目 */}
        <section className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-700 mb-4">手動入力項目</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </section>

        {/* 区切り線 */}
        <div className="border-t border-gray-300"></div>

        {/* 原価サマリー */}
        <section className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">原価サマリー</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-blue-200">
              <span className="text-gray-700 font-medium text-base">直接原価:</span>
              <span className="text-lg font-bold text-gray-900">
                {costSummary.directCost.toLocaleString('ja-JP')}円
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-blue-200">
              <span className="text-gray-700 font-medium text-base">製造原価:</span>
              <span className="text-lg font-bold text-gray-900">
                {costSummary.manufacturingCost.toLocaleString('ja-JP')}円
              </span>
            </div>
            <div className="flex items-center justify-between py-4 bg-white rounded-lg px-4 mt-4 shadow-sm border-2 border-blue-300">
              <span className="text-xl font-bold text-blue-600">総原価:</span>
              <span className="text-3xl font-bold text-blue-600">
                {costSummary.totalCost.toLocaleString('ja-JP')}円
              </span>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-600 bg-white p-2 rounded">
            <p>※ 直接原価 = 総原価 × 0.7</p>
            <p>※ 製造原価 = 総原価 × 0.9</p>
          </div>
        </section>

        {/* 区切り線 */}
        <div className="border-t border-gray-300"></div>

        {/* 見積査印情報 */}
        <section className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-700 mb-4">見積査印情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="査定者"
              name="assessor"
              type="text"
              value={approvalInfo.assessor}
              onChange={(value) => onApprovalChange({ ...approvalInfo, assessor: String(value) })}
              required
              error={errors.approval?.assessor}
              placeholder="査定者名を入力"
            />
            <DatePicker
              label="査定日"
              name="assessmentDate"
              value={approvalInfo.assessmentDate}
              onChange={(date) => onApprovalChange({ ...approvalInfo, assessmentDate: date || new Date() })}
              required
              error={errors.approval?.assessmentDate}
            />
            <Input
              label="承認者"
              name="approver"
              type="text"
              value={approvalInfo.approver}
              onChange={(value) => onApprovalChange({ ...approvalInfo, approver: String(value) })}
              required
              error={errors.approval?.approver}
              placeholder="承認者名を入力"
            />
            <DatePicker
              label="承認日"
              name="approvalDate"
              value={approvalInfo.approvalDate}
              onChange={(date) => onApprovalChange({ ...approvalInfo, approvalDate: date || new Date() })}
              required
              minDate={approvalInfo.assessmentDate}
              error={errors.approval?.approvalDate}
            />
          </div>
        </section>

        {/* 区切り線 */}
        <div className="border-t border-gray-300"></div>

        {/* 下部査印欄 */}
        <section className="border border-gray-200 rounded-lg p-4 bg-white">
          <h3 className="font-bold text-gray-700 mb-4">査印欄</h3>
          <div className="space-y-4">
            {/* 最終承認者 */}
            <div>
              <Input
                label="最終承認者"
                name="finalApprover"
                type="text"
                value={approvalInfo.finalApprover}
                onChange={(value) => onApprovalChange({ ...approvalInfo, finalApprover: String(value) })}
                placeholder="最終承認者名を入力"
              />
            </div>

            {/* 査印1〜4（2×2グリッド、印鑑風デザイン） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">査印</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <div className="border-2 border-gray-300 rounded-lg p-3 bg-gradient-to-br from-red-50 to-red-100 hover:border-red-400 transition-colors">
                    <label className="block text-xs font-medium text-gray-600 mb-1">査印1</label>
                    <input
                      type="text"
                      value={approvalInfo.seal1}
                      onChange={(e) => onApprovalChange({ ...approvalInfo, seal1: e.target.value })}
                      placeholder="査印1"
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-center font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
                    />
                  </div>
                </div>
                <div className="relative">
                  <div className="border-2 border-gray-300 rounded-lg p-3 bg-gradient-to-br from-red-50 to-red-100 hover:border-red-400 transition-colors">
                    <label className="block text-xs font-medium text-gray-600 mb-1">査印2</label>
                    <input
                      type="text"
                      value={approvalInfo.seal2}
                      onChange={(e) => onApprovalChange({ ...approvalInfo, seal2: e.target.value })}
                      placeholder="査印2"
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-center font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
                    />
                  </div>
                </div>
                <div className="relative">
                  <div className="border-2 border-gray-300 rounded-lg p-3 bg-gradient-to-br from-red-50 to-red-100 hover:border-red-400 transition-colors">
                    <label className="block text-xs font-medium text-gray-600 mb-1">査印3</label>
                    <input
                      type="text"
                      value={approvalInfo.seal3}
                      onChange={(e) => onApprovalChange({ ...approvalInfo, seal3: e.target.value })}
                      placeholder="査印3"
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-center font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
                    />
                  </div>
                </div>
                <div className="relative">
                  <div className="border-2 border-gray-300 rounded-lg p-3 bg-gradient-to-br from-red-50 to-red-100 hover:border-red-400 transition-colors">
                    <label className="block text-xs font-medium text-gray-600 mb-1">査印4</label>
                    <input
                      type="text"
                      value={approvalInfo.seal4}
                      onChange={(e) => onApprovalChange({ ...approvalInfo, seal4: e.target.value })}
                      placeholder="査印4"
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-center font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 担当者 */}
            <div>
              <Input
                label="担当者"
                name="personInCharge"
                type="text"
                value={approvalInfo.personInCharge}
                onChange={(value) => onApprovalChange({ ...approvalInfo, personInCharge: String(value) })}
                placeholder="担当者名を入力"
              />
            </div>
          </div>
        </section>

        {/* 区切り線 */}
        <div className="border-t border-gray-300"></div>

        {/* アクションボタンエリア */}
        <section className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="font-bold text-gray-700 mb-4">アクション</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 計算ボタン */}
            <Button
              onClick={handleRecalculate}
              variant="outline"
              disabled={isRecalculating}
              icon={
                <svg
                  className="w-5 h-5"
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
              fullWidth
            >
              {isRecalculating ? '計算中...' : '計算'}
            </Button>

            {/* 保存ボタン */}
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={!isDirty || isSaving}
              icon={
                <svg
                  className="w-5 h-5"
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
              fullWidth
            >
              {isSaving ? '保存中...' : '保存'}
            </Button>

            {/* PDF出力ボタン */}
            <Button
              onClick={handleExportPdf}
              variant="secondary"
              disabled={!hasData || isExportingPdf}
              icon={
                <svg
                  className="w-5 h-5"
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
              fullWidth
            >
              {isExportingPdf ? '出力中...' : 'PDF出力'}
            </Button>

            {/* Excel出力ボタン */}
            <Button
              onClick={handleExportExcel}
              variant="secondary"
              disabled={!hasData || isExportingExcel}
              icon={
                <svg
                  className="w-5 h-5"
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
              fullWidth
            >
              {isExportingExcel ? '出力中...' : 'Excel出力'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

