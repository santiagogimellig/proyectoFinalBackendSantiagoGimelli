// Importo el módulo Router de Express para definir las rutas de la aplicación.
import { Router } from 'express';
// Importo los controladores necesarios para manejar las operaciones relacionadas con los carritos, productos y tickets.
import cartsController from '../controller/carts.controller.js';
import productsController from '../controller/products.controller.js';
import ticketController from '../controller/ticket.controller.js';
// Importo la función authenticateLevel desde un archivo de utilidades para gestionar la autenticación de nivel.
import { authenticateLevel } from '../utils/utils.js';

// Creo una instancia del enrutador de Express.
const router = Router();

// Defino una ruta POST para agregar un carrito.
router.post("/carts", async (req, res) => {
    try {
        // Extraigo los datos del cuerpo de la solicitud.
        let { body: data } = req;
        // Llamo al controlador correspondiente para agregar un carrito con los datos proporcionados.
        const cart = await cartsController.addCart(data);
        // Verifico si se pudo crear el carrito.
        if (cart) {
            // Envío una respuesta con el código de estado 201 (Creado) y el carrito creado.
            res.status(201).send({
                message: "Carrito creado exitosamente.",
                cart: cart
            });
        } else {
            // Si no se pudo crear el carrito, envío una respuesta con el código de estado 404 (No encontrado).
            res.status(404).send("Carrito no creado.");
        }
    } catch (error) {
        // En caso de error, registro el error y envío una respuesta con el código de estado 500 (Error interno del servidor).
        req.logger.error("Error al agregar el carrito:", error)
        res.status(500).send("Error al agregar el carrito");
    }
});

// Defino una ruta GET para obtener todos los carritos.
router.get("/carts", authenticateLevel(2), async (req, res) => {
    try {
        // Llamo al controlador correspondiente para obtener todos los carritos.
        const carts = await cartsController.getCarts(req);
        // Modifico los títulos de los carritos obtenidos.
        for (let i = 0; i < carts.length; i++) {
            const element = carts[i];
            element.title = i;
        }
        // Verifico si se encontraron carritos.
        if (carts) {
            // Si se encontraron, renderizo una vista con la lista de carritos.
            res.render('cartsList', { carts });
        } else {
            // Si no se encontraron carritos, envío una respuesta con el código de estado 400 (Solicitud incorrecta).
            res.status(400).send({ message: "No se encontraron carritos." })
        }
    }
    catch (error) {
        // En caso de error, registro el error y envío una respuesta con el código de estado 500 (Error interno del servidor).
        req.logger.error("Error al obtener los carritos:", error);
        res.status(500).send("Error al obtener los carritos.");
    }
});

// Defino una ruta GET para obtener un carrito por su identificador.
router.get("/carts/:cid", authenticateLevel(3), async (req, res) => {
    // Extraigo el identificador del carrito de los parámetros de la solicitud.
    const id = req.params.cid;
    try {
        // Llamo al controlador correspondiente para obtener el contenido del carrito por su identificador.
        const cart = await cartsController.getCartContentById(id);
        // Verifico si se encontró el carrito.
        if (cart) {
            // Si se encontró, renderizo una vista con los detalles del carrito y el usuario que realizó la solicitud.
            res.render('cart', { cart: cart, user: req.user });
        } else {
            // Si no se encontró el carrito, envío una respuesta con el código de estado 404 (No encontrado).
            res.status(404).send({ message: "No hay ningún carrito con ese identificador." });
        }
    } catch (error) {
        // En caso de error, registro el error y envío una respuesta con el código de estado 500 (Error interno del servidor).
        req.logger.error("Error al encontrar el carrito:", error)
        res.status(500).send("Error al encontrar el carrito.");
    }
});

