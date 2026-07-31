import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartattend_erp';
    await mongoose.connect(connStr, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected successfully`);
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error.message || error);
  }
};
