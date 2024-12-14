import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';

import { Server } from 'socket.io';
import { createServer } from 'node:http';

import { PORT } from './config.js';

// Archivo de inicializacion de la base de datos
import handleSocketConnection from './controllers/socketController.js';

import { db } from './config/dbInit.js';

dotenv.config();

const port = PORT ?? 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {
        timeout: 1000,
    }
});

// Endpoint para validar usuario
app.get('/validateUser', async (req, res) => {
    const { username } = req.query;

    try {
        const userResult = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (userResult.rows.length > 0) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    } catch (err) {
        console.error('Error checking user:', err);
        return res.status(500).json({ exists: false });
    }
});

io.on('connection', async(socket) => {
    console.log('User connected', socket.id);

    await handleSocketConnection(socket, io);
})

app.use(logger('dev'));


app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/src/client/index.html');
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});