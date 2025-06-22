// client/src/features/language/types.ts
export interface Language {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}
  export interface CreateLanguageInput {
    name: string;
    description?: string;
  }
  
  export type UpdateLanguageInput = Partial<CreateLanguageInput>;