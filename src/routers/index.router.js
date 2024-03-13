// Importo el módulo Router de Express para definir las rutas de la aplicación.
import { Router } from 'express';
// Importo los enrutadores necesarios para las diferentes funcionalidades de la aplicación.
import cartRouter from "./cart.router.js";
import productsRouter from "./products.router.js";
import chatRouter from "./chat.router.js";
import passport from 'passport';
import mockRouter from './mocking.router.js';
import usersController from '../controller/users.controller.js';
import userRouter from './user.router.js';

// Creo una instancia del enrutador de Express.
const router = Router();

// Defino las rutas protegidas con autenticación que utilizarán diferentes enrutadores para manejar las funcionalidades de la aplicación.
router.use('/api', passport.authenticate('currentGeneral', { session: false }), cartRouter);
router.use('/api', passport.authenticate('currentGeneral', { session: false }), productsRouter);
router.use('/api', passport.authenticate('currentGeneral', { session: false }), chatRouter);
router.use('/api', passport.authenticate('currentGeneral', { session: false }), userRouter);
router.use('/mock', passport.authenticate('currentGeneral', { session: false }), mockRouter);

// Defino una ruta GET para la página de inicio que redirecciona al inicio de sesión.
router.get("/", (req, res) => {
    res.redirect('/login');
});

// Defino una ruta GET para el perfil de usuario.
router.get('/profile', passport.authenticate('currentProfile', { session: false }), async (req, res) => {
    if (req.user.role === "admin") {
        // Si el usuario es un administrador, renderizo la vista de perfil de administrador.
        res.render('profile', { title: "Profile", user: req.user });
    } else {
        // Si el usuario no es un administrador, obtengo su información del controlador de usuarios y renderizo la vista de perfil de usuario normal.
        const id = req.user._id;
        const user = await usersController.findById(id);
        let documents = "";
        let profilePhotoLink = "";
        if (user && user.documents) {
            documents = user.documents;
            const existingProfilePhoto = user.documents.findIndex(doc => doc.uploadType === "profilePhoto");
            if (existingProfilePhoto !== -1) {
                const profilePhoto = user.documents[existingProfilePhoto];
                profilePhotoLink = profilePhoto.reference;
            }
        }
        res.render('profile', { title: "Profile", user: req.user, documents: documents, profilePhoto: profilePhotoLink });
    }
});

// Defino las rutas GET para las páginas de inicio de sesión, registro, cambio de contraseña y restablecimiento de contraseña.
router.get('/login', (req, res) => {
    res.render('login', { title: "Login" });
});

router.get('/login-github', (req, res) => {
    res.render('login-github', { title: "GitHub Login" });
});

router.get('/register', (req, res) => {
    res.render('register', { title: "Login" });
});

router.get('/changePassword', (req, res) => {
    res.render('changePassword', { title: "Change Password" });
});

router.get('/resetPassword/:uid/:token', async (req, res) => {
    const uid = req.params.uid;
    const token = req.params.token;
    try {
        const user = await usersController.findById(uid);
        if (!user) {
            return res.status(401).json({ message: "Invalid user!" });
        }
        if (user.resetLink.token !== token) {
            return res.status(401).json({ message: "Invalid link!" });
        }
        const dateNow = new Date();
        const dateOfCreation = user.resetLink.date;
        const maxAllowedDifference = 60 * 60 * 1000;
        if ((dateNow - dateOfCreation) > maxAllowedDifference) {
            req.logger.warning("Expired Link");
            res.redirect("/changePassword");
        } else {
            res.render('newPassword', { uid: uid });
        }
    } catch (error) {
        req.logger.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Exporto el enrutador para que pueda ser utilizado por otros archivos.
export default router;