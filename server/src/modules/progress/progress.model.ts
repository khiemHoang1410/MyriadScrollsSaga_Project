// server/src/modules/progress/progress.model.ts
import mongoose, { Document, Schema, model, Types } from 'mongoose';

export interface IUserBookProgress extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  currentNodeId: string | null;
  variablesState: Types.Map<any>; 
  completedNodes: string[];
  completedEndings: string[];
  lastPlayedAt: Date;
  startedAt: Date;
  isCompletedOverall: boolean;
  // createdAt, updatedAt sẽ được Mongoose tự động thêm qua timestamps: true
}

const UserBookProgressSchema = new Schema<IUserBookProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    currentNodeId: { type: String, default: null },
    variablesState: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    completedNodes: { type: [String], default: [] },
    completedEndings: { type: [String], default: [] },
    lastPlayedAt: { type: Date, default: Date.now, index: true },
    startedAt: {type: Date, default: Date.now },
    isCompletedOverall: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

UserBookProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

const UserBookProgressModel = model<IUserBookProgress>('UserBookProgress', UserBookProgressSchema);

export default UserBookProgressModel;