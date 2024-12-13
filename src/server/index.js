import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';

import { Server } from 'socket.io';
import { createServer } from 'node:http';

import { PORT } from './config.js';

// Archivo de inicializacion de la base de datos
import { db } from  './config/dbInit.js';

dotenv.config();

const port = PORT ?? 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {
        timeout: 1000,
    }
});


io.on('connection', async (socket) => {
    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    })

    console.log('Auth:')
    console.log(socket.handshake.auth)

    socket.on('chat message', async (msg) => {
        let result
        let username = socket.handshake.auth.username ?? 'Anonymous'
        try {
            result = await db.execute({
                sql: 'INSERT INTO messages (content, user) VALUES (:msg, :username)',
                args: { msg, username }
            })
        } catch (error) {
            console.error(error)
            return
        }
        io.emit('chat message', msg, result.lastInsertRowid.toString(), username);
    })


    if (!socket.recovered) {
        try {
            const results = await db.execute({
                sql: 'SELECT id, content, user FROM messages WHERE id > ?',
                args: [socket.handshake.auth.serverOffset ?? 0]
            })

            results.rows.forEach(row => {
                socket.emit('chat message', row.content, row.id.toString(), row.user);
            })
        } catch (error) {
            console.error(error)
            return
        }
    }
})

app.use(logger('dev'));


app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html');
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});