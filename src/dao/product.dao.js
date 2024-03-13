// Importo el modelo de productos desde el archivo products.model.js
import productsModel from "./models/products.model.js";

// Clase que maneja las operaciones CRUD para los productos
export default class {
    // Método para encontrar un producto según un criterio dado
    static async findOne(data) {
        // Busco y retorno el primer producto que coincida con el código proporcionado
        return await productsModel.findOne({ code: data.code });
    }

    // Método para crear un nuevo producto
    static async create(data) {
        // Creo un nuevo producto con los datos proporcionados
        return await productsModel.create(data);
    }

    // Método para encontrar productos según un criterio dado
    static async find(criteria) {
        // Encuentro y retorno todos los productos que coincidan con el criterio proporcionado
        return await productsModel.find(criteria);
    }

    // Método para encontrar un producto por su ID
    static async findById(pid) {
        // Busco y retorno el producto con el ID dado
        return await productsModel.findById(pid);
    }

    // Método para actualizar un producto según un criterio y una operación dados
    static async updateOne(criteria, operation) {
        // Actualizo el primer producto que coincida con el criterio dado con la operación proporcionada
        return await productsModel.updateOne(criteria, operation);
    }

    // Método para eliminar un producto según un criterio dado
    static async deleteOne(product) {
        // Elimino el producto que coincida con los datos proporcionados
        return await productsModel.deleteOne(product);
    }
}