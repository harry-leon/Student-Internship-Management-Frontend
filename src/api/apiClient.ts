export interface ApiResponse<T> {
  success: boolean;
  status_code?: number;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface ApiError {
  success: boolean;
  status_code?: number;
  error_code?: string;
  message: string;
  errors?: any;
}

const TOKEN_KEY = 'study_mgmt_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    removeStoredToken();
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  let json: any;
  try {
    json = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }
    return {} as T;
  }

  if (!response.ok || (json && json.success === false)) {
    const errorMsg = json?.message || `Lỗi từ hệ thống (${response.status})`;
    throw new Error(errorMsg);
  }

  // If response is wrapped in SuccessResponse (has 'data' property)
  if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
    const data = json.data;
    // Unwrap Spring Data Pageable response wrapper { content: [...] }
    if (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
      const arr = [...data.content] as any;
      arr._page = {
        totalElements: data.totalElements ?? data.totalElementsCount ?? data.content.length,
        totalPages: data.totalPages ?? 1,
        pageNumber: data.number ?? data.pageable?.pageNumber ?? 0,
        pageSize: data.size ?? data.pageable?.pageSize ?? 10,
      };
      return arr as T;
    }
    return data as T;
  }

  return json as T;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

export const api = {
  get: <T>(url: string, options?: RequestInit) =>
    apiFetch<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(url, {
      ...options,
      method: 'POST',
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    }),

  put: <T>(url: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    }),

  delete: <T>(url: string, options?: RequestInit) =>
    apiFetch<T>(url, { ...options, method: 'DELETE' }),
};
