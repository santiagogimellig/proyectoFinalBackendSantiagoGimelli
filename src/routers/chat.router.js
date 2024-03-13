// Importo el módulo Router de Express para definir las rutas de la aplicación.
import { Router } from 'express';
// Importo el controlador necesario para manejar las operaciones relacionadas con los mensajes del chat.
import messagesController from "../controller/chat.controller.js"
// Importo la función authenticateLevel desde un archivo de utilidades para gestionar la autenticación de nivel.
import { authenticateLevel } from '../utils/utils.js';

// Creo una instancia del enrutador de Express.
const router = Router();

// Defino una ruta GET para acceder al chat.
router.get('/chat', authenticateLevel(3), async (req, res) => {
    // Obtengo la información del usuario autenticado.
    const user = req.user;
    // Obtengo todos los mensajes del chat.
    const messages = await messagesController.find();
    // Elimino la información innecesaria de los mensajes obtenidos.
    const cleanMessages = messages.map(message => ({ userEmail: message.userEmail, message: message.message }));
    // Renderizo una vista con los mensajes limpios y la información del usuario.
    res.render('chat', { messages: cleanMessages, user: user });
});

// Defino una ruta POST para enviar un mensaje al chat.
router.post('/messages', async (req, res) => {
    // Extraigo el correo electrónico del usuario y el mensaje del cuerpo de la solicitud.
    const { user: userEmail, message } = req.body;
    // Verifico si se proporcionaron tanto el correo electrónico del usuario como el mensaje.
    if (!userEmail || !message) {
        // Si falta alguno de los dos, envío una respuesta con el código de estado 400 (Solicitud incorrecta) y un mensaje de error.
        return res.status(400).json({ error: 'Ambos userEmail y mensaje son requeridos.' });
    }
    // Creo un nuevo mensaje en el chat con la información proporcionada.
    const newMessage = await messagesController.create(userEmail, message);
    // Envío una respuesta con el código de estado 201 (Creado) y el nuevo mensaje creado.
    res.status(201).json(newMessage);
});

// Exporto el enrutador para que pueda ser utilizado por otros archivos.
export default router;