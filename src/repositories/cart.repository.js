// Clase que representa un servicio para manejar operaciones relacionadas con los carritos
export default class Cart {
    // Constructor de la clase Cart que recibe un objeto dao como argumento
    constructor(dao) {
        // Asigno el objeto dao recibido como propiedad dao de la clase
        this.dao = dao;
    }

    // Método para crear un nuevo carrito
    async create(userEmail) {
        // Llamo al método create del dao y retorno el resultado
        return await this.dao.create(userEmail);
    }

    // Método para encontrar un carrito por su ID
    async findById(cid) {
        // Llamo al método findById del dao y retorno el resultado
        return await this.dao.findById(cid);
    }

    // Método para encontrar y actualizar un carrito según un criterio dado
    async findOneAndUpdate(criteria) {
        // Llamo al método findOneAndUpdate del dao y retorno el resultado
        return await this.dao.findOneAndUpdate(criteria);
    }

    // Método para encontrar todos los carritos
    async find() {
        // Llamo al método find del dao y retorno el resultado
        return await this.dao.find();
    }

    // Método para eliminar un carrito por su ID
    async remove(cid) {
        // Llamo al método remove del dao y retorno el resultado
        return await this.dao.remove(cid);
    }
}