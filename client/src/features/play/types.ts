import type { Book } from "../book";

export interface ContentBlock {
  type: 'text' | 'image' | 'dialogue' | 'audio_sfx' | 'audio_bgm';
  value: any;
  characterName?: string | null;
  characterAvatar?: string | null;
}

export interface Choice {
  choiceId: string;
  text: string;
  nextNodeId: string;
  conditions?: ChoiceCondition[]; // <-- BỔ SUNG TRƯỜNG NÀY

  // Ta không cần hiển thị conditions và effects ở frontend lúc chơi
}
export interface ChoiceCondition {
  variableName: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' | 'contains' | 'notContains' | 'isDefined' | 'isUndefined';
  comparisonValue: any;
}
export interface PageNode {
  nodeId: string;
  title?: string | null;
  nodeType: 'story' | 'ending' | 'puzzle' | 'minigame_link' | 'transition';
  contentBlocks: ContentBlock[];
  choices?: Choice[];
  autoNavigateToNodeId?: string | null;
}

// Đây là kiểu dữ liệu cho toàn bộ trạng thái của cuộc chơi
export interface PlayState {
  book: Book;
  currentNode: PageNode;
  availableChoices: Choice[];
  variablesState: Record<string, any>; // Biến của câu chuyện, ví dụ: { score: 10, hasKey: true }
  isBookCompletedOverall?: boolean;
  currentEndingId?: string | null;
  fontFamily?: string | null;
}