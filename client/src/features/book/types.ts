// client/src/features/book/types.ts

// 1. Đảm bảo enum BookStatus được export
export enum BookStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

// ... (các interface PopulatedAuthor, PopulatedTerm... giữ nguyên) ...
export interface PopulatedAuthor {
  _id: string;
  username: string;
  email?: string;
}
export interface PopulatedTerm {
  _id: string;
  name: string;
  slug: string;
}
export interface PopulatedLanguage {
  _id: string;
  name: string;
  code: string;
}


// 2. Cập nhật interface Book để dùng BookStatus enum
export interface Book {
  _id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImageUrl?: string | null;
  author: PopulatedAuthor;
  genres: PopulatedTerm[];
  tags: PopulatedTerm[];
  bookLanguage: PopulatedLanguage;
  fontFamily?: string | null;
  status: BookStatus; // <-- DÙNG ENUM Ở ĐÂY
  publishedAt?: string | null;
  contentUpdatedAt: string;
  version: number;
  averageRating: number;
  totalRatings: number;
  viewsCount: number;
  estimatedReadingTime?: number | null;
  difficulty?: 'easy' | 'medium' | 'hard' | 'very_hard' | null;
  startNodeId: string;
  storyNodes: any[];
  storyVariables?: any[];
  createdAt: string;
  updatedAt: string;
}

// 3. Cập nhật GetBooksParams để dùng BookStatus enum
export interface GetBooksParams {
  status?: BookStatus; // <-- DÙNG ENUM Ở ĐÂY
}

// 4. THÊM `status` VÀO CreateBookInput ĐỂ FIX LỖI
export interface CreateBookInput {
  title: string;
  description?: string;
  coverImageUrl?: string;
  status?: BookStatus; // <-- THÊM DÒNG NÀY ĐỂ FIX LỖI
  fontFamily?: string; 
}

export type UpdateBookInput = Partial<CreateBookInput>;