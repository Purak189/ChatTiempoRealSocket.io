import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const db = createClient({
  url: 'libsql://civil-lilith-purak189.turso.io',
  authToken: process.env.DB_TOKEN,
});

const testConnection = async () => {
  try {
    const result = await db.execute('SELECT 1');
    console.log('Connection test passed:', result);
  } catch (error) {
    console.error('Connection test failed:', error);
  }
};

const createUsers = async () => {
  try {
    const result = await db.execute(`
      INSERT INTO users (username, password_hash, role)
      VALUES
      ('profe1', '1234', 'admin'),
      ('jair', '1234', 'student'),
      ('alexandra','1234', 'student');
    `);
    console.log('Users created:', result);
  } catch (error) {
    console.error('Table creation failed:', error);
  }
}

const createCLassrooms = async () => {
  try {
    const result = await db.execute(`
      INSERT INTO classrooms (name, description)
      VALUES
      ('clase1', 'Clase de prueba'),
      ('clase2', 'Clase de prueba'),
      ('clase3', 'Clase de prueba');
    `);
    console.log('Classrooms created:', result);
  } catch (error) {
    console.error('Table creation failed:', error);
  }
}

testConnection();
createCLassrooms();
// createUsers();
