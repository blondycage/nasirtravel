import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('[MongoDB] Using cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('[MongoDB] Creating new connection...');
    console.log('[MongoDB] URI exists:', !!MONGODB_URI);
    console.log('[MongoDB] URI starts with:', MONGODB_URI.substring(0, 20));

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('[MongoDB] Connection successful');
      return mongoose;
    }).catch((error) => {
      console.error('[MongoDB] Connection error:', {
        message: error.message,
        code: error.code,
        name: error.name
      });
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    console.error('[MongoDB] Failed to establish connection:', e.message);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
