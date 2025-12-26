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
      
      <div className="flex flex-row gap-4 flex-wrap">
        {/* 見積番号 */}
        <div className="flex-shrink-0" style={{ width: '180px' }}>
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
        </div>

        {/* 客先 */}
        <div className="flex-shrink-0" style={{ width: '180px' }}>
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
        </div>

        {/* 向先 */}
        <div className="flex-shrink-0" style={{ width: '180px' }}>
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
        </div>

        {/* 機器名 */}
        <div className="flex-shrink-0" style={{ width: '180px' }}>
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
        </div>

        {/* 製作数量 */}
        <div className="flex-shrink-0" style={{ width: '180px' }}>
          <label 
            htmlFor="productionQuantity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            製作数量
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
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
                className="mb-0"
              />
            </div>
            <div className="w-24">
              <Select
                name="productionUnit"
                value={projectInfo.productionUnit}
                onChange={(value) => handleFieldChange('productionUnit', value as '台' | '個' | '式')}
                options={UNIT_OPTIONS}
                required
              />
            </div>
          </div>
          {errors.productionQuantity && (
            <p className="mt-1 text-sm text-red-500">{errors.productionQuantity}</p>
          )}
        </div>

        {/* 改行要素 */}
        <div className="basis-full"></div>

        {/* 納期 */}
        <div className="flex-shrink-0" style={{ width: '180px' }}>
          <DatePicker
            label="納期"
            name="deliveryDate"
            value={projectInfo.deliveryDate}
            onChange={(date) => handleFieldChange('deliveryDate', date || new Date())}
            required
            minDate={new Date()}
            error={errors.deliveryDate}
          />
        </div>

        {/* 機種 */}
        <div className="flex-shrink-0" style={{ width: '180px' }}>
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
        </div>

        {/* 機器形状 */}
        <div className="flex-shrink-0" style={{ width: '180px' }}>
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
        </div>

        {/* 重量 */}
        <div className="flex-shrink-0" style={{ width: '180px' }}>
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
    </div>
  );
};

