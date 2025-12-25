'use client';

import React from 'react';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { DatePicker } from '@/components/common/DatePicker';
import type { ProjectInfo } from '@/types/estimate';

interface ProjectInfoFormProps {
  projectInfo: ProjectInfo;
  onChange: (info: ProjectInfo) => void;
  errors?: Partial<Record<keyof ProjectInfo, string>>;
}

// 機種のオプション（実際のデータに置き換える）
const MODEL_OPTIONS = [
  { value: 'model1', label: '機種1' },
  { value: 'model2', label: '機種2' },
  { value: 'model3', label: '機種3' },
];

// 単位のオプション
const UNIT_OPTIONS = [
  { value: '台', label: '台' },
  { value: '個', label: '個' },
  { value: '式', label: '式' },
];

export const ProjectInfoForm: React.FC<ProjectInfoFormProps> = ({
  projectInfo,
  onChange,
  errors = {},
}) => {
  const handleFieldChange = (field: keyof ProjectInfo, value: any) => {
    const newInfo = { ...projectInfo, [field]: value };
    onChange(newInfo);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">基本情報</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 見積番号 */}
        <Input
          label="見積番号"
          name="estimateNumber"
          type="text"
          value={projectInfo.estimateNumber}
          onChange={(value) => handleFieldChange('estimateNumber', value)}
          placeholder="例: D11800"
          required
          error={errors.estimateNumber}
        />

        {/* 客先 */}
        <Input
          label="客先"
          name="customer"
          type="text"
          value={projectInfo.customer}
          onChange={(value) => handleFieldChange('customer', value)}
          placeholder="顧客名を入力"
          required
          error={errors.customer}
        />

        {/* 向先 */}
        <Input
          label="向先"
          name="deliveryDestination"
          type="text"
          value={projectInfo.deliveryDestination}
          onChange={(value) => handleFieldChange('deliveryDestination', value)}
          placeholder="納入先を入力"
          required
          error={errors.deliveryDestination}
        />

        {/* 機器名 */}
        <Input
          label="機器名"
          name="equipmentName"
          type="text"
          value={projectInfo.equipmentName}
          onChange={(value) => handleFieldChange('equipmentName', value)}
          placeholder="機器の名称を入力"
          required
          error={errors.equipmentName}
        />

        {/* 製作数量 */}
        <div className="space-y-2">
          <Input
            label="製作数量"
            name="productionQuantity"
            type="number"
            value={projectInfo.productionQuantity}
            onChange={(value) => handleFieldChange('productionQuantity', value)}
            placeholder="0"
            required
            min={0}
            step={1}
            formatNumber
            error={errors.productionQuantity}
          />
          <Select
            name="productionUnit"
            value={projectInfo.productionUnit}
            onChange={(value) => handleFieldChange('productionUnit', value as '台' | '個' | '式')}
            options={UNIT_OPTIONS}
            required
          />
        </div>

        {/* 納期 */}
        <DatePicker
          label="納期"
          name="deliveryDate"
          value={projectInfo.deliveryDate}
          onChange={(date) => handleFieldChange('deliveryDate', date || new Date())}
          required
          minDate={new Date()}
          error={errors.deliveryDate}
        />

        {/* 機種 */}
        <Select
          label="機種"
          name="model"
          value={projectInfo.model}
          onChange={(value) => handleFieldChange('model', value)}
          options={MODEL_OPTIONS}
          placeholder="機種を選択"
          required
          error={errors.model}
        />

        {/* 機器形状 */}
        <Input
          label="機器形状"
          name="equipmentShape"
          type="text"
          value={projectInfo.equipmentShape}
          onChange={(value) => handleFieldChange('equipmentShape', value)}
          placeholder="機器の形状を記入"
          required
          error={errors.equipmentShape}
        />

        {/* 重量 */}
        <Input
          label="重量"
          name="weight"
          type="number"
          value={projectInfo.weight}
          onChange={(value) => handleFieldChange('weight', value)}
          placeholder="0"
          required
          suffix="kg"
          min={0}
          step={0.1}
          formatNumber
          error={errors.weight}
        />
      </div>
    </div>
  );
};

