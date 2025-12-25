'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { searchEstimates, type Estimate } from '@/lib/storage/localStorage';
import { format } from 'date-fns';

interface SearchEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (estimateId: string) => void;
}

export const SearchEstimateModal: React.FC<SearchEstimateModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Estimate[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen && searchQuery.trim()) {
      setIsSearching(true);
      const found = searchEstimates(searchQuery);
      setResults(found);
      setIsSearching(false);
    } else {
      setResults([]);
    }
  }, [searchQuery, isOpen]);

  const handleSelect = (estimateId: string) => {
    onSelect(estimateId);
    setSearchQuery('');
    setResults([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="既設データ検索"
      size="lg"
    >
      <div className="space-y-4">
        {/* 検索ボックス */}
        <div>
          <Input
            label="検索"
            name="search"
            type="text"
            value={searchQuery}
            onChange={(value) => setSearchQuery(String(value))}
            placeholder="見積番号、客先、機器名、機種で検索"
          />
        </div>

        {/* 検索結果 */}
        <div className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="text-center py-8 text-gray-500">検索中...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery.trim() ? '検索結果がありません' : '検索キーワードを入力してください'}
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((estimate) => (
                <div
                  key={estimate.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelect(estimate.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {estimate.projectInfo.estimateNumber}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(estimate.updatedAt), 'yyyy/MM/dd')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>客先: {estimate.projectInfo.customer}</div>
                        <div>機器名: {estimate.projectInfo.equipmentName}</div>
                        {estimate.projectInfo.model && (
                          <div>機種: {estimate.projectInfo.model}</div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(estimate.id);
                      }}
                    >
                      選択
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button variant="secondary" size="md" onClick={onClose}>
            閉じる
          </Button>
        </div>
      </div>
    </Modal>
  );
};

