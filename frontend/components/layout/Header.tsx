'use client';

import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { SearchEstimateModal } from '@/components/estimate/SearchEstimateModal';
import { SaveTemplateModal } from '@/components/estimate/SaveTemplateModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { ProjectInfo } from '@/types/estimate';

interface HeaderProps {
  isDirty?: boolean;
  projectInfo: ProjectInfo;
  onBack?: () => void;
  onEstimateLoad?: (estimateId: string) => void;
  onTemplateSave?: (templateName: string, description?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDirty = false,
  projectInfo,
  onBack,
  onEstimateLoad,
  onTemplateSave,
}) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const handleBackClick = () => {
    if (isDirty) {
      setPendingAction(() => () => {
        onBack?.();
      });
      setShowConfirmDialog(true);
    } else {
      onBack?.();
    }
  };

  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setShowConfirmDialog(false);
  };

  const handleCancel = () => {
    setPendingAction(null);
    setShowConfirmDialog(false);
  };

  const handleEstimateSelect = (estimateId: string) => {
    onEstimateLoad?.(estimateId);
    setShowSearchModal(false);
  };

  const handleTemplateSave = (name: string, description?: string) => {
    onTemplateSave?.(name, description);
    setShowSaveTemplateModal(false);
  };

  return (
    <>
      <header className="bg-gray-100 border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 左側: 戻るボタン */}
            <div className="flex items-center">
              <Button
                variant="outline"
                size="md"
                onClick={handleBackClick}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                }
                iconPosition="left"
              >
                トップに戻る
              </Button>
            </div>

            {/* 右側: 検索とテンプレート保存ボタン */}
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowSearchModal(true)}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
                iconPosition="left"
              >
                既設データ検索
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => setShowSaveTemplateModal(true)}
                disabled={!projectInfo.estimateNumber}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                }
                iconPosition="left"
              >
                テンプレート保存
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 検索モーダル */}
      <SearchEstimateModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={handleEstimateSelect}
      />

      {/* テンプレート保存モーダル */}
      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSave={handleTemplateSave}
        projectInfo={projectInfo}
      />

      {/* 確認ダイアログ */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="未保存の変更があります"
        message="変更が保存されていません。このまま戻りますか？"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText="戻る"
        cancelText="キャンセル"
        variant="danger"
      />
    </>
  );
};

