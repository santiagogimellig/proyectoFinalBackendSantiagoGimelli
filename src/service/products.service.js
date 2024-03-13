// Importo el repositorio de productos.
import { productsRepository } from "../repositories/index.js";

// Defino la clase ProductService.
export default class ProductService {
    // Método para encontrar un producto según los datos proporcionados.
    static async findOne(data) {
        return await productsRepository.findOne(data);
    }

    // Método para crear un nuevo producto.
    static async create(data) {
        return await productsRepository.create(data);
    }

    // Método para encontrar productos según los criterios especificados.
    static async find(criteria) {
        return await productsRepository.find(criteria);
    }

    // Método para encontrar un producto por su ID.
    static async findById(pid) {
        return await productsRepository.findById(pid);
    }

    // Método para actualizar un producto según los criterios y la operación proporcionados.
    static async updateOne(criteria, operation) {
        return await productsRepository.updateOne(criteria, operation);
    }

    // Método para eliminar un producto.
    static async deleteOne(product) {
        return await productsRepository.deleteOne(product);
    }
}