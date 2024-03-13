import { init } from './db/mongodb.js'; // Importo la función 'init' para inicializar la conexión a MongoDB.
import http from 'http'; // Importo el módulo HTTP para crear el servidor HTTP.
import app from './app.js'; // Importo la aplicación Express.
import config from './config/envConfig.js'; // Importo la configuración del entorno.
import { Server } from 'socket.io'; // Importo la clase 'Server' de Socket.IO para manejar conexiones en tiempo real.

// Creo un servidor HTTP a partir de la aplicación Express.
const server = http.createServer(app);

const PORT = config.port; // Puerto de la aplicación.

// Creo un servidor de sockets (Socket.IO) adjunto al servidor HTTP.
export const socketServer = new Server(server, {
    cors: {
        origin: `http://localhost:${PORT}`, // Origen permitido para CORS.
        methods: ["GET", "POST"] // Métodos HTTP permitidos.
}});

// Manejo de eventos de conexión y desconexión de clientes.
socketServer.on('connection', (socket) => {
    console.log('Un usuario se ha conectado.'); // Mensaje de registro cuando un usuario se conecta.
    socket.on('disconnect', () => {
        console.log('Usuario desconectado.'); // Mensaje de registro cuando un usuario se desconecta.
    });
    socket.on('new message', (message) => {
        socketServer.emit('new message', message); // Reenvío del mensaje a todos los clientes conectados.
    });
});

await init(); // Inicializo la conexión a MongoDB.

// Pongo en marcha el servidor HTTP para escuchar en el puerto especificado.
server.listen(PORT, () => {
    console.log(`"Servidor ejecutándose en http://localhost:${PORT}"`); // Mensaje de registro del servidor en la consola.
});