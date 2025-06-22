// client/src/features/Tag/types.ts
export interface Tag {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}
  export interface CreateTagInput {
    name: string;
    description?: string;
  }
  
  export type UpdateTagInput = Partial<CreateTagInput>;