// Defino una ruta PUT para actualizar los productos de un carrito.
router.put("/carts/:cid", authenticateLevel(3), async (req, res) => {
    // Extraigo el identificador del carrito de los parámetros de la solicitud.
    const idCart = req.params.cid;
    // Extraigo los productos del cuerpo de la solicitud.
    const products = req.body;
    try {
        // Llamo al controlador correspondiente para actualizar los productos de un carrito.
        const updatedCart = await cartsController.updateProductsArrayOfCart(req, idCart, products);
        // Verifico si se pudo actualizar el carrito.
        if (updatedCart) {
            // Si se pudo actualizar, envío una respuesta con el código de estado 200 (OK) y el carrito actualizado.
            res.status(200).send({ message: "Productos en el carrito actualizados", cart: updatedCart });
        } else {
            // Si no se pudo actualizar el carrito, envío una respuesta con el código de estado 400 (Solicitud incorrecta).
            res.status(400).send({ message: "Error al actualizar los productos en el carrito." });
        }
    } catch (error) {
        // En caso de error, registro el error y envío una respuesta con el código de estado 500 (Error interno del servidor).
        req.logger.error("Error al actualizar el carrito o los productos:", error);
        res.status(500).send("Error al actualizar el carrito o los productos.");
    }
});

// Defino una ruta DELETE para eliminar todos los productos de un carrito.
router.delete("/carts/:cid", authenticateLevel(3), async (req, res) => {
    // Extraigo el identificador del carrito de los parámetros de la solicitud.
    const idCart = req.params.cid;
    try {
        // Llamo al controlador correspondiente para eliminar todos los productos de un carrito.
        const updatedCart = await cartsController.deleteProductsOfCart(req, idCart);
        // Verifico si se pudo actualizar el carrito.
        if (updatedCart) {
            // Si se pudo actualizar, envío una respuesta con el código de estado 200 (OK) y el carrito actualizado.
            res.status(200).send({ message: "Todos los productos eliminados del carrito.", cart: updatedCart });
        } else {
            // Si no se pudo actualizar el carrito, envío una respuesta con el código de estado 400 (Solicitud incorrecta).
            res.status(400).send({ message: "Error al eliminar los productos del carrito." });
        }
    } catch (error) {
        // En caso de error, registro el error y envío una respuesta con el código de estado 500 (Error interno del servidor).
        req.logger.error("Error al actualizar el carrito o al eliminar los productos:", error);
        res.status(500).send("Error al actualizar el carrito o al eliminar los productos.");
    }
});

// Defino una ruta POST para agregar un producto a un carrito.
router.post("/carts/:cid/product/:pid", authenticateLevel(3), async (req, res) => {
    // Extraigo los identificadores del carrito y del producto de los parámetros de la solicitud.
    const idCart = req.params.cid;
    const idProduct = req.params.pid;
    const owner = req.user.email;
    try {
        // Llamo al controlador correspondiente para obtener información sobre el producto.
        const product = await productsController.getProductById(idProduct);
        // Verifico si se encontró el producto.
        if (product) {
            // Verifico si el producto pertenece al usuario que realizó la solicitud.
            if (product.owner === owner) {
                // Si el producto pertenece al usuario, envío una respuesta con el código de estado 403 (Prohibido).
                return res.status(403).send("No puedes agregar tu propio producto al carrito de compras.");
            }
            // Creo un objeto con la información del producto a agregar al carrito.
            const productsObj = {
                productId: idProduct,
                quantity: 1
            };
            // Llamo al controlador correspondiente para agregar el producto al carrito.
            const updatedCart = await cartsController.addProductToCart(idCart, productsObj);
            // Verifico si se pudo agregar el producto al carrito.
            if (updatedCart) {
                // Si se pudo agregar el producto, redirijo a la página del carrito y actualizo el precio total del carrito.
                res.redirect(`/api/carts/${idCart}`);
                updatedCart.totalPrice += product.price;
                updatedCart.save();
            } else {
                // Si no se pudo agregar el producto al carrito, envío una respuesta con el código de estado 400 (Solicitud incorrecta).
                res.status(400).send({ message: "Error al agregar el producto al carrito." });
            }
        } else {
            // Si no se encontró el producto, registro el error y envío una respuesta con el código de estado 404 (No encontrado).
            req.logger.error("Producto no encontrado")
            res.status(404).send({ message: "Producto no encontrado" });
        }
    } catch (error) {
        // En caso de error, registro el error y envío una respuesta con el código de estado 500 (Error interno del servidor).
        req.logger.error("Error al actualizar el carrito o al agregar el producto:", error);
        res.status(500).send("Error al actualizar el carrito o al agregar el producto.");
    }
});

