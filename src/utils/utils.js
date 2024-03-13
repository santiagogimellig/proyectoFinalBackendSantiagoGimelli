import path from 'path'; // Importo el módulo 'path' para trabajar con rutas de archivos y directorios.
import { fileURLToPath } from 'url'; // Utilizo la función 'fileURLToPath' para obtener la ruta de archivo a partir de una URL.
import config from '../config/envConfig.js'; // Importo la configuración del entorno desde un archivo externo.
import JWT from 'jsonwebtoken'; // Importo el módulo 'jsonwebtoken' para generar tokens de autenticación.
import { faker } from "@faker-js/faker"; // Importo el módulo 'faker' para generar datos simulados.
import { createError } from './createError.js'; // Importo la función 'createError' desde un archivo externo.
import errorList from './errorList.js'; // Importo la lista de códigos de error desde un archivo externo.

// Obtengo la ruta del archivo actual.
const __filename = fileURLToPath(import.meta.url);
// Obtengo el directorio del archivo actual.
export const __dirname = path.dirname(__filename);

// Función para generar un token de autenticación a partir de los datos del usuario.
export const tokenGenerator = (user) => {
    // Extraigo los datos relevantes del usuario.
    const {
        _id,
        firstName,
        lastName,
        age,
        email,
        role,
        cart,
        documents
    } = user;
    // Creo un payload con los datos del usuario.
    const payload = {
        _id,
        firstName,
        lastName,
        email,
        age,
        role,
        cart,
        documents
    };
    // Genero un token utilizando JWT, con un tiempo de expiración de 30 minutos.
    return JWT.sign(payload, config.jwtSecret, { expiresIn: '30m' });
}

// Clase que representa una excepción con un mensaje y un código de estado.
export class Exception extends Error {
    constructor(message, status) {
        super(message);
        this.statusCode = status;
    }
};

// Función de autenticación que verifica el nivel de acceso del usuario.
export function authenticateLevel(level) {
    return async (req, res, next) => {
        try {
            // Verifico el nivel de acceso requerido.
            if (level === 1) {
                // Si el nivel requerido es 1, paso al siguiente middleware.
                next()
            } else if (level === 2) {
                // Si el nivel requerido es 2, verifico si el usuario es un administrador.
                if (req.user.role === "admin") {
                    next()
                } else {
                    // Si no es un administrador, devuelvo un error de autorización.
                    res.status(401).send({ message: 'No estás autorizado para realizar esta acción.' });
                }
            } else if (level === 3) {
                // Si el nivel requerido es 3, verifico si el usuario tiene un rol de usuario o premium.
                if (req.user.role === "user" || req.user.role === "premium") {
                    next()
                } else {
                    // Si no tiene el rol adecuado, devuelvo un error de método no permitido.
                    res.status(405).send({ message: 'Nivel de usuario requerido.' });
                }
            } else if (level === 4) {
                // Si el nivel requerido es 4, verifico si el usuario es un administrador o premium.
                if (req.user.role === "admin" || req.user.role === "premium") {
                    next()
                } else {
                    // Si no tiene el rol adecuado, devuelvo un error de método no permitido.
                    res.status(405).send({ message: 'Se requiere nivel de administrador o premium.' });
                }
            }
        }
        catch (Error) {
            // Si ocurre un error durante la autenticación, genero un error de autorización.
            createError.Error({
                name: 'Authentication error',
                cause: Error,
                message: 'Se produjo un error dentro del método de autenticación.',
                code: errorList.AUTHORIZATION_ERROR,
            });
        }
    }
}

// Función para generar datos de un producto simulado.
export const generateProduct = () => {
    // Genero una URL de imagen en miniatura para el producto.
    const thumbnailImage = getThumbnailUrl();
    // Creo un objeto de producto simulado con datos aleatorios.
    return {
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.lorem.paragraph(),
        code: faker.string.alphanumeric({ length: 10 }),
        price: faker.commerce.price(),
        stock: faker.number.int({ min: 10000, max: 99999 }),
        image: faker.image.url(),
        status: faker.datatype.boolean(),
        category: faker.commerce.productAdjective(),
        thumbnail: thumbnailImage,
    };
};

// Función para obtener la URL de la imagen en miniatura del producto.
const getThumbnailUrl = () => {
    // Genero una URL de imagen aleatoria para el producto.
    const productImage = faker.image.url();
    // Obtengo la extensión del archivo de la URL de la imagen.
    const fileExtension = productImage.split('.').pop();
    // Reemplazo la extensión del archivo con '_thumb' para obtener la URL de la imagen en miniatura.
    const thumbnailUrl = productImage.replace(`.${fileExtension}`, `_thumb.${fileExtension}`);
    // Devuelvo la URL de la imagen en miniatura.
    return thumbnailUrl;
};