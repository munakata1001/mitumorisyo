'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { getTemplates, type Template } from '@/lib/storage/localStorage';
import type { RemarksData } from '@/types/estimate';

interface RemarksFormProps {
  remarksData: RemarksData;
  onRemarksChange: (data: RemarksData) => void;
  errors?: {
    remarks?: string[];
  };
}

export const RemarksForm: React.FC<RemarksFormProps> = ({
  remarksData,
  onRemarksChange,
  errors = {},
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateForRemarks, setSelectedTemplateForRemarks] = useState<string>('');

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

  // テンプレートから備考を選択
  const handleTemplateRemarksSelect = (templateId: string) => {
    if (!templateId) {
      setSelectedTemplateForRemarks('');
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    if (template && template.remarksData) {
      // テンプレートの備考を適用（空の場合は適用しない）
      const newRemarks = template.remarksData.remarks.map((remark, index) => {
        return remark.trim() !== '' ? remark : remarksData.remarks[index];
      });
      onRemarksChange({ ...remarksData, remarks: newRemarks });
      setSelectedTemplateForRemarks(templateId);
    }
  };

  const handleRemarksChange = (index: number, value: string) => {
    const newRemarks = [...remarksData.remarks];
    newRemarks[index] = value.slice(0, 40); // 最大40文字
    onRemarksChange({ ...remarksData, remarks: newRemarks });
    // 手動入力時はテンプレート選択をクリア
    if (selectedTemplateForRemarks) {
      setSelectedTemplateForRemarks('');
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-700">備考</h3>
          {templatesWithRemarks.length > 0 && (
            <div className="w-64">
              <Select
                label=""
                name="templateRemarks"
                value={selectedTemplateForRemarks}
                onChange={handleTemplateRemarksSelect}
                options={[
                  { value: '', label: 'テンプレートから選択...' },
                  ...templatesWithRemarks.map((template) => ({
                    value: template.id,
                    label: template.name,
                  })),
                ]}
                placeholder="テンプレートから選択..."
              />
            </div>
          )}
        </div>
        <div className="space-y-3">
          {remarksData.remarks.map((remark, index) => (
            <div key={index}>
              <Input
                label={`備考${index + 1}`}
                name={`remark-${index}`}
                type="text"
                value={remark}
                onChange={(value) => handleRemarksChange(index, String(value))}
                placeholder="備考を入力（最大40文字）"
                maxLength={40}
                error={errors.remarks?.[index]}
              />
              <p className="text-xs text-gray-500 mt-1">{remark.length}/40文字</p>
            </div>
          ))}
        </div>
        {templatesWithRemarks.length === 0 && (
          <p className="text-xs text-gray-500 mt-2">
            テンプレートから選択するには、まずテンプレートを保存してください。
          </p>
        )}
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

