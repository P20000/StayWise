const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri && process.env.NODE_ENV === 'production') {
    console.error('[DATABASE] FATAL ERROR: MONGO_URI environment variable is not defined in production!');
    console.error('[DATABASE] Please set MONGO_URI in your Render Dashboard settings (e.g., mongodb+srv://username:password@cluster.mongodb.net/dbname).');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri || 'mongodb://localhost:27017/staywise_dev', {
      retryWrites: true,
      w: 'majority',
    });
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DATABASE] Connection Error: ${error.message}`);
    // Do not terminate process in dev if DB is offline, allow graceful retry
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
