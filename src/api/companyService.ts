import { api } from './apiClient';

export interface Company {
  companyId: number;
  companyName: string;
  taxCode?: string;
  industry?: string;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  maxInterns: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyCreateDTO {
  companyName: string;
  taxCode?: string;
  industry?: string;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  maxInterns: number;
}

export interface CompanyQueryParams {
  page?: number;
  size?: number;
  search?: string;
  active?: boolean;
}

export const companyService = {
  getCompanies: async (params?: CompanyQueryParams): Promise<Company[]> => {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.active !== undefined) searchParams.append('active', params.active.toString());

    const query = searchParams.toString();
    const endpoint = `/api/companies${query ? `?${query}` : ''}`;
    return api.get<Company[]>(endpoint);
  },

  getCompanyById: async (id: number): Promise<Company> => {
    return api.get<Company>(`/api/companies/${id}`);
  },

  createCompany: async (body: CompanyCreateDTO): Promise<Company> => {
    return api.post<Company>('/api/companies', body);
  },

  updateCompany: async (id: number, body: CompanyCreateDTO): Promise<Company> => {
    return api.put<Company>(`/api/companies/${id}`, body);
  },

  updateStatus: async (id: number, isActive: boolean): Promise<Company> => {
    return api.put<Company>(`/api/companies/${id}/status`, { isActive });
  },

  deleteCompany: async (id: number): Promise<void> => {
    return api.delete<void>(`/api/companies/${id}`);
  },
};
