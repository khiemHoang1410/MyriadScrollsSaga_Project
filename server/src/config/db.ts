// server/src/config/db.ts
import mongoose from 'mongoose';


const MONGODB_URI = process.env.MONGODB_URI; 
const connectDB = async () => {
  if (!MONGODB_URI) {
    console.error('------------------------------------------------------------');
    console.error('FATAL ERROR: MONGODB_URI is not defined.');
    console.error('1. Ensure server/.env file exists and has MONGODB_URI.');
    console.error('2. Ensure dotenv.config() is called at the VERY TOP of server/src/index.ts.');
    console.error('------------------------------------------------------------');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected Successfully! 🎉🔗');
  } catch (err: any) {
    console.error('------------------------------------------------------------');
    console.error('MongoDB Connection Failed! 😭:', err.message);
    console.error('------------------------------------------------------------');
    process.exit(1);
  }
};

export default connectDB;