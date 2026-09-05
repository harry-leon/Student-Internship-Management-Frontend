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
      return 'T\u00ean \u0111\u0103ng nh\u1eadp ho\u1eb7c m\u1eadt kh\u1ea9u kh\u00f4ng \u0111\u00fang.';
    }
    return 'Phi\u00ean \u0111\u0103ng nh\u1eadp \u0111\u00e3 h\u1ebft h\u1ea1n. Vui l\u00f2ng \u0111\u0103ng nh\u1eadp l\u1ea1i.';
  }

  if (status === 403) {
    return 'B\u1ea1n kh\u00f4ng c\u00f3 quy\u1ec1n th\u1ef1c hi\u1ec7n thao t\u00e1c n\u00e0y.';
  }

  if (status === 404) {
    return backendMessage || 'Kh\u00f4ng t\u00ecm th\u1ea5y d\u1eef li\u1ec7u.';
  }

  if (status === 502 || status === 503 || status === 504) {
    return 'H\u1ec7 th\u1ed1ng t\u1ea1m th\u1eddi kh\u00f4ng kh\u1ea3 d\u1ee5ng. Vui l\u00f2ng th\u1eed l\u1ea1i sau.';
  }

  if (status >= 500) {
    return '\u0110\u00e3 x\u1ea3y ra l\u1ed7i h\u1ec7 th\u1ed1ng. Vui l\u00f2ng th\u1eed l\u1ea1i sau.';
  }

  return backendMessage || `L\u1ed7i t\u1eeb h\u1ec7 th\u1ed1ng (${status})`;
}

async function handleResponse<T>(response: Response, endpoint: string): Promise<T> {
  let json: any = null;
  try {
    json = await response.json();
  } catch (err) {
    if (!response.ok) {
      const isLikelyProxyOrNetworkFailure = response.status >= 500;
      throw new ApiClientError({
        success: false,
        status_code: isLikelyProxyOrNetworkFailure ? 503 : response.status,
        error_code: isLikelyProxyOrNetworkFailure ? 'SERVICE_UNAVAILABLE' : undefined,
        message: isLikelyProxyOrNetworkFailure
          ? 'H\u1ec7 th\u1ed1ng t\u1ea1m th\u1eddi kh\u00f4ng kh\u1ea3 d\u1ee5ng. Vui l\u00f2ng th\u1eed l\u1ea1i sau.'
          : toUserMessage(response.status, undefined, response.statusText),
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
  }).catch(() => {
    throw new ApiClientError({
      success: false,
      status_code: 503,
      error_code: 'SERVICE_UNAVAILABLE',
      message: 'H\u1ec7 th\u1ed1ng t\u1ea1m th\u1eddi kh\u00f4ng kh\u1ea3 d\u1ee5ng. Vui l\u00f2ng th\u1eed l\u1ea1i sau.',
    });
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
