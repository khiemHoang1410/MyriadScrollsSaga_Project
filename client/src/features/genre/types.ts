// client/src/features/genre/types.ts
export interface Genre {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}
  export interface CreateGenreInput {
    name: string;
    description?: string;
  }
  
  export type UpdateGenreInput = Partial<CreateGenreInput>;