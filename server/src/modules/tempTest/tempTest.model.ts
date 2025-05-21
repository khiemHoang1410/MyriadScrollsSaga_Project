// server/src/modules/tempTest/tempTest.model.ts
import mongoose, { Document, Schema, model } from 'mongoose';

// 1. Interface siêu đơn giản
export interface ITempTest extends Document {
  testName?: string;
  hookMessage?: string;
}

// 2. Schema siêu đơn giản
const TempTestSchema = new Schema<ITempTest>({
  testName: String,
  hookMessage: String,
});

// 3. Pre-save hook với console.log "nguyên thủy"
TempTestSchema.pre<ITempTest>('save', function(next) {
  // Log này phải hiện ra nếu hook được gọi
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log('!!! TEMP TEST PRE-SAVE HOOK CALLED !!! Test Name:', this.testName);
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  this.hookMessage = `Hook processed: ${this.testName} at ${new Date().toISOString()}`;
  next();
});

// 4. Compile model với tên khác
const TempTestModel = model<ITempTest>('TempTest', TempTestSchema);

export default TempTestModel;