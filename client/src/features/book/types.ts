// src/features/book/types.ts
export interface Book {
    _id: string;
    title: string;
    description?: string | null;
    coverImageUrl?: string | null;
    author: {
      _id: string;
      username: string;
    };
  }