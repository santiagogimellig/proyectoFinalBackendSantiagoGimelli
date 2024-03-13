// Importo el modelo de carritos desde el archivo carts.model.js
import cartsModel from "./models/carts.model.js";
// Importo mongoose para la comunicación con la base de datos
import mongoose from "mongoose";

// Clase que maneja las operaciones CRUD para los carritos
export default class {
    // Método para crear un nuevo carrito
    static async create(userEmail) {
        // Creo un nuevo carrito con el correo electrónico del usuario y un array vacío de productos
        return await cartsModel.create({ userEmail: userEmail, products: [] })
    }

    // Método para encontrar un carrito por su ID
    static async findById(cid) {
        // Busco y retorno el carrito con el ID dado
        return await cartsModel.findById(cid)
    }

    // Método para encontrar y actualizar un carrito según un criterio dado
    static async findOneAndUpdate(criteria, update) {
        // Encuentro y actualizo el carrito según el criterio dado, y retorno el carrito actualizado
        return await cartsModel.findOneAndUpdate(criteria, update, { new: true })
    }

    // Método para encontrar todos los carritos
    static async find() {
        // Encuentro y retorno todos los carritos
        return await cartsModel.find()
    }

    // Método para eliminar un carrito por su ID
    static async remove(cid) {
        // Elimino el carrito con el ID dado y retorno el resultado de la operación de eliminación
        return await cartsModel.deleteOne({ _id: cid });
    }
}