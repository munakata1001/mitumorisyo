'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { DatePicker } from '@/components/common/DatePicker';
import { getTemplates, type Template } from '@/lib/storage/localStorage';
import type { RemarksData, ApprovalInfo } from '@/types/estimate';

interface RemarksFormProps {
  remarksData: RemarksData;
  onRemarksChange: (data: RemarksData) => void;
  approvalInfo: ApprovalInfo;
  onApprovalChange: (info: ApprovalInfo) => void;
  errors?: {
    remarks?: string[];
  };
}

export const RemarksForm: React.FC<RemarksFormProps> = ({
  remarksData,
  onRemarksChange,
  approvalInfo,
  onApprovalChange,
  errors = {},
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplatesForRemarks, setSelectedTemplatesForRemarks] = useState<string[]>(['', '', '']);

  // テンプレート一覧を読み込む
  useEffect(() => {
    loadTemplates();
    
    // テンプレート保存後の更新
    const handleTemplateSaved = () => {
      loadTemplates();
    };
    window.addEventListener('templateSaved', handleTemplateSaved);
    
    return () => {
      window.removeEventListener('templateSaved', handleTemplateSaved);
    };
  }, []);

  const loadTemplates = () => {
    const loadedTemplates = getTemplates();
    setTemplates(loadedTemplates);
  };

  // 備考を持つテンプレートを取得
  const templatesWithRemarks = templates.filter(
    (template) => template.remarksData && template.remarksData.remarks.some((r) => r.trim() !== '')
  );

  // テンプレートから特定の備考行を選択
  const handleTemplateRemarksSelect = (index: number, templateId: string) => {
    if (!templateId) {
      const newSelected = [...selectedTemplatesForRemarks];
      newSelected[index] = '';
      setSelectedTemplatesForRemarks(newSelected);
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    if (template && template.remarksData && template.remarksData.remarks[index]) {
      const newRemarks = [...remarksData.remarks];
      const templateRemark = template.remarksData.remarks[index];
      if (templateRemark.trim() !== '') {
        newRemarks[index] = templateRemark.slice(0, 40); // 最大40文字
        onRemarksChange({ ...remarksData, remarks: newRemarks });
      }
      const newSelected = [...selectedTemplatesForRemarks];
      newSelected[index] = templateId;
      setSelectedTemplatesForRemarks(newSelected);
    }
  };

  const handleRemarksChange = (index: number, value: string) => {
    const newRemarks = [...remarksData.remarks];
    newRemarks[index] = value.slice(0, 40); // 最大40文字
    onRemarksChange({ ...remarksData, remarks: newRemarks });
    // 手動入力時は該当するテンプレート選択をクリア
    if (selectedTemplatesForRemarks[index]) {
      const newSelected = [...selectedTemplatesForRemarks];
      newSelected[index] = '';
      setSelectedTemplatesForRemarks(newSelected);
    }
  };

  const handleNoteChange = (
    category: 'materialCostNotes' | 'internalProcessingNotes' | 'externalProcessingNotes',
    index: number,
    value: string
  ) => {
    const newNotes = [...remarksData[category]];
    newNotes[index] = value.slice(0, 60); // 最大60文字
    onRemarksChange({ ...remarksData, [category]: newNotes });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800">備考・補足</h2>

      {/* 備考入力 */}
      <section>
        <h3 className="font-bold text-gray-700 mb-4">備考</h3>
        
        {/* 備考入力ボックスとテンプレート選択プルダウン（横一列・縦3列） */}
        <div className="space-y-3">
          {remarksData.remarks.map((remark, index) => (
            <div key={index} className="flex flex-row gap-3 items-start">
              <div className="flex-shrink-0" style={{ width: '250px' }}>
                <Select
                  label="テンプレートから選択"
                  name={`templateRemarks-${index}`}
                  value={selectedTemplatesForRemarks[index] || ''}
                  onChange={(value) => handleTemplateRemarksSelect(index, value)}
                  options={
                    templatesWithRemarks.length > 0
                      ? [
                          { value: '', label: 'テンプレートから選択...' },
                          ...templatesWithRemarks.map((template) => ({
                            value: template.id,
                            label: `${template.name}${template.description ? ` - ${template.description}` : ''}`,
                          })),
                        ]
                      : [{ value: '', label: 'テンプレートがありません' }]
                  }
                  placeholder="テンプレートから選択..."
                  disabled={templatesWithRemarks.length === 0}
                />
              </div>
              <div className="flex-1">
                <div className="mb-1">
                  <label 
                    htmlFor={`remark-${index}`}
                    className="block text-sm font-medium text-gray-700"
                    style={{ minHeight: '21px' }}
                  >
                    備考{index + 1}
                  </label>
                </div>
                <Input
                  name={`remark-${index}`}
                  type="text"
                  value={remark}
                  onChange={(value) => handleRemarksChange(index, String(value))}
                  placeholder="備考を入力（最大40文字）"
                  maxLength={40}
                  error={errors.remarks?.[index]}
                  className={errors.remarks?.[index] ? '' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">{remark.length}/40文字</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 見積査印 */}
      <section>
        <h3 className="font-bold text-gray-700 mb-4">見積査印</h3>
        <div className="space-y-4">
          {/* 1行目: 査定者と査定日 */}
          <div className="flex flex-row gap-4 flex-wrap">
            <div className="flex-shrink-0" style={{ width: '200px' }}>
              <Input
                label="査定者"
                name="assessor"
                type="text"
                value={approvalInfo.assessor}
                onChange={(value) => onApprovalChange({ ...approvalInfo, assessor: String(value) })}
                placeholder="査定者名を入力"
                required
              />
            </div>
            <div className="flex-shrink-0" style={{ width: '200px' }}>
              <DatePicker
                label="査定日"
                name="assessmentDate"
                value={approvalInfo.assessmentDate}
                onChange={(date) => onApprovalChange({ ...approvalInfo, assessmentDate: date || new Date() })}
                required
              />
            </div>
          </div>
          {/* 2行目: 承認者と承認日 */}
          <div className="flex flex-row gap-4 flex-wrap">
            <div className="flex-shrink-0" style={{ width: '200px' }}>
              <Input
                label="承認者"
                name="approver"
                type="text"
                value={approvalInfo.approver}
                onChange={(value) => onApprovalChange({ ...approvalInfo, approver: String(value) })}
                placeholder="承認者名を入力"
                required
              />
            </div>
            <div className="flex-shrink-0" style={{ width: '200px' }}>
              <DatePicker
                label="承認日"
                name="approvalDate"
                value={approvalInfo.approvalDate}
                onChange={(date) => onApprovalChange({ ...approvalInfo, approvalDate: date || new Date() })}
                required
                minDate={approvalInfo.assessmentDate}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 補足事項入力 */}
      <section>
        <h3 className="font-bold text-gray-700 mb-4">補足事項</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">材料費</h4>
            <div className="space-y-2">
              {remarksData.materialCostNotes.map((note, index) => (
                <div key={index}>
                  <Input
                    label={`材料費補足${index + 1}`}
                    name={`materialCostNote-${index}`}
                    type="text"
                    value={note}
                    onChange={(value) => handleNoteChange('materialCostNotes', index, String(value))}
                    placeholder="補足事項を入力（最大60文字）"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">{note.length}/60文字</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">内作加工費</h4>
            <div className="space-y-2">
              {remarksData.internalProcessingNotes.map((note, index) => (
                <div key={index}>
                  <Input
                    label={`内作加工費補足${index + 1}`}
                    name={`internalProcessingNote-${index}`}
                    type="text"
                    value={note}
                    onChange={(value) => handleNoteChange('internalProcessingNotes', index, String(value))}
                    placeholder="補足事項を入力（最大60文字）"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">{note.length}/60文字</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">外注加工・塗装費・外注検査・運送費</h4>
            <div className="space-y-2">
              {remarksData.externalProcessingNotes.map((note, index) => (
                <div key={index}>
                  <Input
                    label={`外注加工等補足${index + 1}`}
                    name={`externalProcessingNote-${index}`}
                    type="text"
                    value={note}
                    onChange={(value) => handleNoteChange('externalProcessingNotes', index, String(value))}
                    placeholder="補足事項を入力（最大60文字）"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">{note.length}/60文字</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

