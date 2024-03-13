// Importo los módulos necesarios
import { Exception } from '../utils/utils.js';
import productsService from '../service/products.service.js'
import { createError } from '../utils/createError.js';
import { generatorProductsError } from '../utils/errorCause.js';
import errorList from '../utils/errorList.js';

export default class {
    // Método para agregar un nuevo producto
    static async addProduct(data) {
        try {
            // Verifico si ya existe un producto con el mismo código
            const isAdded = await productsService.findOne(data);
            if (isAdded) {
                throw new Exception("Ya hay un producto agregado con el mismo código", 404);
            }
            // Creo un nuevo producto
            const newProduct = await productsService.create(data);
            return newProduct
        }
        catch (error) {
            // Manejo de errores
            createError.Error({
                name: 'Invalid params error',
                cause: generatorProductsError(data),
                message: 'Ocurrió un error dentro del método addProduct.',
                code: errorList.INVALID_PARAMS_ERROR,
            });
        }
    }

    // Método para obtener productos según un criterio
    static async getProducts(query = {}) {
        const criteria = {};
        if (query.category) {
            criteria.category = query.category;
        }
        // Obtengo los productos según el criterio
        return productsService.find(criteria);
    }

    // Método para obtener un producto por su ID
    static async getProductById(pid) {
        const product = await productsService.findById(pid);
        if (!product) {
            throw new Exception("No existe un producto con ese id", 404);
        }
        return product;
    }

    // Método para actualizar un producto
    static async updateProduct(pid, data) {
        const product = await productsService.findById(pid);
        if (!product) {
            throw new Exception("No existe un producto con ese id", 404);
        }
        const criteria = { _id: pid };
        const operation = { $set: data };
        // Actualizo el producto
        const updatedProduct = await productsService.updateOne(criteria, operation);
        if (data.stock === 0) {
            // Si el stock es cero, actualizo el estado a inactivo
            await productsService.updateOne({ _id: pid }, { $set: { status: false } });
        }
        return updatedProduct;
    }

    // Método para eliminar un producto
    static async deletePoduct(pid, owner) {
        const product = await productsService.findById(pid);
        if (!product) {
            throw new Exception("No existe un producto con ese id", 404);
        }
        // Verifico si el propietario del producto es el dueño o un administrador
        if (product.owner === owner) {
            return await productsService.deleteOne(product);
        } else if (owner === "admin") {
            return await productsService.deleteOne(product);
        } else {
            return
        }
    }
}