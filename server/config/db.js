const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/iconsuniverse', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MongoDB Atlas directly: ${error.message}`);
    console.warn(`[Database Warning] Running in memory/mock fallback mode for local development if DB is unreachable.`);
  }
};

module.exports = connectDB;
