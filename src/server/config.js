import { config } from 'dotenv';

config();

export const PORT = 3000;
export const HOST = `http://localhost:${PORT}`;

export const DB_URL = 'libsql://civil-lilith-purak189.turso.io';
export const DB_TOKEN_TURSO = process.env.DB_TOKEN;