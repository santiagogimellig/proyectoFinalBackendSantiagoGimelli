// Importo el modelo de mensajes desde el archivo messages.model.js
import messagesModel from "../dao/models/messages.model.js";

// Clase que maneja las operaciones CRUD para los mensajes
export default class {
    // Método para crear un nuevo mensaje
    static async create(userEmail, message) {
        // Creo un nuevo mensaje con el correo electrónico del usuario y el mensaje proporcionado
        return await messagesModel.create({ userEmail, message });
    }
    
    // Método para encontrar todos los mensajes
    static async find() {
        // Encuentro y retorno todos los mensajes
        return await messagesModel.find();
    }
}