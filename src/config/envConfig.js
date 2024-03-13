// Defino un objeto con la configuración de la aplicación, utilizando variables de entorno para los valores
export default {
    // Entorno de la aplicación
    env: process.env.NODE_ENV || 'dev',
    // URL de la aplicación web
    url: process.env.WEB_URL,
    // Puerto en el que se ejecutará el servidor
    port: process.env.PORT,
    // Configuración de la base de datos
    db: {
        // URI de producción de la base de datos
        URI: process.env.URI,
        // URI de desarrollo de la base de datos
        URI_DEV: process.env.URIDEV
    },
    // Secreto utilizado para generar tokens JWT
    jwtSecret: process.env.JWT_SECRET,
    // Secreto utilizado para cookies
    cookieSecret: process.env.COOKIE_SECRET,
    // Secreto utilizado para sesiones
    sessionSecret: process.env.SESSION_SECRET,
    // Datos de administrador
    adminData: {
        // Correo electrónico del administrador
        adminMail: process.env.ADMIN_EMAIL,
        // Contraseña del administrador
        adminPass: process.env.ADMIN_PASSWORD
    },
    // Configuración para autenticación con GitHub
    github: {
        // ID de cliente de GitHub
        clientID: process.env.CLIENT_ID,
        // Secreto de cliente de GitHub
        clientSecret: process.env.CLIENT_SECRET,
    },
    // Configuración para enviar correos electrónicos usando nodemailer
    nodemailer: {
        // Contraseña para la cuenta de correo electrónico
        pass: process.env.EMAIL_PASS,
        // Dirección de correo electrónico
        email: process.env.EMAIL
    }
}