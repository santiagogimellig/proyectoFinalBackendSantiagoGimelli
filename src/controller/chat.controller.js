// Importo el módulo del servicio de chat
import chatService from "../service/chat.service.js"

export default class {
    // Método para crear un nuevo mensaje de chat
    static async create(userEmail, message) {
        // Delego la creación del mensaje al servicio de chat
        return await chatService.create(userEmail, message)
    }

    // Método para obtener todos los mensajes de chat
    static async find() {
        // Delego la obtención de los mensajes al servicio de chat
        return await chatService.find()
    }
}