// Clase que representa un servicio para manejar operaciones relacionadas con los tickets
export default class Ticket {
    // Constructor de la clase Ticket que recibe un objeto dao como argumento
    constructor(dao) {
        // Asigno el objeto dao recibido como propiedad dao de la clase
        this.dao = dao;
    }

    // Método para crear un nuevo ticket
    async create(uniqueCode, date, amount, userEmail, purchasedProductsData) {
        // Llamo al método create del dao y retorno el resultado
        return await this.dao.create(uniqueCode, date, amount, userEmail, purchasedProductsData);
    }
}