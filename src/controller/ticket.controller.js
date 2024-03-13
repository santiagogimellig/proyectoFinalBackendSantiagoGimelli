// Importo los módulos necesarios
import ticketService from "../service/ticket.service.js";
import { nanoid } from "nanoid";
import cartsController from "./carts.controller.js";
import productsController from "./products.controller.js";
import { transporter } from "../app.js";
import config from "../config/envConfig.js";
import { createError } from '../utils/createError.js';
import errorList from '../utils/errorList.js';

export default class {
    // Método para crear un nuevo ticket de compra
    static async createTicket(req, cid, userEmail) {
        try {
            // Obtengo los datos del carrito
            const cartData = await cartsController.getCartContentById(cid);
            const purchasedProductsData = [];
            let amount = 0;

            // Itero sobre los productos del carrito
            for (const product of cartData.products) {
                const productId = product.productId._id;
                const quantity = product.quantity;
                const existingProduct = await productsController.getProductById(productId);

                // Verifico si el producto está disponible y si hay suficiente stock
                if (existingProduct.status === true && existingProduct.stock >= quantity) {
                    const updatedStock = existingProduct.stock - quantity;
                    // Actualizo el stock del producto
                    await productsController.updateProduct(productId, {
                        stock: updatedStock,
                    });
                    let productData = {
                        productId,
                        quantity,
                    };
                    amount += existingProduct.price * quantity;
                    purchasedProductsData.push(productData);
                    // Elimino el producto del carrito
                    await cartsController.deleteProductOfCart(req, cid, productId);
                } else {
                    // Manejo de errores si el producto no está disponible o no hay suficiente stock
                    if (existingProduct.status === false) {
                        req.logger.warning(`No puedes comprar el artículo ${productId} porque no está disponible.`);
                    } else {
                        req.logger.warning(`No hay suficiente stock del producto ${productId}.`);
                    }
                }
            }

            // Genero un código único para el ticket
            const uniqueCode = nanoid();
            const date = new Date();

            // Creo el ticket
            const ticket = await ticketService.createTicket(req, uniqueCode, date, amount, userEmail, purchasedProductsData);
            if (ticket) {
                // Envío un correo electrónico con los detalles del ticket
                const mailOptions = {
                    from: config.nodemailer.email,
                    to: userEmail,
                    subject: 'Your purchase ticket',
                    text: `Hola de la tienda de santa tabla!
                    ¡Gracias por comprar en nuestro servicio en línea! Estos son los detalles de tu compra más reciente:
                    Código de ticket: ${ticket.code}
                    Fecha de compra: ${new Date(ticket.purchase_datetime).toLocaleString()}
                    Monto: $${ticket.amount.toFixed(2)}
                    Comprador: ${ticket.purchaser}
                    Productos:
                    ${ticket.products.map(product => `
                    ID de producto: ${product.productId}
                    Cantidad: ${product.quantity}
                    ID de producto en el carrito: ${product._id}
                    `).join('\n')}
                    Nos vemos pronto!`
                };
                const info = await transporter.sendMail(mailOptions);
                req.logger.info('Correo enviado: ' + info.response);
                return ticket;
            } else {
                return
            }
        }
        catch (error) {
            // Manejo de errores
            createError.Error({
                name: 'Creating ticket error',
                cause: error,
                message: 'Ocurrió un error dentro del método createTicket',
                code: errorList.INTERNAL_SERVER_ERROR,
            });
        }
    }
}