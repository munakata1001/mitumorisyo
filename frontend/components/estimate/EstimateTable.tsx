'use client';

import React from 'react';
import { Button } from '@/components/common/Button';
import type { EstimateTableRow } from '@/types/estimate';

interface EstimateTableProps {
  data: EstimateTableRow[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, data: Partial<EstimateTableRow>) => void;
}

export const EstimateTable: React.FC<EstimateTableProps> = ({
  data,
  onAdd,
  onRemove,
  onUpdate,
}) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">原価明細</h2>
        <Button variant="primary" size="md" onClick={onAdd}>
          行を追加
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>データがありません。行を追加してください。</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left text-sm font-medium text-gray-700">型式</th>
                <th className="border p-2 text-left text-sm font-medium text-gray-700">名称</th>
                <th className="border p-2 text-left text-sm font-medium text-gray-700">Part Type</th>
                <th className="border p-2 text-left text-sm font-medium text-gray-700">材質</th>
                <th className="border p-2 text-left text-sm font-medium text-gray-700">数量</th>
                <th className="border p-2 text-left text-sm font-medium text-gray-700">重量</th>
                <th className="border p-2 text-left text-sm font-medium text-gray-700">単価</th>
                <th className="border p-2 text-left text-sm font-medium text-gray-700">価格</th>
                <th className="border p-2 text-left text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
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
                    <button
                      onClick={() => onRemove(row.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={7} className="border p-2 text-right font-bold">
                  合計
                </td>
                <td className="border p-2 font-bold">
                  {data.reduce((sum, row) => sum + (row.price || 0), 0).toLocaleString('ja-JP')}円
                </td>
                <td className="border p-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* 凡例 */}
      <div className="mt-4 flex gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-50 border border-yellow-200"></div>
          <span>自動入力行</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border border-blue-200"></div>
          <span>テンプレート差分</span>
        </div>
      </div>
    </div>
  );
};

