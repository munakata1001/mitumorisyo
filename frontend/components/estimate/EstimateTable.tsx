'use client';

import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import type { EstimateTableRow, ApprovalInfo } from '@/types/estimate';

interface EstimateTableProps {
  data: EstimateTableRow[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, data: Partial<EstimateTableRow>) => void;
  approvalInfo?: ApprovalInfo;
  onApprovalChange?: (info: ApprovalInfo) => void;
}

export const EstimateTable: React.FC<EstimateTableProps> = ({
  data,
  onAdd,
  onRemove,
  onUpdate,
  approvalInfo,
  onApprovalChange,
}) => {
  const totalAmount = data.reduce((sum, row) => sum + (row.price || 0), 0);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [dimensionData, setDimensionData] = useState<EstimateTableRow['dimensions'] | null>(null);

  // 寸法データを文字列にフォーマット
  const formatDimensions = (dimensions: EstimateTableRow['dimensions']): string => {
    if (!dimensions) return '';
    
    const parts: string[] = [];
    if (dimensions.length) parts.push(`L${dimensions.length}`);
    if (dimensions.width) parts.push(`W${dimensions.width}`);
    if (dimensions.height) parts.push(`H${dimensions.height}`);
    if (dimensions.thickness) parts.push(`T${dimensions.thickness}`);
    if (dimensions.diameter) parts.push(`Φ${dimensions.diameter}`);
    if (dimensions.radius) parts.push(`R${dimensions.radius}`);
    if (dimensions.custom) parts.push(dimensions.custom);
    
    return parts.join(' × ') || '';
  };

  // 寸法文字列を解析してDimensionDataに変換（簡易版）
  const parseDimensions = (value: string): Partial<EstimateTableRow['dimensions']> => {
    if (!value.trim()) return {};
    
    // カスタム寸法として扱う
    const result: any = {};
    
    // パターンマッチングで寸法を抽出（簡易版）
    const lengthMatch = value.match(/L(\d+\.?\d*)/i);
    const widthMatch = value.match(/W(\d+\.?\d*)/i);
    const heightMatch = value.match(/H(\d+\.?\d*)/i);
    const thicknessMatch = value.match(/T(\d+\.?\d*)/i);
    const diameterMatch = value.match(/[Φφ](\d+\.?\d*)/);
    const radiusMatch = value.match(/R(\d+\.?\d*)/i);
    
    if (lengthMatch) result.length = parseFloat(lengthMatch[1]);
    if (widthMatch) result.width = parseFloat(widthMatch[1]);
    if (heightMatch) result.height = parseFloat(heightMatch[1]);
    if (thicknessMatch) result.thickness = parseFloat(thicknessMatch[1]);
    if (diameterMatch) result.diameter = parseFloat(diameterMatch[1]);
    if (radiusMatch) result.radius = parseFloat(radiusMatch[1]);
    
    // 数値以外の部分をカスタムとして扱う
    const customParts = value.split(/[×\s]/).filter(part => {
      const trimmed = part.trim();
      return trimmed && !trimmed.match(/^[LWHTrφΦ]\d+\.?\d*$/i);
    });
    if (customParts.length > 0) {
      result.custom = customParts.join(' ');
    }
    
    return result;
  };

  const handleDimensionClick = (row: EstimateTableRow) => {
    setDimensionData(row.dimensions || { partType: row.partType || '' });
    setSelectedRowId(row.id);
  };

  const handleDimensionSave = () => {
    if (selectedRowId && dimensionData) {
      onUpdate(selectedRowId, { dimensions: dimensionData });
      setSelectedRowId(null);
      setDimensionData(null);
    }
  };

  const handleDimensionClose = () => {
    setSelectedRowId(null);
    setDimensionData(null);
  };

  const selectedRow = data.find((row) => row.id === selectedRowId);

  return (
    <div className="p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">原価明細</h2>
        <Button variant="primary" size="md" onClick={onAdd}>
          行を追加
        </Button>
      </div>

      {/* 凡例 */}
      <div className="mb-4 flex gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-50 border border-yellow-200"></div>
          <span>自動入力行</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border border-blue-200"></div>
          <span>テンプレート差分</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-700">
              <th className="border border-gray-600 p-2 text-left text-sm font-medium text-white">型式</th>
              <th className="border border-gray-600 p-2 text-left text-sm font-medium text-white">名称</th>
              <th className="border border-gray-600 p-2 text-left text-sm font-medium text-white">Part Type</th>
              <th className="border border-gray-600 p-2 text-left text-sm font-medium text-white">材質</th>
              <th className="border border-gray-600 p-2 text-left text-sm font-medium text-white">寸法</th>
              <th className="border border-gray-600 p-2 text-left text-sm font-medium text-white">数量</th>
              <th className="border border-gray-600 p-2 text-left text-sm font-medium text-white">重量</th>
              <th className="border border-gray-600 p-2 text-left text-sm font-medium text-white">単価</th>
              <th className="border border-gray-600 p-2 text-left text-sm font-medium text-white">価格</th>
              <th className="border border-gray-600 p-2 text-left text-sm font-medium text-white">自動</th>
              <th className="border border-gray-600 p-2 text-left text-sm font-medium text-white">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={11} className="border p-8 text-center text-gray-500">
                  データがありません。行を追加してください。
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className={`
                    ${row.isAutoInput ? 'bg-yellow-50' : ''}
                    ${row.isTemplateDiff ? 'bg-blue-50' : ''}
                    hover:bg-gray-50
                  `}
                >
                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.modelNumber}
                      onChange={(e) => onUpdate(row.id, { modelNumber: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => onUpdate(row.id, { name: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.partType}
                      disabled
                      className="w-full px-2 py-1 border rounded text-sm bg-gray-100"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.material}
                      onChange={(e) => onUpdate(row.id, { material: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                  </td>
                  <td className="border p-2">
                    <div className="flex items-center gap-1">
                      <div className="flex-1 bg-yellow-50 rounded border border-gray-300 px-1 py-0.5 min-w-0">
                        <div className="flex items-center gap-1">
                          <label className="text-xs text-gray-600 whitespace-nowrap">t 板厚</label>
                          <input
                            type="number"
                            value={row.dimensions?.thickness || ''}
                            onChange={(e) => onUpdate(row.id, { 
                              dimensions: { 
                                ...row.dimensions, 
                                partType: row.partType || '',
                                thickness: Number(e.target.value) || undefined 
                              } 
                            })}
                            className="flex-1 bg-transparent border-none p-0.5 text-xs focus:outline-none min-w-0 w-12"
                            placeholder=""
                          />
                          <select
                            value="mm"
                            onChange={() => {}}
                            className="bg-transparent border-none text-xs text-gray-600 focus:outline-none cursor-pointer"
                            disabled
                          >
                            <option value="mm">mm</option>
                          </select>
                        </div>
                      </div>
                      <span className="text-gray-600 font-bold text-xs">×</span>
                      <div className="flex-1 bg-yellow-50 rounded border border-gray-300 px-1 py-0.5 min-w-0">
                        <div className="flex items-center gap-1">
                          <label className="text-xs text-gray-600 whitespace-nowrap">φ 内径</label>
                          <input
                            type="number"
                            value={row.dimensions?.diameter || ''}
                            onChange={(e) => onUpdate(row.id, { 
                              dimensions: { 
                                ...row.dimensions, 
                                partType: row.partType || '',
                                diameter: Number(e.target.value) || undefined 
                              } 
                            })}
                            className="flex-1 bg-transparent border-none p-0.5 text-xs focus:outline-none min-w-0 w-12"
                            placeholder=""
                          />
                          <select
                            value="mm"
                            onChange={() => {}}
                            className="bg-transparent border-none text-xs text-gray-600 focus:outline-none cursor-pointer"
                            disabled
                          >
                            <option value="mm">mm</option>
                          </select>
                        </div>
                      </div>
                      <span className="text-gray-600 font-bold text-xs">×</span>
                      <div className="flex-1 bg-yellow-50 rounded border border-gray-300 px-1 py-0.5 min-w-0">
                        <div className="flex items-center gap-1">
                          <label className="text-xs text-gray-600 whitespace-nowrap">長さ</label>
                          <input
                            type="number"
                            value={row.dimensions?.length || ''}
                            onChange={(e) => onUpdate(row.id, { 
                              dimensions: { 
                                ...row.dimensions, 
                                partType: row.partType || '',
                                length: Number(e.target.value) || undefined 
                              } 
                            })}
                            className="flex-1 bg-transparent border-none p-0.5 text-xs focus:outline-none min-w-0 w-12"
                            placeholder=""
                          />
                          <span className="text-xs text-gray-600">L</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) => onUpdate(row.id, { quantity: Number(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border rounded text-sm"
                      min={0}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={row.weight}
                      disabled
                      className="w-full px-2 py-1 border rounded text-sm bg-gray-100"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={row.unitPrice}
                      onChange={(e) => onUpdate(row.id, { unitPrice: Number(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border rounded text-sm"
                      min={0}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={row.price}
                      disabled
                      className="w-full px-2 py-1 border rounded text-sm bg-gray-100"
                    />
                  </td>
                  <td className="border p-2">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={row.isAuto || false}
                        onChange={(e) => onUpdate(row.id, { isAuto: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">自動</label>
                    </div>
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => onRemove(row.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {data.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={8} className="border p-2 text-right font-bold">
                  合計
                </td>
                <td className="border p-2 font-bold">
                  {data.reduce((sum, row) => sum + (row.price || 0), 0).toLocaleString('ja-JP')}円
                </td>
                <td className="border p-2"></td>
                <td className="border p-2"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* 右下に合計金額を表示 */}
      <div className="mt-4 flex justify-end">
        <div className="bg-gray-100 border border-gray-300 rounded-lg px-6 py-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-600 font-medium">合計金額:</span>
            <span className={`text-xl font-bold ${totalAmount === 0 ? 'text-red-500' : 'text-gray-900'}`}>
              {totalAmount.toLocaleString('ja-JP')}円
            </span>
          </div>
        </div>
      </div>

      {/* 査印欄 */}
      {approvalInfo && onApprovalChange && (
        <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-white">
          <h3 className="font-bold text-gray-700 mb-4">査印欄</h3>
          <div className="flex flex-row gap-4 items-end">
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">最終承認者</label>
              <div className="w-24 h-24 border-2 border-gray-400 bg-white flex items-center justify-center">
                <input
                  type="text"
                  value={approvalInfo.finalApprover || ''}
                  onChange={(e) => onApprovalChange({ ...approvalInfo, finalApprover: e.target.value })}
                  placeholder=""
                  className="w-full h-full text-center font-medium text-gray-800 focus:outline-none bg-transparent border-none"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">査印4</label>
              <div className="w-24 h-24 border-2 border-gray-400 bg-white flex items-center justify-center">
                <input
                  type="text"
                  value={approvalInfo.seal4 || ''}
                  onChange={(e) => onApprovalChange({ ...approvalInfo, seal4: e.target.value })}
                  placeholder=""
                  className="w-full h-full text-center font-medium text-gray-800 focus:outline-none bg-transparent border-none"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">査印3</label>
              <div className="w-24 h-24 border-2 border-gray-400 bg-white flex items-center justify-center">
                <input
                  type="text"
                  value={approvalInfo.seal3 || ''}
                  onChange={(e) => onApprovalChange({ ...approvalInfo, seal3: e.target.value })}
                  placeholder=""
                  className="w-full h-full text-center font-medium text-gray-800 focus:outline-none bg-transparent border-none"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">査印2</label>
              <div className="w-24 h-24 border-2 border-gray-400 bg-white flex items-center justify-center">
                <input
                  type="text"
                  value={approvalInfo.seal2 || ''}
                  onChange={(e) => onApprovalChange({ ...approvalInfo, seal2: e.target.value })}
                  placeholder=""
                  className="w-full h-full text-center font-medium text-gray-800 focus:outline-none bg-transparent border-none"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">査印1</label>
              <div className="w-24 h-24 border-2 border-gray-400 bg-white flex items-center justify-center">
                <input
                  type="text"
                  value={approvalInfo.seal1 || ''}
                  onChange={(e) => onApprovalChange({ ...approvalInfo, seal1: e.target.value })}
                  placeholder=""
                  className="w-full h-full text-center font-medium text-gray-800 focus:outline-none bg-transparent border-none"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">担当者</label>
              <div className="w-24 h-24 border-2 border-gray-400 bg-white flex items-center justify-center">
                <input
                  type="text"
                  value={approvalInfo.personInCharge || ''}
                  onChange={(e) => onApprovalChange({ ...approvalInfo, personInCharge: e.target.value })}
                  placeholder=""
                  className="w-full h-full text-center font-medium text-gray-800 focus:outline-none bg-transparent border-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 寸法入力モーダル */}
      <Modal
        isOpen={selectedRowId !== null}
        onClose={handleDimensionClose}
        title=""
        size="lg"
        showCloseButton={false}
      >
        {dimensionData && (
          <div>
            {/* ヘッダー */}
            <div className="bg-blue-700 text-white px-4 py-2 -mx-6 -mt-4 mb-4 rounded-t flex items-center justify-between">
              <h3 className="text-lg font-medium">寸法入力</h3>
              <button
                onClick={handleDimensionClose}
                className="text-white hover:text-gray-200 focus:outline-none"
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

            {/* 入力フィールド */}
            <div className="space-y-4">
              {/* 1行目: t 板厚 × φ 内径 × 長さ L */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-yellow-50 rounded border border-gray-300 p-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 whitespace-nowrap">t 板厚</label>
                    <div className="flex-1 flex items-center gap-1">
                      <input
                        type="number"
                        value={dimensionData.thickness || ''}
                        onChange={(e) => setDimensionData({ ...dimensionData, thickness: Number(e.target.value) || undefined })}
                        className="flex-1 bg-transparent border-none p-1 text-sm focus:outline-none"
                        placeholder=""
                      />
                      <select
                        value="mm"
                        onChange={() => {}}
                        className="bg-transparent border-none text-xs text-gray-600 focus:outline-none cursor-pointer"
                      >
                        <option value="mm">mm</option>
                      </select>
                    </div>
                  </div>
                </div>
                <span className="text-gray-600 font-bold">×</span>
                <div className="flex-1 bg-yellow-50 rounded border border-gray-300 p-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 whitespace-nowrap">φ 内径</label>
                    <div className="flex-1 flex items-center gap-1">
                      <input
                        type="number"
                        value={dimensionData.diameter || ''}
                        onChange={(e) => setDimensionData({ ...dimensionData, diameter: Number(e.target.value) || undefined })}
                        className="flex-1 bg-transparent border-none p-1 text-sm focus:outline-none"
                        placeholder=""
                      />
                      <select
                        value="mm"
                        onChange={() => {}}
                        className="bg-transparent border-none text-xs text-gray-600 focus:outline-none cursor-pointer"
                      >
                        <option value="mm">mm</option>
                      </select>
                    </div>
                  </div>
                </div>
                <span className="text-gray-600 font-bold">×</span>
                <div className="flex-1 bg-yellow-50 rounded border border-gray-300 p-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 whitespace-nowrap">長さ</label>
                    <div className="flex-1 flex items-center gap-1">
                      <input
                        type="number"
                        value={dimensionData.length || ''}
                        onChange={(e) => setDimensionData({ ...dimensionData, length: Number(e.target.value) || undefined })}
                        className="flex-1 bg-transparent border-none p-1 text-sm focus:outline-none"
                        placeholder=""
                      />
                      <span className="text-xs text-gray-600">L</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2行目: 単品重 */}
              <div className="flex items-center">
                <div className="w-full bg-yellow-50 rounded border border-gray-300 p-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 whitespace-nowrap">単品重</label>
                    <div className="flex-1 flex items-center">
                      <input
                        type="number"
                        value={selectedRow?.weight || ''}
                        disabled
                        className="flex-1 bg-transparent border-none p-1 text-sm focus:outline-none"
                        placeholder=""
                      />
                      <span className="text-xs text-gray-600 ml-1">kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3行目: t 板厚 × φ 内径 × 枚数 */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-yellow-50 rounded border border-gray-300 p-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 whitespace-nowrap">t 板厚</label>
                    <div className="flex-1 flex items-center gap-1">
                      <input
                        type="number"
                        value={dimensionData.thickness || ''}
                        onChange={(e) => setDimensionData({ ...dimensionData, thickness: Number(e.target.value) || undefined })}
                        className="flex-1 bg-transparent border-none p-1 text-sm focus:outline-none"
                        placeholder=""
                      />
                      <select
                        value="mm"
                        onChange={() => {}}
                        className="bg-transparent border-none text-xs text-gray-600 focus:outline-none cursor-pointer"
                      >
                        <option value="mm">mm</option>
                      </select>
                    </div>
                  </div>
                </div>
                <span className="text-gray-600 font-bold">×</span>
                <div className="flex-1 bg-yellow-50 rounded border border-gray-300 p-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 whitespace-nowrap">φ 内径</label>
                    <div className="flex-1 flex items-center gap-1">
                      <input
                        type="number"
                        value={dimensionData.diameter || ''}
                        onChange={(e) => setDimensionData({ ...dimensionData, diameter: Number(e.target.value) || undefined })}
                        className="flex-1 bg-transparent border-none p-1 text-sm focus:outline-none"
                        placeholder=""
                      />
                      <select
                        value="mm"
                        onChange={() => {}}
                        className="bg-transparent border-none text-xs text-gray-600 focus:outline-none cursor-pointer"
                      >
                        <option value="mm">mm</option>
                      </select>
                    </div>
                  </div>
                </div>
                <span className="text-gray-600 font-bold">×</span>
                <div className="flex-1 bg-yellow-50 rounded border border-gray-300 p-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 whitespace-nowrap">枚数</label>
                    <div className="flex-1 flex items-center">
                      <input
                        type="number"
                        value={selectedRow?.quantity || ''}
                        disabled
                        className="flex-1 bg-transparent border-none p-1 text-sm focus:outline-none"
                        placeholder=""
                      />
                      <span className="text-xs text-gray-600 ml-1">枚</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="md"
                onClick={handleDimensionClose}
              >
                キャンセル
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleDimensionSave}
              >
                保存
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

