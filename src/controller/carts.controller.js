// Importo los módulos necesarios
import cartsService from "../service/carts.service.js";
import { Exception } from "../utils/utils.js";
import { createError } from '../utils/createError.js';
import errorList from '../utils/errorList.js';
import { generatorCartIdError } from "../utils/errorCause.js";
import cartsModel from "../dao/models/carts.model.js";

export default class {
    // Método para agregar un nuevo carrito
    static async addCart(userEmail) {
        return await cartsService.create(userEmail)
    }

    // Método para obtener el contenido de un carrito por su ID
    static async getCartContentById(cid) {
        return await isCart(cid);
    }

    // Método para agregar un producto a un carrito
    static async addProductToCart(cid, product) {
        try {
            const cart = await isCart(cid);
            if (cart) {
                const existingProductIndex = cart.products.findIndex(p => p.productId._id.toString() === product.productId.toString());
                if (existingProductIndex !== -1) {
                    // Si el producto ya está en el carrito, incremento la cantidad
                    cart.products[existingProductIndex].quantity++;
                } else {
                    // Si el producto no está en el carrito, lo agrego
                    cart.products.push(product);
                }
                await cart.save();
                return cart;
            }
        }
        catch (error) {
            // Manejo de errores
            createError.Error({
                name: 'AddingProductToCart error',
                cause: error,
                message: 'Ocurrió un error dentro del método addProductToCart',
                code: errorList.INTERNAL_SERVER_ERROR,
            });
        }
    }

    // Método para eliminar un producto de un carrito
    static async deleteProductOfCart(req, cid, pid) {
        try {
            const cart = await isCart(cid);
            if (cart && cart.products) {
                const productIndex = cart.products.findIndex(product => product.productId._id.toString() === pid.toString());
                if (productIndex !== -1) {
                    const productToRemove = cart.products[productIndex];
                    cart.totalPrice -= productToRemove.productId.price * productToRemove.quantity;
                    cart.products.splice(productIndex, 1);
                    await cart.save();
                    return cart;
                } else {
                    throw new Exception("No hay ningún producto con ese id en el carrito.", 404);
                }
            } else {
                throw new Exception("Carrito o productos del carrito inválidos.", 500);
            }
        } catch (error) {
            req.logger.error("Error al eliminar el producto del carrito:", error);
            throw new Exception("Error al eliminar el producto del carrito.", 500);
        }
    }

    // Método para actualizar el array de productos de un carrito
    static async updateProductsArrayOfCart(req, cid, products) {
        const cart = await isCart(cid);
        if (cart) {
            try {
                const criteria = { _id: cid };
                let update = { products: products };
                if (!Array.isArray(products)) {
                    update = { products: [products] };
                }
                const updatedCart = await cartsService.findOneAndUpdate(criteria)
                if (!updatedCart) {
                    throw new Exception("Fallo al actualizar el carrito", 500);
                }
                return updatedCart;
            } catch (error) {
                req.logger.error("Error al actualizar el carrito:", error);
                throw new Exception("Error al actualizar el carrito.", 500);
            }
        }
    }

    // Método para actualizar la cantidad de un producto en un carrito
    static async updateProductQuantityToCart(cid, pid, quantity) {
        const cart = await isCart(cid);
        if (cart) {
            try {
                const existingProductIndex = cart.products.findIndex(product => product.productId._id.toString() === pid);
                if (existingProductIndex !== -1) {
                    cart.products[existingProductIndex].quantity += quantity;
                } else {
                    throw new Exception("No hay ningún producto con ese id en el carrito", 404);
                }
                await cart.save();
                return cart;
            } catch (error) {
                throw new Exception("Error al actualizar la cantidad del producto", 500);
            }
        }
    }

    // Método para eliminar todos los productos de un carrito
    static async deleteProductsOfCart(req, cid) {
        const cart = await isCart(cid);
        if (cart) {
            try {
                cart.products = [];
                await cart.save();
                return cart;
            } catch (error) {
                req.logger.error("Error al eliminar los productos del carrito:", error);
                throw new Exception("Error al eliminar los productos del carrito.", 500);
            }
        }
    }

    // Método para obtener todos los carritos
    static async getCarts(req) {
        try {
            const carts = await cartsService.find();
            return carts;
        }
        catch (error) {
            req.logger.error("Error al obtener los carritos:", error);
            throw new Exception("Error al obtener los carritos.", 500);
        }
    }

    // Método para eliminar un carrito por su ID
    static async deleteCart(cid) {
        console.log(cid);
        return await cartsService.remove(cid)
    }
}

// Función auxiliar para verificar si un carrito existe
async function isCart(cid) {
    const cart = await cartsService.findById(cid);
    if (!cart) {
        createError.Error({
            name: 'Invalid param error',
            cause: generatorCartIdError(cid),
            message: 'No hay un carrito con ese id',
            code: errorList.INVALID_PARAMS_ERROR,
        });
    }
    return cart
}