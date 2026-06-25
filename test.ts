import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://127.0.0.1:27017');

async function testConnection() {
    try {
        await client.connect();

        await client.db('admin').command({ ping: 1 });

        console.log('✅ MongoDB is connected and responding');
    } catch (error: any) {
        console.error('❌ MongoDB connection failed:', error.message);
    } finally {
        await client.close();
    }
}

testConnection();