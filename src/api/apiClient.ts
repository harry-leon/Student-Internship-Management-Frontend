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
  timestamp?: string;
}

export class ApiClientError extends Error implements ApiError {
  success = false;
  status_code?: number;
  error_code?: string;
  errors?: any;
  timestamp?: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status_code = error.status_code;
    this.error_code = error.error_code;
    this.errors = error.errors;
    this.timestamp = error.timestamp;
  }
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

const isLoginEndpoint = (endpoint: string): boolean => endpoint.includes('/api/auth/login');

function toUserMessage(status: number, errorCode?: string, backendMessage?: string): string {
  if (status === 401) {
    if (errorCode === 'BAD_CREDENTIALS') {
      return 'Tên đăng nhập hoặc mật khẩu không đúng.';
    }
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }

  if (status === 403) {
    return 'Bạn không có quyền thực hiện thao tác này.';
  }

  if (status === 404) {
    return backendMessage || 'Không tìm thấy dữ liệu.';
  }

  if (status === 502 || status === 503 || status === 504) {
    return 'Hệ thống tạm thời không khả dụng. Vui lòng thử lại sau.';
  }

  if (status >= 500) {
    return 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.';
  }

  return backendMessage || `Lỗi từ hệ thống (${status})`;
}

async function handleResponse<T>(response: Response, endpoint: string): Promise<T> {
  let json: any = null;
  try {
    json = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new ApiClientError({
        success: false,
        status_code: response.status,
        message: toUserMessage(response.status, undefined, response.statusText),
      });
    }
    return {} as T;
  }

  if (response.status === 401 && !isLoginEndpoint(endpoint)) {
    removeStoredToken();
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  if (!response.ok || (json && json.success === false)) {
    const statusCode = json?.status_code ?? response.status;
    const errorCode = json?.error_code;
    const message = toUserMessage(statusCode, errorCode, json?.message);

    throw new ApiClientError({
      success: false,
      status_code: statusCode,
      error_code: errorCode,
      message,
      errors: json?.errors,
      timestamp: json?.timestamp,
    });
  }

  if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
    const data = json.data;
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

  return handleResponse<T>(response, endpoint);
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
