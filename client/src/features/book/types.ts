// client/src/features/book/types.ts

// Định nghĩa các kiểu cho dữ liệu đã được populate từ backend
// để code của chúng ta rõ ràng và an toàn hơn.

export interface PopulatedAuthor {
  _id: string;
  username: string;
  email?: string; // email có thể có hoặc không tùy vào API
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

/**
 * Interface đầy đủ cho một đối tượng sách (Book)
 * được trả về từ API, bao gồm cả các trường được populate.
 */
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
  status: 'draft' | 'in_review' | 'published' | 'rejected' | 'archived';
  publishedAt?: string | null; // Kiểu string vì JSON không có kiểu Date
  contentUpdatedAt: string;
  version: number;
  averageRating: number;
  totalRatings: number;
  viewsCount: number;
  estimatedReadingTime?: number | null;
  difficulty?: 'easy' | 'medium' | 'hard' | 'very_hard' | null;
  startNodeId: string;
  
  // Chúng ta có thể định nghĩa chi tiết các kiểu này sau khi làm tính năng đọc truyện
  storyNodes: any[]; 
  storyVariables?: any[];
  
  createdAt: string;
  updatedAt: string;
}