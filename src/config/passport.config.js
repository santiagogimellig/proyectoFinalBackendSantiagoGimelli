// Importo los módulos necesarios
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Exception } from '../utils/utils.js';
import config from './envConfig.js'
import usersController from '../controller/users.controller.js';
import UserDTO from '../dao/DTOs/user.DTO.js';
import { createError } from '../utils/createError.js';
import errorList from '../utils/errorList.js';
import { generatorUserLoginError } from '../utils/errorCause.js';
import cartsController from '../controller/carts.controller.js';

// Defino las opciones para la estrategia de autenticación local
const optsUser = {
    usernameField: 'email',
    passReqToCallback: true,
};

// Creo una función para extraer el token de las cookies firmadas
function coookieExtractor(req) {
    let token = null;
    if (req && req.signedCookies) {
        token = req.signedCookies['access_token'];
    }
    return token;
}

// Defino las opciones para la estrategia JWT
const optsJWT = {
    jwtFromRequest: ExtractJwt.fromExtractors([coookieExtractor]),
    secretOrKey: config.jwtSecret,
};

// Inicializo las estrategias de autenticación
export const init = () => {
    // Estrategia para el registro de usuarios
    passport.use('register', new LocalStrategy(optsUser, async (req, email, password, done) => {
        try {
            // Verifico si el correo electrónico ya está en uso
            const isEmailUsed = await usersController.findEmail(email)
            if (isEmailUsed) {
                return done(null, false, { message: "Hay un usuario ya creado con ese correo electrónico." });
            } else {
                // Creo un nuevo usuario con los datos del formulario
                const data = req.body
                const newUser = await usersController.addUser(data)
                done(null, newUser);
            }
        }
        catch (error) {
            // Manejo de errores
            return done(
                createError.Error({
                    name: 'Register error',
                    cause: error,
                    message: 'Ocurrió un error dentro del método de register.',
                    code: errorList.INTERNAL_SERVER_ERROR,
                })
            );
        }
    }));

    // Estrategia para el inicio de sesión
    passport.use('login', new LocalStrategy(optsUser, async (req, email, password, done) => {
        try {
            // Verifico si es un usuario administrador
            const emailAdmin = config.adminData.adminMail
            const passwordAdmin = config.adminData.adminPass
            if (email === emailAdmin && password === passwordAdmin) {
                // Creo un objeto de usuario administrador
                const user = {
                    _id: "admin",
                    cart: 1,
                    firstName: "Admin",
                    lastName: "Coder",
                    role: "admin",
                    age: "AdminAge",
                    email: email,
                    documents: "",
                    lastConnection: ""
                }
                done(null, user);
            } else {
                // Obtengo los datos del usuario
                const user = await usersController.getUserData(email, password);
                if (user === "Email or password invalid") {
                    // Manejo de errores
                    return done(createError.Error({
                        name: 'Login error',
                        cause: generatorUserLoginError(email, password),
                        message: 'Email or password invalid',
                        code: errorList.AUTHENTICATION_ERROR,
                    }))
                } else {
                    done(null, user);
                }
            }
        }
        catch (error) {
            done(new Exception(`Error: ${error.message}`, 500));
        }
    }));

    // Estrategia para la autenticación con GitHub
    passport.use('github', new GithubStrategy({
        clientID: config.github.clientID,
        clientSecret: config.github.clientSecret,
        callbackURL: "http://localhost:8080/auth/sessions/github-callback",
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile._json.email;
            const githubId = profile.id;
            if (!email) {
                // Verifico si hay un usuario existente con el ID de GitHub
                const userWithGithubId = await usersController.findUserByGithubId(githubId);
                if (userWithGithubId) {
                    return done(null, userWithGithubId);
                }
                // Creo un nuevo usuario con los datos de GitHub
                const data = {
                    firstName: profile._json.name,
                    lastName: '',
                    email: undefined,
                    age: '',
                    password: '',
                    provider: 'Github',
                    githubId: githubId,
                    cart: "",
                    document: '',
                    lastConnection: ""
                };
                const newUser = await usersController.addGithubUser(data);
                return done(null, newUser);
            }
            // Verifico si hay un usuario existente con el correo electrónico
            let user = await usersController.findEmail(email);
            if (user) {
                return done(null, user);
            }
            // Creo un nuevo carrito para el usuario
            const userCart = await cartsController.addCart(email)
            // Creo un nuevo usuario con los datos de GitHub y el correo electrónico
            const data = {
                firstName: profile._json.name,
                lastName: '',
                email: email,
                age: '',
                password: '',
                provider: 'Github',
                document: '',
                lastConnection: "",
                cart: userCart
            };
            const newUser = await usersController.addGithubUser(data);
            done(null, newUser);
        } catch (error) {
            done(error, null);
        }
    }));

    // Serializo el usuario
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    // Deserializo el usuario
    passport.deserializeUser(async (id, done) => {
        if (id === "admin") {
            // Creo un objeto de usuario administrador
            const adminUser = {
                _id: "admin",
                cart: 1,
                firstName: "Admin",
                lastName: "Coder",
                role: "admin",
                age: "AdminAge",
                email: "adminCoder@coder.com",
                document: ''
            };
            return done(null, adminUser);
        }
        try {
            // Obtengo los datos del usuario
            const user = await usersController.findById(id);
            done(null, user);
        }
        catch (error) {
            done(error, null);
        }
    });

    // Estrategia JWT para autenticación general
    passport.use('currentGeneral', new JwtStrategy(optsJWT, (payload, done) => {
        const userDTO = new UserDTO(payload);
        return done(null, userDTO);
    }));

    // Estrategia JWT para autenticación del perfil
    passport.use('currentProfile', new JwtStrategy(optsJWT, (payload, done) => {
        return done(null, payload);
    }));
}