// Defino una ruta DELETE para eliminar un producto de un carrito.
router.delete("/carts/:cid/product/:pid", authenticateLevel(3), async (req, res) => {
    // Extraigo los identificadores del carrito y del producto de los parámetros de la solicitud.
    const idCart = req.params.cid;
    const idProduct = req.params.pid;
    try {
        // Llamo al controlador correspondiente para eliminar un producto de un carrito.
        await cartsController.deleteProductOfCart(req, idCart, idProduct);
        // Envío una respuesta con el código de estado 200 (OK) para indicar que los productos fueron eliminados.
        return res.status(200).send({ message: "Productos eliminados" });
    } catch (error) {
        // En caso de error, registro el error y envío una respuesta con el código de estado 500 (Error interno del servidor).
        req.logger.error("Error al actualizar el carrito o al eliminar los productos:", error);
        res.status(500).send("Error al actualizar el carrito o al eliminar los productos.");
    }
});

// Defino una ruta PUT para actualizar la cantidad de un producto en un carrito.
router.put("/carts/:cid/product/:pid", authenticateLevel(3), async (req, res) => {
    // Extraigo los identificadores del carrito y del producto de los parámetros de la solicitud.
    const idCart = req.params.cid;
    const idProduct = req.params.pid;
    // Extraigo la cantidad del producto del cuerpo de la solicitud.
    const { quantity } = req.body;
    try {
        // Llamo al controlador correspondiente para actualizar la cantidad de un producto en un carrito.
        const updatedCart = await cartsController.updateProductQuantityToCart(idCart, idProduct, quantity);
        // Verifico si se pudo actualizar la cantidad del producto en el carrito.
        if (updatedCart) {
            // Si se pudo actualizar, envío una respuesta con el código de estado 200 (OK) y el carrito actualizado.
            res.status(200).send({ message: "La cantidad del producto en el carrito ha sido actualizada", cart: updatedCart });
        } else {
            // Si no se pudo actualizar la cantidad del producto en el carrito, envío una respuesta con el código de estado 400 (Solicitud incorrecta).
            res.status(400).send({ message: "Error al actualizar la cantidad del producto en el carrito." });
        }
    } catch (error) {
        // En caso de error, registro el error y envío una respuesta con el código de estado 500 (Error interno del servidor).
        req.logger.error("Error al actualizar el carrito o la cantidad del producto:", error);
        res.status(500).send("Error al actualizar el carrito o la cantidad del producto.");
    }
});

// Defino una ruta POST para realizar una compra y generar un ticket.
router.post("/carts/:cid/purchase", async (req, res) => {
    // Extraigo el identificador del carrito de los parámetros de la solicitud.
    const idCart = req.params.cid;
    try {
        // Llamo al controlador correspondiente para crear un ticket a partir del carrito y el correo electrónico del usuario que realizó la solicitud.
        const ticket = await ticketController.createTicket(req, idCart, req.user.email);
        // Verifico si se pudo crear el ticket.
        if (ticket) {
            // Si se pudo crear el ticket, renderizo una vista con los detalles del ticket.
            res.render('ticket', { ticket });
        } else {
            // Si no se pudo crear el ticket, envío una respuesta con el código de estado 400 (Solicitud incorrecta).
            res.status(400).send({ message: "Error al crear el ticket." });
        }
    }
    catch (error) {
        // En caso de error, registro el error y envío una respuesta con el código de estado 500 (Error interno del servidor).
        req.logger.error("Error al comprar:", error);
        res.status(500).send("Error al completar la compra");
    }
});

// Exporto el enrutador para que pueda ser utilizado por otros archivos.
export default router;