// Importo el módulo Router de Express para definir las rutas de la aplicación.
import { Router } from 'express';
// Importo el controlador y el modelo necesarios para manejar las operaciones relacionadas con los productos.
import productsController from '../controller/products.controller.js';
import productsModel from '../dao/models/products.model.js';
// Importo la función de autenticación y la configuración desde archivos de utilidades y configuración.
import { authenticateLevel } from '../utils/utils.js';
import config from '../config/envConfig.js';
// Importo el transporte de nodemailer desde el archivo principal de la aplicación.
import { transporter } from '../app.js';

// Creo una instancia del enrutador de Express.
const router = Router();

// Defino una ruta GET para obtener todos los productos con opciones de paginación y filtrado.
router.get("/products", async (req, res) => {
    // Extraigo los parámetros de la consulta para la paginación y el filtrado.
    const { limit, page, sort, status, category, title } = req.query;
    try {
        // Configuro las opciones de paginación.
        const options = {
            limit: limit ? parseInt(limit) : 10,
            page: page ? parseInt(page) : 1,
        };
        // Inicializo el filtro vacío.
        const filter = {};
        // Agrego condiciones al filtro según los parámetros de la consulta.
        if (category) {
            filter.category = category;
        }
        if (status) {
            filter.status = status;
        }
        if (title) {
            filter.title = title;
        }
        // Configuro el orden de los resultados según el parámetro de orden.
        if (sort === 'asc' || sort === 'desc') {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }
        // Ejecuto la consulta utilizando el modelo de productos con la paginación y el filtro configurados.
        const result = await productsModel.paginate(filter, options);
        // Obtengo el usuario actual autenticado.
        const currentUser = req.user;
        // Renderizo una vista con los productos obtenidos, la información de paginación y el usuario actual.
        res.render('products', {
            products: result.docs,
            totalPages: result.totalPages,
            prevLink: result.hasPrevPage ? `/api/products?page=${result.page - 1}&limit=${options.limit}` : null,
            nextLink: result.hasNextPage ? `/api/products?page=${result.page + 1}&limit=${options.limit}` : null,
            user: currentUser
        });
    } catch (error) {
        // En caso de error, registro el error utilizando el logger y envío una respuesta con el código de estado 500 (Error interno del servidor).
        req.logger.error("Error al obtener productos:", error)
        res.status(500).send("Error al obtener productos.");
    }
});

// Defino una ruta GET para obtener los detalles de un producto por su ID.
router.get("/products/:pid", async (req, res) => {
    // Extraigo el ID del producto de los parámetros de la solicitud.
    const id = req.params.pid;
    // Obtengo el usuario actual autenticado.
    const currentUser = req.user;
    try {
        // Busco el producto en la base de datos por su ID.
        const product = await productsModel.findById(id);
        // Verifico si la solicitud acepta HTML y si el producto existe.
        if (req.accepts('html')) {
            if (product) {
                // Si la solicitud acepta HTML y el producto existe, renderizo una vista con los detalles del producto y el usuario actual.
                return res.render('product-detail', { product, user: currentUser });
            }
        }
        // Si la solicitud no acepta HTML o el producto no existe, obtengo los detalles del producto utilizando el controlador de productos.
        const productControllerResult = await productsController.getProductById(id);
        if (productControllerResult) {
            // Si se encuentran detalles del producto, los envío en formato JSON como respuesta.
            res.json({ product: productControllerResult });
        } else {
            // Si no se encuentran detalles del producto, envío una respuesta con el código de estado 404 (No encontrado) y un mensaje de error.
            res.status(404).json({ message: "Producto no encontrado" });
        }
    } catch (error) {
        // En caso de error, registro el error utilizando el logger y envío una respuesta con el código de estado 500 (Error interno del servidor).
        req.logger.error("Error al obtener los productos:", error)
        res.status(500).json({ message: "Error al obtener los productos." });
    }
});

// Defino una ruta POST para agregar un nuevo producto con autenticación de nivel 4.
router.post("/products", authenticateLevel(4), async (req, res) => {
    try {
        // Obtengo el correo electrónico del propietario del producto.
        let owner = req.user.email;
        // Extraigo los datos del cuerpo de la solicitud.
        let { body: data } = req;
        // Si el propietario es el administrador, no establezco el propietario en los datos del producto.
        if (owner === "adminCoder@coder.com") {
            data = { ...data };
        } else {
            // Si el propietario no es el administrador, establezco el propietario en los datos del producto.
            data = { ...data, owner: owner };
        }
        // Agrego el producto utilizando el controlador de productos.
        let added = await productsController.addProduct(data);
        // Envío una respuesta con el código de estado 200 (Éxito) y los datos del producto agregado.
        if (added) {
            res.status(200).send(added);
        } else {
            // Si no se puede agregar el producto, envío una respuesta con el código de estado 400 (Solicitud incorrecta).
            res.status(400).send(data);
        }
    } catch (error) {
        // En caso de error, registro el error utilizando el logger y envío una respuesta con el código de estado 500 (Error interno del servidor).
        req.logger.error("Error al agregar productos:", error);
        res.status(500).send("Error al agregar productos.");
    }
});

