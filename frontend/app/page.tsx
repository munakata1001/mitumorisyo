'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ProjectInfoForm } from '@/components/estimate/ProjectInfoForm';
import { FileUpload, type ParseMode } from '@/components/estimate/FileUpload';
import { TemplateSelector } from '@/components/estimate/TemplateSelector';
import { EstimateTabs } from '@/components/estimate/EstimateTabs';
import { saveTemplate, getEstimate, saveEstimate, type Template } from '@/lib/storage/localStorage';
import type { ProjectInfo, CostCalculation, EstimateTableRow, RemarksData, ApprovalInfo } from '@/types/estimate';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(() => ({
    estimateNumber: '',
    customer: '',
    deliveryDestination: '',
    equipmentName: '',
    productionQuantity: 0,
    productionUnit: '台',
    // クライアントサイドでのみ初期化されるように、固定の日付を使用
    deliveryDate: new Date('2025-01-01'),
    model: '',
    equipmentShape: '',
    weight: 0,
  }));

  // クライアントサイドでのみ現在の日付で初期化
  useEffect(() => {
    setMounted(true);
    setProjectInfo(prev => ({
      ...prev,
      deliveryDate: new Date(),
    }));
  }, []);

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectInfo, string>>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [tableData, setTableData] = useState<EstimateTableRow[]>([]);
  const [costCalculation, setCostCalculation] = useState<CostCalculation>({
    materialCost: 0,
    processingCost: 0,
    paintingCost: 0,
    externalInspectionCost: 0,
    transportationCost: 0,
    factoryInspectionCost: 0,
    designCost: 0,
    directCost: 0,
    manufacturingCost: 0,
    totalCost: 0,
    paintingArea: 0,
  });
  const [remarksData, setRemarksData] = useState<RemarksData>({
    remarks: ['', '', ''],
    materialCostNotes: ['', ''],
    internalProcessingNotes: ['', ''],
    externalProcessingNotes: ['', ''],
  });
  const [approvalInfo, setApprovalInfo] = useState<ApprovalInfo>({
    assessor: '',
    assessmentDate: new Date(),
    approver: '',
    approvalDate: new Date(),
    finalApprover: '',
    seal1: '',
    seal2: '',
    seal3: '',
    seal4: '',
    personInCharge: '',
  });

  const handleProjectInfoChange = (info: ProjectInfo) => {
    setProjectInfo(info);
    setIsDirty(true);
    
    // リアルタイムバリデーション
    const newErrors: Partial<Record<keyof ProjectInfo, string>> = {};
    
    if (!info.estimateNumber || info.estimateNumber.trim() === '') {
      newErrors.estimateNumber = '見積番号は必須です';
    }
    if (!info.customer || info.customer.trim() === '') {
      newErrors.customer = '客先は必須です';
    }
    if (!info.deliveryDestination || info.deliveryDestination.trim() === '') {
      newErrors.deliveryDestination = '向先は必須です';
    }
    if (!info.equipmentName || info.equipmentName.trim() === '') {
      newErrors.equipmentName = '機器名は必須です';
    }
    if (!info.productionQuantity || info.productionQuantity <= 0) {
      newErrors.productionQuantity = '製作数量は0より大きい値が必要です';
    }
    if (!info.deliveryDate) {
      newErrors.deliveryDate = '納期は必須です';
    }
    if (!info.model || info.model.trim() === '') {
      newErrors.model = '機種は必須です';
    }
    if (!info.equipmentShape || info.equipmentShape.trim() === '') {
      newErrors.equipmentShape = '機器形状は必須です';
    }
    if (!info.weight || info.weight <= 0) {
      newErrors.weight = '重量は0より大きい値が必要です';
    }
    
    setErrors(newErrors);
  };

  const handleBack = () => {
    // トップページに戻る（現在は同じページなので何もしない）
    // 将来的に別ページに遷移する場合は router.push('/') など
    console.log('トップに戻る');
  };

  const handleEstimateLoad = (estimateId: string) => {
    const estimate = getEstimate(estimateId);
    if (estimate) {
      setProjectInfo(estimate.projectInfo);
      setIsDirty(false);
      setErrors({});
    }
  };

  const handleTemplateSave = (name: string, description?: string) => {
    const template: Template = {
      id: crypto.randomUUID(),
      name,
      description,
      projectInfo,
      tableData,
      costCalculation,
      remarksData,
      approvalInfo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    saveTemplate(template);
    setIsDirty(false);
    
    // テンプレート保存イベントを発火（TemplateSelectorが更新される）
    window.dispatchEvent(new Event('templateSaved'));
    
    alert(`テンプレート「${name}」を保存しました`);
  };

  const handleTemplateApply = (templateData: {
    projectInfo?: ProjectInfo;
    tableData?: EstimateTableRow[];
    costCalculation?: CostCalculation;
    remarksData?: RemarksData;
    approvalInfo?: ApprovalInfo;
  }) => {
    if (templateData.projectInfo) {
      setProjectInfo(templateData.projectInfo);
    }
    if (templateData.tableData) {
      setTableData(templateData.tableData);
    }
    if (templateData.costCalculation) {
      setCostCalculation(templateData.costCalculation);
    }
    if (templateData.remarksData) {
      setRemarksData(templateData.remarksData);
    }
    if (templateData.approvalInfo) {
      setApprovalInfo(templateData.approvalInfo);
    }
    setIsDirty(true);
  };

  // 保存ハンドラー
  const handleSave = () => {
    if (!projectInfo.estimateNumber) {
      alert('見積番号を入力してください');
      return;
    }

    const estimate = {
      id: crypto.randomUUID(),
      projectInfo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    saveEstimate(estimate);
    setIsDirty(false);
    alert('見積書を保存しました');
  };

  // PDF出力ハンドラー（モック実装）
  const handleExportPdf = async () => {
    if (!projectInfo.estimateNumber) {
      alert('見積番号を入力してください');
      return;
    }

    // TODO: 実際のPDF出力処理を実装
    // 現時点ではモック実装
    const fileName = `見積書_${projectInfo.estimateNumber}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;
    console.log('PDF出力:', fileName, {
      projectInfo,
      tableData,
      costCalculation,
      remarksData,
      approvalInfo,
    });
    
    alert(`PDF出力機能は実装中です。\nファイル名: ${fileName}`);
  };

  // Excel出力ハンドラー（モック実装）
  const handleExportExcel = async () => {
    if (!projectInfo.estimateNumber) {
      alert('見積番号を入力してください');
      return;
    }

    // TODO: 実際のExcel出力処理を実装
    // 現時点ではモック実装
    const fileName = `見積書_${projectInfo.estimateNumber}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;
    console.log('Excel出力:', fileName, {
      projectInfo,
      tableData,
      costCalculation,
      remarksData,
      approvalInfo,
    });
    
    alert(`Excel出力機能は実装中です。\nファイル名: ${fileName}`);
  };

  const handleFileUpload = async (files: File[], mode: ParseMode) => {
    // TODO: 実際のファイル解析処理を実装
    // 現時点ではモック実装として、ファイル情報をログに出力
    console.log('ファイルアップロード:', {
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
      mode,
    });

    // 解析処理のシミュレーション（2秒待機）
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 将来的にはここでファイル解析を行い、テーブルデータを更新する
    // 例: const parsedData = await parseFiles(files, mode);
    //     setTableData(parsedData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        isDirty={isDirty}
        projectInfo={projectInfo}
        onBack={handleBack}
        onEstimateLoad={handleEstimateLoad}
        onTemplateSave={handleTemplateSave}
      />
      
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">見積書デモアプリ</h1>
          
          <ProjectInfoForm
            projectInfo={projectInfo}
            onChange={handleProjectInfoChange}
            errors={errors}
          />

          <div className="mt-8">
            <FileUpload
              onUpload={handleFileUpload}
              maxSize={10 * 1024 * 1024} // 10MB
              acceptedTypes={['.xlsx', '.xlsm', '.xls', '.pdf']}
              maxFiles={3}
            />
          </div>

          <div className="mt-8">
            <TemplateSelector onApply={handleTemplateApply} />
          </div>

          <div className="mt-8">
            <EstimateTabs
              tableData={tableData}
              costCalculation={costCalculation}
              remarksData={remarksData}
              approvalInfo={approvalInfo}
              onTableDataChange={(data) => {
                setTableData(data);
                setIsDirty(true);
              }}
              onCostCalculationChange={(calc) => {
                setCostCalculation(calc);
                setIsDirty(true);
              }}
              onRemarksDataChange={(data) => {
                setRemarksData(data);
                setIsDirty(true);
              }}
              onApprovalInfoChange={(info) => {
                setApprovalInfo(info);
                setIsDirty(true);
              }}
              isDirty={isDirty}
              onSave={handleSave}
              onExportPdf={handleExportPdf}
              onExportExcel={handleExportExcel}
            />
          </div>
          
          {/* デバッグ用: 現在の値を表示 */}
          {mounted && (
            <div className="mt-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold mb-4">入力値（デバッグ用）</h2>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(
                  {
                    ...projectInfo,
                    deliveryDate: projectInfo.deliveryDate.toISOString(),
                  },
                  null,
                  2
                )}
              </pre>
              {isDirty && (
                <p className="mt-2 text-sm text-orange-600">※ 未保存の変更があります</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

