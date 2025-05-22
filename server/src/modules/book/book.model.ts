// src/modules/book/book.model.ts
import mongoose, { Document, Schema, model, Types } from 'mongoose';
import { logger } from '@/config'; // Để ghi log debug và error
import { generateSlug } from '@/utils'; // Import từ barrel file của utils

// --- Enums ---
export enum ContentBlockType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO_SFX = 'audio_sfx',
  AUDIO_BGM = 'audio_bgm',
  DIALOGUE = 'dialogue',
  VARIABLE_SET = 'variable_set',
}

export enum ChoiceConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
  LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains',
  IS_DEFINED = 'isDefined',
  IS_UNDEFINED = 'isUndefined',
}

export enum ChoiceEffectOperator {
  SET = 'set',
  ADD = 'add',
  SUBTRACT = 'subtract',
  PUSH = 'push',
  PULL = 'pull',
  INCREMENT = 'increment',
  DECREMENT = 'decrement',
  TOGGLE_BOOLEAN = 'toggleBoolean',
}

export enum BookStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export enum BookDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  VERY_HARD = 'very_hard',
}

export enum PageNodeType {
  STORY = 'story',
  PUZZLE = 'puzzle',
  MINIGAME_LINK = 'minigame_link',
  ENDING = 'ending',
  TRANSITION = 'transition',
}

export enum StoryVariableType {
  NUMBER = 'number',
  STRING = 'string',
  BOOLEAN = 'boolean',
  ARRAY_STRING = 'array_string',
  ARRAY_NUMBER = 'array_number',
}

export enum StoryVariableScope {
  PLAYER_VISIBLE = 'player_visible',
  INTERNAL_ONLY = 'internal_only',
}

// --- Interfaces for Subdocuments ---
export interface IContentBlock extends Document {
  type: ContentBlockType;
  value: any;
  characterName?: string | null;
  characterAvatar?: string | null;
}

export interface IChoiceCondition extends Document {
  variableName: string;
  operator: ChoiceConditionOperator;
  comparisonValue?: any;
}

export interface IChoiceEffect extends Document {
  variableName: string;
  operator: ChoiceEffectOperator;
  value?: any;
}

export interface IChoice extends Document {
  choiceId: string;
  text: string;
  nextNodeId: string;
  conditions?: Types.DocumentArray<IChoiceCondition>;
  effects?: Types.DocumentArray<IChoiceEffect>;
  isHiddenInitially?: boolean;
  feedbackText?: string | null;
}

export interface IPageNode extends Document {
  nodeId: string;
  title?: string | null;
  nodeType: PageNodeType;
  contentBlocks: Types.DocumentArray<IContentBlock>;
  choices?: Types.DocumentArray<IChoice>;
  autoNavigateToNodeId?: string | null;
}

export interface IStoryVariableDefinition extends Document {
  name: string;
  type: StoryVariableType;
  initialValue: any;
  scope: StoryVariableScope;
  description?: string | null;
}

// --- Main Book Interface ---
export interface IBook extends Document {
  title: string;
  slug: string;
  description?: string | null;
  coverImageUrl?: string | null;
  author: Types.ObjectId; // ref 'User'
  genres: Types.ObjectId[]; // ref 'Genre'
  tags: Types.ObjectId[];   // ref 'Tag'
  bookLanguage: Types.ObjectId; // << ĐỔI TÊN TỪ language
  status: BookStatus;
  publishedAt?: Date | null;
  contentUpdatedAt: Date;
  version: number;
  averageRating: number;
  totalRatings: number;
  viewsCount: number;
  estimatedReadingTime?: number | null;
  difficulty?: BookDifficulty | null;
  startNodeId: string;
  storyNodes: Types.DocumentArray<IPageNode>;
  storyVariables?: Types.DocumentArray<IStoryVariableDefinition>;
}

// --- Mongoose Schemas for Subdocuments ---
const ContentBlockSchema = new Schema<IContentBlock>({
  type: { type: String, enum: Object.values(ContentBlockType), required: true },
  value: { type: Schema.Types.Mixed, required: true },
  characterName: { type: String, trim: true, default: null },
  characterAvatar: { type: String, trim: true, default: null },
}, { _id: false });

const ChoiceConditionSchema = new Schema<IChoiceCondition>({
  variableName: { type: String, required: true, trim: true },
  operator: { type: String, enum: Object.values(ChoiceConditionOperator), required: true },
  comparisonValue: { type: Schema.Types.Mixed },
}, { _id: false });

const ChoiceEffectSchema = new Schema<IChoiceEffect>({
  variableName: { type: String, required: true, trim: true },
  operator: { type: String, enum: Object.values(ChoiceEffectOperator), required: true },
  value: { type: Schema.Types.Mixed },
}, { _id: false });

