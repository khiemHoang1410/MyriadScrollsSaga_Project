// client/src/features/language/api.language.ts
import { axiosInstance } from '@/shared/api/axiosInstance';
import type { Language, CreateLanguageInput, UpdateLanguageInput } from './types';

// GET ALL
export const getLanguages = async (): Promise<Language[]> => {
  const { data } = await axiosInstance.get<{ data: Language[] }>('/languages');
  return data.data;
};

// CREATE
export const createLanguage = async (languageData: CreateLanguageInput): Promise<Language> => {
  const { data } = await axiosInstance.post<{ data: Language }>('/languages', languageData);
  return data.data;
};

// UPDATE
export const updateLanguage = async (languageId: string, languageData: UpdateLanguageInput): Promise<Language> => {
  const { data } = await axiosInstance.put<{ data: Language }>(`/languages/${languageId}`, languageData);
  return data.data;
};

// DELETE
export const deleteLanguage = async (languageId: string): Promise<void> => {
  await axiosInstance.delete(`/languages/${languageId}`);
};