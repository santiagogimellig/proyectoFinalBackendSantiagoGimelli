// Clase que representa un servicio para manejar operaciones relacionadas con los productos
export default class Products {
    // Constructor de la clase Products que recibe un objeto dao como argumento
    constructor(dao) {
        // Asigno el objeto dao recibido como propiedad dao de la clase
        this.dao = dao;
    }

    // Método para encontrar un producto por sus datos
    async findOne(data) {
        // Llamo al método findOne del dao y retorno el resultado
        return await this.dao.findOne(data);
    }

    // Método para crear un nuevo producto
    async create(data) {
        // Llamo al método create del dao y retorno el resultado
        return await this.dao.create(data);
    }

    // Método para encontrar productos según un criterio dado
    async find(criteria) {
        // Llamo al método find del dao y retorno el resultado
        return await this.dao.find(criteria);
    }

    // Método para encontrar un producto por su ID
    async findById(pid) {
        // Llamo al método findById del dao y retorno el resultado
        return await this.dao.findById(pid);
    }

    // Método para actualizar un producto según un criterio y una operación dada
    async updateOne(criteria, operation) {
        // Llamo al método updateOne del dao y retorno el resultado
        return await this.dao.updateOne(criteria, operation);
    }

    // Método para eliminar un producto
    async deleteOne(product) {
        // Llamo al método deleteOne del dao y retorno el resultado
        return await this.dao.deleteOne(product);
    }
}