// Defino una ruta PUT para actualizar un producto por su ID con autenticación de nivel 4.
router.put("/products/:pid", authenticateLevel(4), async (req, res) => {
    // Extraigo el ID del producto de los parámetros de la solicitud.
    const id = req.params.pid;
    // Obtengo el correo electrónico del propietario del producto.
    let owner = req.user.email;
    // Si el propietario es el administrador, cambio el propietario a "admin" para fines de comparación.
    if (owner === "adminCoder@coder.com") {
        owner = "admin";
    }
    try {
        // Busco el producto en la base de datos por su ID utilizando el controlador de productos.
        const products = await productsController.getProductById(id);
        // Verifico si el producto existe.
        if (!products) {
            // Si el producto no existe, envío una respuesta con el código de estado 404 (No encontrado) y un mensaje de error.
            const productsObj = { product: "No hay ningún producto con ese ID." };
            res.status(404).send(productsObj);
        } else {
            // Si el producto existe, verifico si el usuario autenticado es el propietario del producto.
            if (products.owner === owner) {
                // Si el usuario autenticado es el propietario, actualizo los datos del producto utilizando el cuerpo de la solicitud.
                let { body: data } = req;
                data = { ...data };
                await productsController.updateProduct(id, data);
            } else {
                // Si el usuario autenticado no es el propietario, envío una respuesta con el código de estado 405 (Método no permitido) y un mensaje de error.
                res.status(405).send("Puede que no seas el propietario para cambiar sus datos o puede que no tengas los permisos necesarios para hacerlo.");
                return;
            }
            // Obtengo los nuevos detalles del producto después de la actualización.
            const newProduct = await productsController.getProductById(id);
            // Envío una respuesta con el código de estado 200 (Éxito) y los nuevos detalles del producto.
            res.status(200).send(newProduct);
        }
    } catch (error) {
        // En caso de error, registro el error utilizando el logger y envío una respuesta con el código de estado 500 (Error interno del servidor).
        req.logger.error("Error al obtener productos:", error);
        res.status(500).send("Error al obtener productos.");
    }
});

// Defino una ruta DELETE para eliminar un producto por su ID con autenticación de nivel 4.
router.delete("/products/:pid", authenticateLevel(4), async (req, res) => {
    // Extraigo el ID del producto de los parámetros de la solicitud.
    const id = req.params.pid;
    // Obtengo el correo electrónico del propietario del producto.
    let owner = req.user.email;
    // Si el propietario es el administrador, cambio el propietario a "admin" para fines de comparación.
    if (owner === "adminCoder@coder.com") {
        owner = "admin";
    }
    try {
        // Intento eliminar el producto utilizando el controlador de productos.
        let deleted = await productsController.deletePoduct(id, owner);
        let message;
        // Verifico si se eliminó correctamente el producto.
        if (deleted) {
            // Si se eliminó correctamente el producto, configuro el mensaje de correo electrónico.
            deleted = true;
            const mailOptions = {
                from: config.nodemailer.email,
                to: owner,
                subject: 'Your product was deleted',
                text: `¡Hola desde la tienda de santa tabla!
                Lamentamos informarte que tu producto ha sido eliminado de nuestra plataforma.
                Puede ser que lo hayas eliminado tú mismo o que lo haya hecho un administrador.
                Siempre puedes volver a publicarlo.
                ¡Hasta luego!`
            };
            // Envío el correo electrónico y registro la respuesta.
            const info = await transporter.sendMail(mailOptions);
            console.log(info);
            // Verifico si se envió correctamente el correo electrónico y configuro el mensaje correspondiente.
            if (info) {
                message = "El correo electrónico fue enviado después de eliminar un producto.";
            } else {
                message = "El correo electrónico no pudo ser enviado, pero el producto fue eliminado correctamente.";
            }
        } else {
            // Si no se pudo eliminar el producto, establezco el valor de eliminado como falso.
            deleted = false;
        }
        // Envío una respuesta con el código de estado 200 (Éxito), indicando si se eliminó el producto y el mensaje correspondiente.
        res.status(200).send(`The product is deleted? : ${deleted}  \n ${message}`);
    }
    catch (error) {
        // En caso de error, registro el error utilizando el logger y envío una respuesta con el código de estado 500 (Error interno del servidor).
        req.logger.error("Error al eliminar productos:", error);
        res.status(500).send("Error al eliminar el producto.");
    }
});

// Exporto el enrutador para que pueda ser utilizado por otros archivos.
export default router;