'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/common/Button';

interface FileUploadProps {
  onUpload?: (files: File[]) => Promise<void>;
  maxSize?: number; // デフォルト: 10MB
  acceptedTypes?: string[]; // デフォルト: ['.xlsx', '.xlsm', '.xls', '.pdf']
  maxFiles?: number; // デフォルト: 3
}

interface FileWithStatus extends File {
  status?: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export type ParseMode = '個別解析' | '2ファイル統合' | '3ファイル統合' | '2ファイル+価格参考';

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.xlsx', '.xlsm', '.xls', '.pdf'],
  maxFiles = 3,
}) => {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [parseMode, setParseMode] = useState<ParseMode>('個別解析');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイル検証
  const validateFiles = (newFiles: File[]): FileWithStatus[] => {
    const validFiles: FileWithStatus[] = [];
    const errors: string[] = [];

    newFiles.forEach((file) => {
      // ファイル数チェック
      if (files.length + validFiles.length >= maxFiles) {
        errors.push(`ファイル数が上限（${maxFiles}個）を超えています`);
        return;
      }

      // ファイル形式チェック
      const isValidType = acceptedTypes.some((type) =>
        file.name.toLowerCase().endsWith(type.toLowerCase())
      );

      if (!isValidType) {
        errors.push(`${file.name}: 対応していないファイル形式です（対応形式: ${acceptedTypes.join(', ')}）`);
        return;
      }

      // ファイルサイズチェック
      if (file.size > maxSize) {
        errors.push(
          `${file.name}: ファイルサイズが大きすぎます（最大${(maxSize / 1024 / 1024).toFixed(0)}MB）`
        );
        return;
      }

      // 重複チェック
      const isDuplicate = files.some((f) => f.name === file.name && f.size === file.size);
      if (isDuplicate) {
        errors.push(`${file.name}: 既に追加されています`);
        return;
      }

      validFiles.push({ ...file, status: 'pending' });
    });

    if (errors.length > 0) {
      setMessage({ type: 'error', text: errors.join('\n') });
      setTimeout(() => setMessage(null), 5000);
    }

    return validFiles;
  };

  // ファイル追加
  const handleFiles = (newFiles: File[]) => {
    const validFiles = validateFiles(newFiles);
    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      setMessage(null);
      
      // ファイル選択後にコールバックを呼び出し
      if (onUpload) {
        onUpload(updatedFiles).catch((error) => {
          setMessage({ 
            type: 'error', 
            text: error instanceof Error ? error.message : 'ファイルの処理に失敗しました' 
          });
        });
      }
    }
  };

  // ファイル選択ダイアログを開く
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // ファイル入力変更
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
    
    // 同じファイルを再度選択できるようにリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ファイル削除
  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setMessage(null);
    
    // ファイル削除後にコールバックを呼び出し
    if (onUpload) {
      onUpload(updatedFiles).catch((error) => {
        setMessage({ 
          type: 'error', 
          text: error instanceof Error ? error.message : 'ファイルの処理に失敗しました' 
        });
      });
    }
  };

  // 全ファイル削除
  const handleClearAll = () => {
    setFiles([]);
    setMessage(null);
    
    // ファイル削除後にコールバックを呼び出し
    if (onUpload) {
      onUpload([]).catch((error) => {
        setMessage({ 
          type: 'error', 
          text: error instanceof Error ? error.message : 'ファイルの処理に失敗しました' 
        });
      });
    }
  };

  // ファイルサイズをフォーマット
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // ファイルアイコンを取得
  const getFileIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith('.pdf')) {
      return (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H4z" />
      </svg>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800">ファイルアップロード</h2>

      <div className="space-y-4">
        {/* ファイル選択ボタン */}
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="md"
            onClick={handleFileSelect}
          >
            ファイルを選択
          </Button>
          
          <p className="text-sm text-gray-500">
            対応形式: {acceptedTypes.join(', ')} | 最大{formatFileSize(maxSize)} | 最大{maxFiles}個
          </p>
        </div>

        {/* ファイル一覧 */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                アップロード済みファイル ({files.length}個)
              </p>
              <button
                onClick={handleClearAll}
                className="text-sm text-red-600 hover:text-red-700"
              >
                すべて削除
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="削除"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 解析モード選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            解析モード
          </label>
          <div className="flex flex-wrap gap-3">
            {(['個別解析', '2ファイル統合', '3ファイル統合', '2ファイル+価格参考'] as ParseMode[]).map((mode) => (
              <Button
                key={mode}
                variant={parseMode === mode ? 'primary' : 'outline'}
                size="md"
                onClick={() => setParseMode(mode)}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

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
              {message.type === 'info' && (
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              <button
                onClick={() => setMessage(null)}
                className="ml-auto flex-shrink-0"
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
      </div>
    </div>
  );
};

