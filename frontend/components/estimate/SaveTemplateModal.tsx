'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import type { ProjectInfo } from '@/types/estimate';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
  projectInfo: ProjectInfo;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectInfo,
}) => {
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!templateName.trim()) {
      setError('テンプレート名は必須です');
      return;
    }

    if (templateName.length > 50) {
      setError('テンプレート名は50文字以内で入力してください');
      return;
    }

    if (description.length > 200) {
      setError('説明は200文字以内で入力してください');
      return;
    }

    setError('');
    onSave(templateName.trim(), description.trim() || undefined);
    setTemplateName('');
    setDescription('');
  };

  const handleClose = () => {
    setTemplateName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="テンプレート保存"
      size="md"
    >
      <div className="space-y-4">
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* テンプレート名 */}
        <Input
          label="テンプレート名"
          name="templateName"
          type="text"
          value={templateName}
          onChange={(value) => setTemplateName(String(value))}
          placeholder="テンプレート名を入力"
          required
          error={error && !templateName.trim() ? error : undefined}
        />

        {/* 説明 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明（任意）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="テンプレートの説明を入力（任意）"
            rows={3}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            {description.length}/200文字
          </p>
        </div>

        {/* プレビュー情報 */}
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm font-medium text-gray-700 mb-2">保存される情報:</p>
          <div className="text-sm text-gray-600 space-y-1">
            <div>見積番号: {projectInfo.estimateNumber || '（未入力）'}</div>
            <div>客先: {projectInfo.customer || '（未入力）'}</div>
            <div>機器名: {projectInfo.equipmentName || '（未入力）'}</div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" size="md" onClick={handleClose}>
            キャンセル
          </Button>
          <Button variant="primary" size="md" onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
    </Modal>
  );
};

