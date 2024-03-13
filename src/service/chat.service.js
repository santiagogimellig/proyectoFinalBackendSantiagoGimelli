// Importo el repositorio de chats.
import { chatRepository } from "../repositories/index.js";

// Defino la clase ChatService.
export default class ChatService {
    // Método para crear un nuevo mensaje en el chat.
    static async create(userEmail, message) {
        return await chatRepository.create(userEmail, message);
    }

    // Método para encontrar todos los mensajes del chat.
    static async find() {
        return await chatRepository.find();
    }
}