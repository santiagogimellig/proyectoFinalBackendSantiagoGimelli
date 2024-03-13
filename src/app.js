import express from "express"; // Importo el framework Express para la creación de la aplicación web.
import expressSession from 'express-session'; // Importo el módulo 'express-session' para manejar sesiones de usuario.
import MongoStore from 'connect-mongo'; // Importo 'connect-mongo' para almacenar sesiones en MongoDB.
import path from "path"; // Importo el módulo 'path' para trabajar con rutas de archivos y directorios.
import exphbs from 'express-handlebars'; // Importo 'express-handlebars' para el motor de plantillas.
import { __dirname } from './utils/utils.js'; // Importo la constante '__dirname' para obtener el directorio actual.
import indexRouter from "./routers/index.router.js"; // Importo el enrutador principal.
import sessionsRouter from "./routers/sessions.router.js"; // Importo el enrutador para la autenticación y sesiones de usuario.
import passport from 'passport'; // Importo 'passport' para la autenticación de usuarios.
import { init as initPassportConfig } from './config/passport.config.js'; // Importo la inicialización de la configuración de Passport.
import config from './config/envConfig.js'; // Importo la configuración del entorno desde un archivo externo.
import cookieParser from 'cookie-parser'; // Importo 'cookie-parser' para analizar las cookies de la solicitud.
import { socketServer } from "./server.js"; // Importo el servidor de sockets para la comunicación en tiempo real.
import cors from 'cors'; // Importo 'cors' para configurar la política de intercambio de recursos entre diferentes orígenes.
import nodemailer from 'nodemailer'; // Importo 'nodemailer' para el envío de correos electrónicos.
import errorHandler from "./middlewares/errorHandler.js"; // Importo el manejador de errores personalizado.
import { addLogger } from "./config/logger.js"; // Importo la función para añadir un logger a las solicitudes.
import swaggerJsDoc from "swagger-jsdoc"; // Importo 'swagger-jsdoc' para generar documentación OpenAPI.
import swaggerUiExpress from 'swagger-ui-express'; // Importo 'swagger-ui-express' para visualizar la documentación OpenAPI.
import methodOverride from 'method-override'; // Importo 'method-override' para sobrescribir métodos HTTP.

const app = express(); // Creo una instancia de la aplicación Express.

let mongo = ""; // Inicializo la variable para la URI de MongoDB.

if (config.env === "dev") { // Verifico el entorno de desarrollo.
    mongo = config.db.URI_DEV; // Asigno la URI de MongoDB para desarrollo.
} else {
    mongo = config.db.URI; // Asigno la URI de MongoDB para producción.
}

// Configuración de las sesiones de usuario.
app.use(cookieParser(config.cookieSecret)); // Utilizo 'cookie-parser' para analizar las cookies de la solicitud.
app.use(expressSession({ // Utilizo 'express-session' para manejar las sesiones de usuario.
    secret: config.sessionSecret, // Configuro el secreto para firmar las cookies de sesión.
    resave: false, // No guardo la sesión si no hay cambios.
    saveUninitialized: false, // No guardo la sesión si no se ha inicializado.
    store: MongoStore.create({ // Utilizo 'connect-mongo' para almacenar las sesiones en MongoDB.
        mongoUrl: mongo, // Especifico la URI de MongoDB.
        mongoOptions: {}, // Opciones adicionales para la conexión a MongoDB.
        ttl: 120, // Tiempo de vida de la sesión en segundos (2 minutos).
}),
}));

const PORT = config.port; // Puerto de la aplicación.

// Configuración de CORS para permitir solicitudes desde el cliente en el puerto especificado.
app.use(cors({
    origin: `http://localhost:${PORT}`, // Origen permitido.
    methods: ["GET", "POST"], // Métodos HTTP permitidos.
    allowedHeaders: ["my-custom-header"], // Cabeceras permitidas.
    credentials: true // Permitir el intercambio de cookies entre dominios.
}));

app.use(addLogger); // Agrego un logger a las solicitudes.
app.use(express.json({ limit: '10mb' })); // Analizo el cuerpo de la solicitud como JSON (límite de tamaño: 10MB).
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Analizo el cuerpo de la solicitud codificado en URL (límite de tamaño: 10MB, datos extendidos).
app.use(express.static(path.join(__dirname, '../../public'))); // Sirvo archivos estáticos desde el directorio 'public'.
app.use(methodOverride('_method')); // Habilito 'method-override' para sobrescribir métodos HTTP.

// Configuración de Swagger para documentación OpenAPI.
const options = {
    definition: {
        openapi: '3.0.1', // Versión de OpenAPI.
        info: {
            title: 'E-commerce API', // Título de la API.
            description: 'API for the apple shop', // Descripción de la API.
        },
    },
    apis: [`src/docs/**/*.yaml`], // Rutas de los archivos YAML de documentación.
};

const specs = swaggerJsDoc(options); // Genero la especificación OpenAPI.
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs)); // Configuro la ruta para visualizar la documentación OpenAPI.

// Configuración de Express Handlebars como motor de plantillas.
const hbs = exphbs.create({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true, // Permitir el acceso a propiedades prototipo.
    },
    helpers: {
        eq: function (a, b) { // Helper para comparar valores.
            return a === b;
        },
    },
});

app.engine('handlebars', hbs.engine); // Establezco 'handlebars' como motor de plantillas.
app.set('views', path.join(__dirname, '../views')); // Establezco el directorio de vistas.
app.set('view engine', 'handlebars'); // Establezco 'handlebars' como el motor de plantillas predeterminado.
initPassportConfig(); // Inicializo la configuración de Passport.
app.use(passport.initialize()); // Utilizo Passport para inicializar la autenticación.
app.use(passport.session()); // Utilizo Passport para manejar las sesiones de usuario.

// Configuración del transporte para el envío de correos electrónicos.
export const transporter = nodemailer.createTransport({
    service: 'gmail', // Servicio de correo electrónico.
    auth: { // Credenciales de autenticación.
        user: config.nodemailer.email, // Usuario de correo electrónico.
        pass: config.nodemailer.pass // Contraseña de correo electrónico.
    },
    tls: { // Opciones TLS.
        rejectUnauthorized: false // No rechazar conexiones no autorizadas.
    }
});

app.use(errorHandler); // Utilizo el manejador de errores personalizado.
app.use((req, res, next) => { // Middleware para añadir el servidor de sockets a las solicitudes.
    req.socketServer = socketServer; // Añado el servidor de sockets a la solicitud.
    next(); // Paso al siguiente middleware.
});
app.use('/', indexRouter); // Utilizo el enrutador principal para rutas raíz.
app.use('/auth', sessionsRouter); // Utilizo el enrutador de sesiones para rutas de autenticación.

export default app; // Exporto la aplicación Express.