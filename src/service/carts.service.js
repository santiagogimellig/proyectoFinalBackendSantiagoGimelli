// Importo el repositorio de carritos.
import { cartRepository } from "../repositories/index.js";

// Defino la clase CartService.
export default class CartService {
    // Método para crear un nuevo carrito.
    static async create(userEmail) {
        return await cartRepository.create(userEmail);
    }

    // Método para encontrar un carrito por su ID.
    static async findById(cid) {
        return await cartRepository.findById(cid);
    }

    // Método para encontrar y actualizar un carrito según un criterio dado.
    static async findOneAndUpdate(criteria) {
        return await cartRepository.findOneAndUpdate(criteria);
    }

    // Método para encontrar todos los carritos.
    static async find() {
        return await cartRepository.find();
    }

    // Método para eliminar un carrito por su ID.
    static async remove(cid) {
        return await cartRepository.remove(cid);
    }
}