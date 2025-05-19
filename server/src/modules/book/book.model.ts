import mongoose, { Document, Schema, model, Types } from 'mongoose';

// Bỏ ENUMS BookGenre vì Genre sẽ là Model riêng
// Các ENUMS khác như ContentBlockType, ChoiceConditionOperator, ChoiceEffectOperator vẫn giữ nguyên

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
}

export enum ChoiceEffectOperator {
  SET = 'set',
  ADD = 'add',
  SUBTRACT = 'subtract',
  PUSH = 'push',
  PULL = 'pull',
}

// --- Interfaces for Subdocuments (Giữ nguyên như trước) ---
export interface IContentBlock extends Document {
  type: ContentBlockType;
  value: string;
  characterName?: string;
  characterAvatar?: string;
}

export interface IChoiceCondition extends Document {
  variableName: string;
  operator: ChoiceConditionOperator;
  comparisonValue: any;
}

export interface IChoiceEffect extends Document {
  variableName: string;
  operator: ChoiceEffectOperator;
  value: any;
}

export interface IChoice extends Document {
  choiceId?: string;
  text: string;
  nextNodeId: string;
  conditions?: Types.DocumentArray<IChoiceCondition>;
  effects?: Types.DocumentArray<IChoiceEffect>;
}

export interface IPageNode extends Document {
  nodeId: string;
  title?: string;
  contentBlocks: Types.DocumentArray<IContentBlock>;
  choices?: Types.DocumentArray<IChoice>;
  isEndingNode?: boolean;
  autoNavigateToNodeId?: string;
}

export interface IStoryVariableDefinition extends Document {
  name: string;
  initialValue: any;
  description?: string;
}

// --- Main Book Interface (Cập nhật genres, tags, language) ---
export interface IBook extends Document {
  title: string;
  description?: string;
  coverImageUrl?: string;
  author: Types.ObjectId;
  genres: Types.ObjectId[]; // << THAY ĐỔI: Mảng các ObjectId tham chiếu đến GenreModel
  tags: Types.ObjectId[];   // << THAY ĐỔI: Mảng các ObjectId tham chiếu đến TagModel
  language: Types.ObjectId; // << THAY ĐỔI: Một ObjectId tham chiếu đến LanguageModel
  isPublished: boolean;
  publishedAt?: Date;
  version: number;
  averageRating: number;
  totalRatings: number;
  startNodeId: string;
  storyNodes: Types.DocumentArray<IPageNode>;
  storyVariables?: Types.DocumentArray<IStoryVariableDefinition>;
}

// --- Mongoose Schemas for Subdocuments (Giữ nguyên như trước) ---
const ContentBlockSchema = new Schema<IContentBlock>({
  type: { type: String, enum: Object.values(ContentBlockType), required: true },
  value: { type: Schema.Types.Mixed, required: true },
  characterName: { type: String },
  characterAvatar: { type: String },
}, { _id: false });

const ChoiceConditionSchema = new Schema<IChoiceCondition>({
  variableName: { type: String, required: true },
  operator: { type: String, enum: Object.values(ChoiceConditionOperator), required: true },
  comparisonValue: { type: Schema.Types.Mixed, required: true },
}, { _id: false });

const ChoiceEffectSchema = new Schema<IChoiceEffect>({
  variableName: { type: String, required: true },
  operator: { type: String, enum: Object.values(ChoiceEffectOperator), required: true },
  value: { type: Schema.Types.Mixed, required: true },
}, { _id: false });

const ChoiceSchema = new Schema<IChoice>({
  choiceId: { type: String },
  text: { type: String, required: true, trim: true },
  nextNodeId: { type: String, required: true, trim: true },
  conditions: [ChoiceConditionSchema],
  effects: [ChoiceEffectSchema],
}, { _id: false });

const PageNodeSchema = new Schema<IPageNode>({
  nodeId: { type: String, required: true, trim: true },
  title: { type: String, trim: true },
  contentBlocks: { type: [ContentBlockSchema], default: [] },
  choices: { type: [ChoiceSchema], default: [] },
  isEndingNode: { type: Boolean, default: false },
  autoNavigateToNodeId: { type: String, trim: true },
});

const StoryVariableDefinitionSchema = new Schema<IStoryVariableDefinition>({
  name: { type: String, required: true, trim: true },
  initialValue: { type: Schema.Types.Mixed, required: true },
  description: { type: String, trim: true },
}, { _id: false });

// --- Main Book Schema (Cập nhật genres, tags, language) ---
const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, unique: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    coverImageUrl: { type: String, trim: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    genres: [{ type: Schema.Types.ObjectId, ref: 'Genre' }], // << THAY ĐỔI
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],     // << THAY ĐỔI
    language: { type: Schema.Types.ObjectId, ref: 'Language', required: true }, // << THAY ĐỔI
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    version: { type: Number, default: 1, min: 1 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0, min: 0 },
    startNodeId: { type: String, required: true, trim: true },
    storyNodes: { type: [PageNodeSchema], default: [] },
    storyVariables: { type: [StoryVariableDefinitionSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

// --- Indexes (Cập nhật nếu cần, ví dụ không còn index cho genre kiểu string nữa) ---
BookSchema.index({ title: 'text', description: 'text' }); // Giữ lại tìm kiếm text cơ bản
// BookSchema.index({ genres: 1 }); // Index cho mảng ObjectId
// BookSchema.index({ tags: 1 });   // Index cho mảng ObjectId
// BookSchema.index({ language: 1 });
BookSchema.index({ author: 1 });
BookSchema.index({ averageRating: -1 });

BookSchema.pre('save', function (next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const BookModel = model<IBook>('Book', BookSchema);
export default BookModel;