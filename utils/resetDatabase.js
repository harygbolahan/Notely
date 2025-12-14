import * as SQLite from 'expo-sqlite';

/**
 * Completely reset the database - USE WITH CAUTION
 * This will delete all notes and recreate the database
 */
export const resetDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('notely.db');
    
    // Drop the existing table
    await db.execAsync('DROP TABLE IF EXISTS notes;');
    
    // Recreate the table with proper schema
    await db.execAsync(`
      CREATE TABLE notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        isLocked INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
    `);
    
    console.log('Database reset successfully');
    return true;
  } catch (error) {
    console.error('Database reset error:', error);
    return false;
  }
};
