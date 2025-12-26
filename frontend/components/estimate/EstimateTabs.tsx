'use client';

import React, { useState } from 'react';
import { Tabs } from '@/components/common/Tabs';
import { EstimateTable } from '@/components/estimate/EstimateTable';
import { CostCalculationForm } from '@/components/estimate/CostCalculationForm';
import { RemarksForm } from '@/components/estimate/RemarksForm';
import type { EstimateTableRow, CostCalculation, RemarksData, ApprovalInfo } from '@/types/estimate';

interface EstimateTabsProps {
  tableData: EstimateTableRow[];
  costCalculation: CostCalculation;
  remarksData: RemarksData;
  approvalInfo: ApprovalInfo;
  onTableDataChange: (data: EstimateTableRow[]) => void;
  onCostCalculationChange: (calc: CostCalculation) => void;
  onRemarksDataChange: (data: RemarksData) => void;
  onApprovalInfoChange: (info: ApprovalInfo) => void;
  isDirty?: boolean;
  onSave?: () => void;
  onExportPdf?: () => void;
  onExportExcel?: () => void;
}

export const EstimateTabs: React.FC<EstimateTabsProps> = ({
  tableData,
  costCalculation,
  remarksData,
  approvalInfo,
  onTableDataChange,
  onCostCalculationChange,
  onRemarksDataChange,
  onApprovalInfoChange,
  isDirty = false,
  onSave,
  onExportPdf,
  onExportExcel,
}) => {
  const [activeTab, setActiveTab] = useState<string>('原価明細');

  const tabs = [
    {
      id: '原価明細',
      label: '原価明細',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: '原価計算',
      label: '原価計算',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: '備考・補足',
      label: '備考・補足',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
  ];

  const handleAddRow = () => {
    const newRow: EstimateTableRow = {
      id: crypto.randomUUID(),
      modelNumber: '',
      name: '',
      partType: '',
      material: '',
      dimensions: { partType: '' },
      quantity: 1,
      weight: 0,
      unitPrice: 0,
      price: 0,
      autoDisplay: false,
      isAuto: false,
      isAutoInput: false,
      isTemplateDiff: false,
    };
    onTableDataChange([...tableData, newRow]);
  };

  const handleRemoveRow = (id: string) => {
    onTableDataChange(tableData.filter((row) => row.id !== id));
  };

  const handleUpdateRow = (id: string, data: Partial<EstimateTableRow>) => {
    onTableDataChange(
      tableData.map((row) => {
        if (row.id === id) {
          const updated = { ...row, ...data };
          // 価格の自動計算
          if (updated.isAuto && updated.weight > 0) {
            updated.price = updated.unitPrice * updated.weight;
          } else {
            updated.price = updated.unitPrice * updated.quantity;
          }
          return updated;
        }
        return row;
      })
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      <div className="p-0">
        {activeTab === '原価明細' && (
          <EstimateTable
            data={tableData}
            onAdd={handleAddRow}
            onRemove={handleRemoveRow}
            onUpdate={handleUpdateRow}
            approvalInfo={approvalInfo}
            onApprovalChange={onApprovalInfoChange}
          />
        )}
        
        {activeTab === '原価計算' && (
          <div className="p-6">
            <CostCalculationForm
              costCalculation={costCalculation}
              onChange={onCostCalculationChange}
              tableData={tableData}
              approvalInfo={approvalInfo}
              onApprovalChange={onApprovalInfoChange}
              isDirty={isDirty}
              onSave={onSave}
              onExportPdf={onExportPdf}
              onExportExcel={onExportExcel}
            />
          </div>
        )}
        
        {activeTab === '備考・補足' && (
          <div className="p-6">
            <RemarksForm
              remarksData={remarksData}
              onRemarksChange={onRemarksDataChange}
              approvalInfo={approvalInfo}
              onApprovalChange={onApprovalInfoChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

