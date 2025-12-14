import * as SQLite from 'expo-sqlite';

let db = null;
let dbInitialized = false;

/**
 * Force database reinitialization (useful after schema changes)
 */
export const reinitializeDatabase = async () => {
  dbInitialized = false;
  db = null;
  return await initDatabase();
};

/**
 * Initialize the SQLite database and create tables if needed
 */
export const initDatabase = async () => {
  try {
    if (dbInitialized && db) {
      return true;
    }
    
    db = await SQLite.openDatabaseAsync('notely.db');
    
    // Create notes table with explicit INTEGER type for isLocked
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        isLocked INTEGER NOT NULL DEFAULT 0,
        tags TEXT DEFAULT '[]',
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
    `);
    
    // Clean up any corrupted isLocked values (ensure they are 0 or 1)
    await db.execAsync(`
      UPDATE notes SET isLocked = 0 WHERE isLocked IS NULL OR (isLocked != 0 AND isLocked != 1);
    `);
    
    // Migration: Add tags column if it doesn't exist
    try {
      await db.execAsync(`
        ALTER TABLE notes ADD COLUMN tags TEXT DEFAULT '[]';
      `);
      console.log('Added tags column to existing database');
    } catch (error) {
      // Column already exists, ignore error
      if (!error.message.includes('duplicate column name')) {
        console.log('Tags column already exists or migration not needed');
      }
    }
    
    dbInitialized = true;
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    dbInitialized = false;
    return false;
  }
};

/**
 * Get all notes sorted by updatedAt descending
 */
export const getAllNotes = async () => {
  try {
    if (!db) {
      console.error('Database not initialized!');
      return [];
    }
    
    const result = await db.getAllAsync(
      'SELECT * FROM notes ORDER BY updatedAt DESC',
      []
    );
    
    // Ensure isLocked is a number and tags is an array
    return (result || []).map(note => ({
      ...note,
      isLocked: Number(note.isLocked),
      tags: note.tags ? JSON.parse(note.tags) : []
    }));
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

/**
 * Get a single note by ID
 */
export const getNoteById = async (id) => {
  try {
    if (!db) {
      await initDatabase();
    }
    const result = await db.getFirstAsync(
      'SELECT * FROM notes WHERE id = ?',
      [id]
    );
    // Ensure isLocked is a number and tags is an array
    if (result) {
      result.isLocked = Number(result.isLocked);
      result.tags = result.tags ? JSON.parse(result.tags) : [];
    }
    return result;
  } catch (error) {
    console.error('Error fetching note:', error);
    return null;
  }
};

/**
 * Create a new note
 */
export const createNote = async (title, content, isLocked = 0, tags = []) => {
  try {
    if (!db) {
      await initDatabase();
    }
    const now = Date.now();
    const result = await db.runAsync(
      'INSERT INTO notes (title, content, isLocked, tags, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, Number(isLocked), JSON.stringify(tags), now, now]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error creating note:', error);
    return null;
  }
};

/**
 * Update an existing note
 */
export const updateNote = async (id, title, content, isLocked, tags = []) => {
  try {
    if (!db) {
      await initDatabase();
    }
    const now = Date.now();
    await db.runAsync(
      'UPDATE notes SET title = ?, content = ?, isLocked = ?, tags = ?, updatedAt = ? WHERE id = ?',
      [title, content, Number(isLocked), JSON.stringify(tags), now, id]
    );
    return true;
  } catch (error) {
    console.error('Error updating note:', error);
    return false;
  }
};

/**
 * Delete a note by ID
 */
export const deleteNote = async (id) => {
  try {
    if (!db) {
      await initDatabase();
    }
    await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    return false;
  }
};

/**
 * Search notes by title or content
 */
export const searchNotes = async (query) => {
  try {
    if (!db) {
      await initDatabase();
    }
    const searchTerm = `%${query}%`;
    const result = await db.getAllAsync(
      'SELECT * FROM notes WHERE title LIKE ? OR content LIKE ? ORDER BY updatedAt DESC',
      [searchTerm, searchTerm]
    );
    // Ensure isLocked is a number and tags is an array
    return (result || []).map(note => ({
      ...note,
      isLocked: Number(note.isLocked),
      tags: note.tags ? JSON.parse(note.tags) : []
    }));
  } catch (error) {
    console.error('Error searching notes:', error);
    return [];
  }
};
