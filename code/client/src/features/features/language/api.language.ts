// client/src/features/language/api.language.ts
import { axiosInstance } from '@/shared/api/axiosInstance';
import type { Language } from './types';

export interface GetLanguagesResponse {
  data: Language[];
  count: number;
}

export const getLanguages = async (): Promise<GetLanguagesResponse> => {
  const { data } = await axiosInstance.get<GetLanguagesResponse>('/languages?isActive=true');
  return data;
};