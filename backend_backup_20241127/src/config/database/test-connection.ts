import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  try {
    const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_CLUSTER, MONGODB_MAIN_DB } = process.env;

    if (!MONGODB_USERNAME || !MONGODB_PASSWORD || !MONGODB_CLUSTER) {
      throw new Error('Missing database configuration in environment variables');
    }

    const uri = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}/?retryWrites=true&w=majority&appName=Cluster0`;
    
    console.log('Attempting to connect to MongoDB Atlas...');
    console.log('Connection string (password hidden):', 
      uri.replace(MONGODB_PASSWORD, '****'));

    await mongoose.connect(uri, {
      dbName: MONGODB_MAIN_DB
    });

    console.log('Successfully connected to MongoDB Atlas!');
    
    // ทดสอบการเขียนข้อมูล
    const TestModel = mongoose.model('Test', new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    }));

    // สร้างข้อมูลทดสอบ
    const testDoc = await TestModel.create({ 
      name: 'test_connection',
      createdAt: new Date()
    });
    
    console.log('Successfully created test document:', testDoc._id);

    // อ่านข้อมูลทดสอบ
    const foundDoc = await TestModel.findById(testDoc._id);
    console.log('Successfully retrieved test document:', foundDoc?.name);

    // ลบข้อมูลทดสอบ
    await TestModel.deleteMany({});
    console.log('Successfully cleaned up test data');

    // ปิดการเชื่อมต่อ
    await mongoose.disconnect();
    console.log('Connection closed successfully');

  } catch (error: any) {
    console.error('Connection Error:', error.message);
    if (error.codeName) {
      console.error('Error Code:', error.code, error.codeName);
    }
    process.exit(1);
  }
}

testConnection();