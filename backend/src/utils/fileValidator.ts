/**
 * ファイル検証ユーティリティ
 */

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['.xlsx', '.xlsm', '.xls', '.pdf'];

/**
 * ファイル形式をチェック
 */
export function validateFileType(filename: string): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return ACCEPTED_TYPES.includes(extension);
}

/**
 * ファイルサイズをチェック
 */
export function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

/**
 * ファイルを検証
 */
export function validateFile(file: { name: string; size: number }): FileValidationResult {
  const errors: string[] = [];

  if (!validateFileType(file.name)) {
    errors.push(`${file.name}: 対応していないファイル形式です（対応形式: ${ACCEPTED_TYPES.join(', ')}）`);
  }

  if (!validateFileSize(file.size)) {
    errors.push(`${file.name}: ファイルサイズが大きすぎます（最大${MAX_FILE_SIZE / 1024 / 1024}MB）`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 複数ファイルを検証
 */
export function validateFiles(
  files: Array<{ name: string; size: number }>,
  maxFiles: number = 3
): FileValidationResult {
  const errors: string[] = [];

  if (files.length > maxFiles) {
    errors.push(`ファイル数が上限（${maxFiles}個）を超えています`);
  }

  // 重複チェック
  const fileNames = files.map(f => `${f.name}-${f.size}`);
  const uniqueNames = new Set(fileNames);
  if (fileNames.length !== uniqueNames.size) {
    errors.push('重複したファイルが検出されました');
  }

  // 各ファイルの検証
  files.forEach(file => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      errors.push(...validation.errors);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

