import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartattend_erp';
    await mongoose.connect(connStr, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected successfully to ${connStr}`);
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error.message || error);
    process.exit(1);
  }
};