const ChoiceSchema = new Schema<IChoice>({
  choiceId: { type: String, required: true, default: () => new Types.ObjectId().toHexString() }, // Unique validation at application level
  text: { type: String, required: true, trim: true, maxlength: 500 },
  nextNodeId: { type: String, required: true, trim: true },
  conditions: { type: [ChoiceConditionSchema], default: [] },
  effects: { type: [ChoiceEffectSchema], default: [] },
  isHiddenInitially: { type: Boolean, default: false },
  feedbackText: { type: String, trim: true, maxlength: 300, default: null },
}, { _id: false });

const PageNodeSchema = new Schema<IPageNode>({
  nodeId: { type: String, required: true, trim: true }, // Unique validation at application level
  title: { type: String, trim: true, maxlength: 250, default: null },
  nodeType: { type: String, enum: Object.values(PageNodeType), required: true, default: PageNodeType.STORY },
  contentBlocks: { type: [ContentBlockSchema], default: [] },
  choices: { type: [ChoiceSchema], default: [] },
  autoNavigateToNodeId: { type: String, trim: true, default: null },
});

const StoryVariableDefinitionSchema = new Schema<IStoryVariableDefinition>({
  name: { type: String, required: true, trim: true }, // Unique validation at application level
  type: { type: String, enum: Object.values(StoryVariableType), required: true },
  initialValue: { type: Schema.Types.Mixed, required: true },
  scope: { type: String, enum: Object.values(StoryVariableScope), required: true, default: StoryVariableScope.INTERNAL_ONLY },
  description: { type: String, trim: true, maxlength: 500, default: null },
}, { _id: false });

// --- Main Book Schema ---
const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: [true, 'Book title is required.'], unique: true, trim: true, maxlength: 200 },
    slug: { type: String, unique: true, trim: true, lowercase: true },
    description: { type: String, trim: true, maxlength: 3000, default: null },
    coverImageUrl: { type: String, trim: true, default: null },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    genres: [{ type: Schema.Types.ObjectId, ref: 'Genre', index: true }],
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag', index: true }],
    bookLanguage: { type: Schema.Types.ObjectId, ref: 'Language', required: true, index: true }, // << ĐỔI TÊN TỪ language
    status: { type: String, enum: Object.values(BookStatus), default: BookStatus.DRAFT, required: true, index: true },
    publishedAt: { type: Date, default: null },
    contentUpdatedAt: { type: Date, default: Date.now, required: true },
    version: { type: Number, default: 1, min: 1 },
    averageRating: { type: Number, default: 0, min: 0, max: 5, index: true },
    totalRatings: { type: Number, default: 0, min: 0 },
    viewsCount: { type: Number, default: 0, min: 0 },
    estimatedReadingTime: { type: Number, min: 0, default: null },
    difficulty: { type: String, enum: Object.values(BookDifficulty), default: null, index: true },
    startNodeId: { type: String, required: [true, 'Start node ID is required.'], trim: true },
    storyNodes: { type: [PageNodeSchema], default: [] },
     storyVariables: { type: [StoryVariableDefinitionSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

// --- Indexes ---
BookSchema.index({ title: 'text', description: 'text', slug: 'text' });

// --- Hooks ---
BookSchema.pre<IBook>('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === BookStatus.PUBLISHED && !this.publishedAt) {
      this.publishedAt = new Date();
    } else if (this.status !== BookStatus.PUBLISHED) {
      this.publishedAt = null; // Set to null if not published
    }
  }

  // Cập nhật contentUpdatedAt nên được xử lý ở service khi có thay đổi thực sự về nội dung
  // if (this.isModified('storyNodes') || this.isModified('storyVariables')) {
  // this.contentUpdatedAt = new Date();
  // }

  if ((this.isModified('title') || this.isNew) && this.title) {
    const generated = generateSlug(this.title);
    if (generated) {
      this.slug = generated;
    } else {
      logger.error(`[BookModel Pre-Save Hook] Slug could not be generated for title: "${this.title}".`);
      // Cân nhắc ném lỗi ở đây nếu slug là bắt buộc và không thể tạo
      // return next(new Error(`Could not generate slug from title "${this.title}".`));
    }
  }
  if (this.isNew && !this.slug && this.title) {
      const fallbackSlug = generateSlug(this.title);
      if (fallbackSlug) {
        this.slug = fallbackSlug;
      } else {
        // Nếu slug là bắt buộc (như trong schema `required: true`), việc này sẽ gây lỗi khi save nếu title không tạo được slug
        // Có thể bỏ `required: true` cho slug trong schema và chỉ dựa vào hook + validation ở Zod/Service
        // Hoặc đảm bảo title luôn có thể tạo slug qua Zod validation
        logger.error(`[BookModel Pre-Save Hook] CRITICAL: Slug is still missing and could not be generated for new book: "${this.title}".`);
        return next(new Error(`Critical: Slug could not be generated for title "${this.title}".`));
      }
  }

  next();
});

const BookModel = model<IBook>('Book', BookSchema);
export default BookModel;