import { initializeDatabase } from './index.js';

async function setup() {
    try {
        await initializeDatabase();
        console.log('✅ Database schema created successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error setting up database:', err);
        process.exit(1);
    }
}

setup();
