// Importo el módulo Router de Express para definir las rutas de la aplicación.
import { Router } from 'express';
// Importo passport para la autenticación de usuarios.
import passport from 'passport';
// Importo el controlador de usuarios y las funciones de utilidades necesarias.
import usersController from '../controller/users.controller.js';
import { tokenGenerator } from '../utils/utils.js';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/envConfig.js';
// Importo el transporte de nodemailer desde el archivo principal de la aplicación.
import { transporter } from "../app.js";

// Creo una instancia del enrutador de Express.
const router = Router();

// Defino una ruta POST para registrar un nuevo usuario utilizando la estrategia 'register' de Passport.
router.post('/sessions/register', passport.authenticate('register', { failureRedirect: '/register' }), async (req, res) => {
    // Redirijo al usuario a la página de inicio de sesión después del registro exitoso.
    res.redirect('/login');
});

// Defino una ruta POST para iniciar sesión utilizando la estrategia 'login' de Passport.
router.post('/sessions/login', passport.authenticate('login', { failureRedirect: '/login' }), async (req, res) => {
    // Genero un token de acceso para el usuario autenticado.
    const token = tokenGenerator(req.user);
    if (req.user.role === "admin") {
        // Si el usuario es administrador, establezco una cookie de acceso y lo redirijo a la página de productos.
        res
            .cookie('access_token', token, { maxAge: 1000 * 60 * 30, httpOnly: true, signed: true })
            .status(200)
            .redirect('/api/products');
    } else {
        // Si el usuario no es administrador, registro la última conexión y redirijo a la página de productos.
        const date = Date();
        const connection = await usersController.lastConnection(req.user._id, date);
        if (connection) {
            res
                .cookie('access_token', token, { maxAge: 1000 * 60 * 30, httpOnly: true, signed: true })
                .status(200)
                .redirect('/api/products');
        } else {
            res.redirect('/login');
        }
    }
});

// Defino una ruta GET para obtener los datos del usuario autenticado.
router.get('/sessions/current', passport.authenticate('current', { failureRedirect: '/login' }), async (req, res) => {
    // Obtengo el usuario autenticado y lo envío en formato JSON como respuesta.
    const currentUser = req.user;
    res.json({ user: currentUser });
});

// Defino una ruta POST para iniciar sesión con GitHub.
router.post('/sessions/login-github', async (req, res) => {
    try {
        // Extraigo el correo electrónico del cuerpo de la solicitud.
        const { body: { email } } = req;
        let user = req.user;
        if (user.email === undefined) {
            // Si el usuario no tiene un correo electrónico, actualizo los datos con el correo electrónico proporcionado.
            const newUser = await usersController.updateData("email", email, req.user._id);
            const token = tokenGenerator(newUser);
            // Establezco una cookie de acceso y redirijo a la página de productos.
            res
                .cookie('access_token', token, { maxAge: 1000 * 60 * 30, httpOnly: true, signed: true })
                .status(200)
                .redirect('/api/products');
        }
    } catch (error) {
        // En caso de error, redirijo a la página de inicio de sesión.
        res.redirect('/login');
    }
});

// Defino una ruta GET para iniciar sesión con GitHub, solicitando acceso al correo electrónico del usuario.
router.get('/sessions/github', passport.authenticate('github', { scope: ['user:email'] }));

// Defino una ruta GET para manejar el retorno de GitHub después de iniciar sesión.
router.get('/sessions/github-callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    const user = req.user;
    if (!user.email) {
        // Si el usuario no tiene un correo electrónico, genero un token de acceso y lo redirijo a la página de inicio de sesión con GitHub.
        const token = tokenGenerator(user);
        res
            .cookie('access_token', token, { maxAge: 1000 * 60 * 30, httpOnly: true, signed: true })
            .status(200)
            .redirect('/login-github');
    } else {
        // Si el usuario tiene un correo electrónico, genero un token de acceso y lo redirijo a la página de productos.
        const token = tokenGenerator(req.user);
        res
            .cookie('access_token', token, { maxAge: 1000 * 60 * 30, httpOnly: true, signed: true })
            .status(200)
            .redirect('/api/products');
    }
});

// Defino una ruta GET para cerrar sesión.
router.get('/sessions/logout', passport.authenticate('currentProfile', { session: false }), async (req, res) => {
    if (req.user.role === "admin") {
        // Si el usuario es administrador, elimino la cookie de acceso y lo redirijo a la página de inicio de sesión.
        res
            .clearCookie('access_token')
            .redirect('/login');
    } else {
        // Si el usuario no es administrador, registro la última conexión y lo redirijo según la situación.
        const date = Date();
        const connection = await usersController.lastConnection(req.user._id, date);
        if (connection) {
            res
                .clearCookie('access_token')
                .redirect('/login');
        } else {
            res.redirect('/profile');
        }
    }
});

// Defino una ruta POST para cambiar la contraseña del usuario.
router.post('/sessions/changePassword', async (req, res) => {
    try {
        // Extraigo el correo electrónico del cuerpo de la solicitud.
        const { body: { email } } = req;
        // Busco el usuario por su correo electrónico.
        const user = await usersController.findEmail(email);
        if (user) {
            // Si se encuentra el usuario, genero un token único y envío un correo electrónico con el enlace para restablecer la contraseña.
            const finalToken = uuidv4();
            await usersController.generateLink(email, finalToken);
            const url = config.url;
            const mailOptions = {
                from: config.nodemailer.email,
                to: email,
                subject: 'Reset your password',
                text: `¡Hola desde la tienda de santa tabla!
                ¿Deseas cambiar tu contraseña?
                Haz clic en el siguiente enlace y sigue las instrucciones:
                ${url}/resetPassword/${user._id}/${finalToken}
                Si no solicitaste una nueva contraseña, por favor ignora este mensaje.`
            };
            // Envío el correo electrónico y renderizo una página de espera.
            const mail = await transporter.sendMail(mailOptions);
            if (mail) {
                res.render('waiting');
            } else {
                console.error(`Error al enviar el correo electrónico de restablecimiento de contraseña a ${user.email}`);
            }
        } else {
            // Si no se encuentra el usuario, redirijo a la página de cambio de contraseña.
            res.redirect('/changePassword');
        }
    }
    catch (error) {
        // En caso de error, registro el error y redirijo a la página de cambio de contraseña.
        req.logger.error(error);
        res.redirect('/changePassword');
    }
});

// Defino una ruta POST para realizar el cambio real de contraseña.
router.post('/sessions/trueChangePassword', async (req, res) => {
    try {
        // Extraigo el ID del usuario y la nueva contraseña del cuerpo de la solicitud.
        const { body: { uid, password } } = req;
        // Busco el usuario por su ID.
        const exist = await usersController.findById(uid);
        if (exist) {
            // Si se encuentra el usuario, actualizo la contraseña y redirijo a la página de inicio de sesión.
            const updated = await usersController.updateData("password", password, exist._id);
            if (updated) {
                res.redirect('/login');
            } else {
                // Si no se puede usar la misma contraseña, envío un código de estado 401.
                res.status(401).send("No puedes usar la misma contraseña.");
            }
        } else {
            // Si no se encuentra el usuario, redirijo a la página de cambio de contraseña.
            res.redirect('/changePassword');
        }
    }
    catch (error) {
        // En caso de error, redirijo a la página de cambio de contraseña.
        res.redirect('/changePassword');
    }
});

// Exporto el enrutador para que pueda ser utilizado por otros archivos.
export default router;