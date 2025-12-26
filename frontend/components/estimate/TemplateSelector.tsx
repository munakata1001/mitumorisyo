'use client';

import React, { useState, useEffect } from 'react';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { getTemplates, type Template } from '@/lib/storage/localStorage';
import { format } from 'date-fns';
import type { ProjectInfo, EstimateTableRow, CostCalculation, RemarksData, ApprovalInfo } from '@/types/estimate';

interface TemplateSelectorProps {
  onApply: (template: {
    projectInfo?: ProjectInfo;
    tableData?: EstimateTableRow[];
    costCalculation?: CostCalculation;
    remarksData?: RemarksData;
    approvalInfo?: ApprovalInfo;
  }) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onApply }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // テンプレート一覧を読み込む
  useEffect(() => {
    loadTemplates();
  }, []);

  // テンプレート保存後の更新（storageイベントを監視）
  useEffect(() => {
    const handleStorageChange = () => {
      loadTemplates();
    };

    window.addEventListener('storage', handleStorageChange);
    // 同じタブ内での変更も検知するため、カスタムイベントも監視
    window.addEventListener('templateSaved', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('templateSaved', handleStorageChange);
    };
  }, []);

  const loadTemplates = () => {
    const loadedTemplates = getTemplates();
    setTemplates(loadedTemplates);
  };

  // テンプレート適用
  const handleApply = () => {
    if (!selectedTemplateId) {
      setMessage({ type: 'error', text: 'テンプレートを選択してください' });
      return;
    }

    const template = templates.find((t) => t.id === selectedTemplateId);
    if (!template) {
      setMessage({ type: 'error', text: '選択したテンプレートが見つかりません' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // テンプレートデータを適用
      onApply({
        projectInfo: template.projectInfo,
        tableData: template.tableData || [],
        costCalculation: template.costCalculation,
        remarksData: template.remarksData,
        approvalInfo: template.approvalInfo,
      });

      setMessage({ type: 'success', text: `テンプレート「${template.name}」を適用しました` });
      
      // 成功メッセージを3秒後に自動で非表示
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'テンプレートの適用に失敗しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">テンプレート選択</h2>

      <div className="space-y-4">
        {/* テンプレート選択と適用ボタン */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Select
              label="テンプレート"
              name="template"
              value={selectedTemplateId}
              onChange={setSelectedTemplateId}
              options={
                templates.length > 0
                  ? templates.map((template) => ({
                      value: template.id,
                      label: `${template.name}${template.description ? ` - ${template.description}` : ''}`,
                    }))
                  : [{ value: '', label: 'テンプレートがありません' }]
              }
              placeholder="テンプレートを選択してください"
            />
          </div>
          <div className="pb-1">
            <Button
              variant="primary"
              size="md"
              onClick={handleApply}
              disabled={!selectedTemplateId || isLoading}
              icon={
                isLoading ? (
                  <svg
                    className="animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                )
              }
              iconPosition="left"
            >
              {isLoading ? '適用中...' : 'テンプレート適用'}
            </Button>
          </div>
        </div>

        {/* 選択したテンプレートの情報表示 */}
        {selectedTemplate && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">選択中のテンプレート</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>
                <span className="font-medium">テンプレート名:</span> {selectedTemplate.name}
              </div>
              {selectedTemplate.description && (
                <div>
                  <span className="font-medium">説明:</span> {selectedTemplate.description}
                </div>
              )}
              <div>
                <span className="font-medium">作成日時:</span>{' '}
                {format(new Date(selectedTemplate.createdAt), 'yyyy年MM月dd日 HH:mm')}
              </div>
              {selectedTemplate.projectInfo && (
                <div>
                  <span className="font-medium">見積番号:</span>{' '}
                  {selectedTemplate.projectInfo.estimateNumber || '（未設定）'}
                </div>
              )}
              {selectedTemplate.tableData && selectedTemplate.tableData.length > 0 && (
                <div>
                  <span className="font-medium">データ行数:</span> {selectedTemplate.tableData.length}行
                </div>
              )}
            </div>
          </div>
        )}

        {/* メッセージ表示 */}
        {message && (
          <div
            className={`
              p-4 rounded-lg border
              ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : ''}
              ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : ''}
              ${message.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
            `}
          >
            <div className="flex items-start">
              {message.type === 'success' && (
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {message.type === 'error' && (
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <p className="text-sm flex-1">{message.text}</p>
              <button
                onClick={() => setMessage(null)}
                className="ml-2 flex-shrink-0"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* テンプレートが存在しない場合のメッセージ */}
        {templates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>保存されたテンプレートがありません。</p>
            <p className="text-sm mt-2">ヘッダーの「テンプレート保存」ボタンからテンプレートを保存できます。</p>
          </div>
        )}
      </div>
    </div>
  );
};

