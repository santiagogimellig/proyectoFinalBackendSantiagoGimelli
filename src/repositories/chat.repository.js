// Clase que representa un servicio para manejar operaciones relacionadas con el chat
export default class Chat {
    // Constructor de la clase Chat que recibe un objeto dao como argumento
    constructor(dao) {
        // Asigno el objeto dao recibido como propiedad dao de la clase
        this.dao = dao;
    }

    // Método para crear un nuevo mensaje en el chat
    async create(userEmail, message) {
        // Llamo al método create del dao y retorno el resultado
        return await this.dao.create(userEmail, message);
    }

    // Método para encontrar todos los mensajes en el chat
    async find() {
        // Llamo al método find del dao y retorno el resultado
        return await this.dao.find();
    }
}