// Importo el módulo winston y el archivo de configuración de variables de entorno
import winston from 'winston';
import config from './envConfig.js'

// Defino los niveles de registro y los colores asociados
const LevelsOptions = {
    levels: {
        fatal: 1,
        error: 0,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5,
    },
    colors: {
        fatal: 'red',
        error: 'magenta',
        warning: 'yellow',
        info: 'blue',
        http: 'gray',
        debug: 'white',
    }
};

// Configuro el logger para el entorno de producción
const loggerProd = winston.createLogger({
    levels: LevelsOptions.levels, // Utilizo los niveles definidos
    transports: [
        new winston.transports.Console({ // Creo un transporte para la consola
            level: 'info', // Muestro los mensajes de nivel info y superiores
            format: winston.format.combine( // Formato de los mensajes
                winston.format.colorize({ colors: LevelsOptions.colors }), // Coloreo los mensajes según el nivel
                winston.format.simple(), // Uso un formato simple (sin metadatos adicionales)
            ),
        }),
        new winston.transports.File({ filename: './error.log', level: 'error' }), // Creo un transporte para guardar los errores en un archivo
    ],
});

// Configuro el logger para el entorno de desarrollo
const loggerDev = winston.createLogger({
    levels: LevelsOptions.levels, // Utilizo los niveles definidos
    transports: [
        new winston.transports.Console({ // Creo un transporte para la consola
            level: 'debug', // Muestro los mensajes de nivel debug y superiores
            format: winston.format.combine( // Formato de los mensajes
                winston.format.colorize({ colors: LevelsOptions.colors }), // Coloreo los mensajes según el nivel
                winston.format.simple(), // Uso un formato simple (sin metadatos adicionales)
            ),
        }),
    ],
});

// Creo un middleware para agregar el logger a las solicitudes (requests)
export const addLogger = (req, res, next) => {
    // Asigno el logger adecuado según el entorno
    req.logger = config.env === 'prod' ? loggerProd : loggerDev;
    next(); // Continúo con la siguiente middleware o ruta
}