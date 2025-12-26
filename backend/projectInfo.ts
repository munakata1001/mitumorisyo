import type { ProjectInfo } from '@/types/estimate';

export interface ProjectInfoResponse {
  success: boolean;
  data?: ProjectInfo;
  errors?: Partial<Record<keyof ProjectInfo, string>>;
  message?: string;
  error?: string;
}

/**
 * 基本情報を保存する
 */
export async function saveProjectInfo(projectInfo: ProjectInfo): Promise<ProjectInfoResponse> {
  try {
    const response = await fetch('/api/project-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectInfo),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: '基本情報の保存に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 基本情報を取得する
 */
export async function getProjectInfo(id?: string, estimateNumber?: string): Promise<ProjectInfoResponse> {
  try {
    const params = new URLSearchParams();
    if (id) params.append('id', id);
    if (estimateNumber) params.append('estimateNumber', estimateNumber);

    const response = await fetch(`/api/project-info?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: '基本情報の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 基本情報を更新する
 */
export async function updateProjectInfo(id: string, projectInfo: ProjectInfo): Promise<ProjectInfoResponse> {
  try {
    const response = await fetch('/api/project-info', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...projectInfo }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: '基本情報の更新に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 基本情報をバリデーションする（クライアント側）
 */
export function validateProjectInfoClient(projectInfo: ProjectInfo): {
  isValid: boolean;
  errors: Partial<Record<keyof ProjectInfo, string>>;
} {
  const errors: Partial<Record<keyof ProjectInfo, string>> = {};

  if (!projectInfo.estimateNumber || projectInfo.estimateNumber.trim() === '') {
    errors.estimateNumber = '見積番号は必須です';
  }

  if (!projectInfo.customer || projectInfo.customer.trim() === '') {
    errors.customer = '客先は必須です';
  }

  if (!projectInfo.deliveryDestination || projectInfo.deliveryDestination.trim() === '') {
    errors.deliveryDestination = '向先は必須です';
  }

  if (!projectInfo.equipmentName || projectInfo.equipmentName.trim() === '') {
    errors.equipmentName = '機器名は必須です';
  }

  if (typeof projectInfo.productionQuantity !== 'number' || projectInfo.productionQuantity < 0) {
    errors.productionQuantity = '製作数量は0以上の数値で入力してください';
  }

  if (!projectInfo.productionUnit || !['台', '個', '式'].includes(projectInfo.productionUnit)) {
    errors.productionUnit = '単位を選択してください';
  }

  if (!projectInfo.deliveryDate) {
    errors.deliveryDate = '納期は必須です';
  } else if (isNaN(new Date(projectInfo.deliveryDate).getTime())) {
    errors.deliveryDate = '有効な日付を入力してください';
  }

  if (!projectInfo.model || projectInfo.model.trim() === '') {
    errors.model = '機種は必須です';
  }

  if (!projectInfo.equipmentShape || projectInfo.equipmentShape.trim() === '') {
    errors.equipmentShape = '機器形状は必須です';
  }

  if (typeof projectInfo.weight !== 'number' || projectInfo.weight < 0) {
    errors.weight = '重量は0以上の数値で入力してください';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

