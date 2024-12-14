import { db } from '../config/dbInit.js';

const handleSocketConnection = async (socket, io) => {

// Aquí, podrías validar al usuario antes de permitirle unirse a una sala
//   socket.on('authenticate', async (authData, callback) => {
//     try {
//       // Validar al usuario con los datos enviados (puede ser username y contraseña)
//       const user = await validateUser(authData.username, authData.password);
//       if (user) {
//         socket.username = user.username; // Guardar el username en la sesión del socket
//         socket.emit('authenticated', { username: user.username });
//       } else {
//         socket.emit('auth error', 'Invalid credentials');
//       }
//     } catch (err) {
//       console.error('Authentication error', err);
//       socket.emit('auth error', 'Something went wrong');
//     }
//   });

  // Permite que los usuarios se unan a una sala
  
//   socket.on('join room', (room, callback) => {
//     // Validar si el usuario tiene permisos para unirse a la sala
//     if (isUserAllowedToJoin(socket.username, room)) {
//       socket.join(room);
//       socket.emit('joined room', room);
//       console.log(`${socket.username} joined room: ${room}`);
//     } else {
//       socket.emit('join error', 'You are not allowed to join this room');
//     }
//   });

  // Manejar el envío de mensajes
  
  socket.on('chat message', async (msg) => {
        let result
        let username = socket.handshake.auth.username ?? 'Anonymous';
        console.log('username: ' + username);
        
        try {
            result = await db.execute({
                sql: 'INSERT INTO messages (content, user_id, classroom_id) VALUES (:msg, (SELECT id FROM users WHERE username = :username LIMIT 1), 1)',
                args: { msg, username }
            })
        } catch (error) {
            console.error(error)
            return
        }
        io.emit('chat message', msg, result.lastInsertRowid.toString(), username);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
  
  if (!socket.recovered) {
    try {
        const results = await db.execute({
            sql: `
            SELECT m.id, m.content, m.user_id, u.username as user 
            FROM messages m 
            JOIN users u ON m.user_id = u.id
            WHERE m.classroom_id = :classroom_id AND m.id > :last_id
            `,

           args: { classroom_id: 1, last_id: socket.handshake.auth.serverOffset ?? 0 }
        })

        results.rows.forEach(row => {
            socket.emit('chat message', row.content, row.id.toString(), row.user);
        })
    } catch (error) {
        console.error(error)
        return
    }
}

};

// Función para validar usuarios (en este caso, solo verificamos nombre de usuario, pero puede ser más complejo)
const validateUser = async (username, password) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = :username AND password_hash = :password',
      args: { username, password },
    });
    if (result.rows.length > 0) {
      return result.rows[0]; // Retorna el usuario si es válido
    }
    return null; // Usuario no válido
  } catch (error) {
    console.error('Error in user validation:', error);
    return null;
  }
};

// Función para verificar si el usuario tiene permiso para unirse a la sala
const isUserAllowedToJoin = (username, room) => {
  // Implementar lógica de permisos: ejemplo simple de roles
  if (room === 'admin' && username !== 'admin') {
    return false;
  }
  return true;
};

export default handleSocketConnection;
