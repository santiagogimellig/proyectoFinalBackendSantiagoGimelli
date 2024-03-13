// Importo el módulo Router de Express para definir las rutas de la aplicación.
import { Router } from 'express';
// Importo el controlador de usuarios y las funciones de utilidades necesarias.
import usersController from '../controller/users.controller.js';
import { authenticateLevel, tokenGenerator } from '../utils/utils.js';
import multer from 'multer';
// Importo path y join para manejar rutas de archivos.
import path, { join } from 'path';
// Importo el modelo de usuario.
import userModel from '../dao/models/user.model.js';

// Creo una instancia del enrutador de Express.
const router = Router();

// Configuración de multer para el almacenamiento de archivos.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath;
        const uploadType = req.body.uploadType;
        // Determino el directorio de destino según el tipo de carga.
        if (uploadType === "profilePhoto") {
            uploadPath = join(process.cwd(), 'public', 'img', 'profilesPhotos');
        } else if (uploadType === "productPhoto") {
            uploadPath = join(process.cwd(), 'public', 'img', 'productsPhotos');
        } else if (uploadType === "creditCard" || uploadType === "houseLocation" || uploadType === "id") {
            uploadPath = join(process.cwd(), 'public', 'img', 'documentsPhotos');
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, fileName);
    }
});

const upload = multer({ storage });

// Ruta para actualizar a un usuario a premium.
router.get('/users/premium/:uid', async (req, res) => {
    const uid = req.params.uid;
    // Verifico si el usuario ha cargado todas las fotos necesarias.
    const validateUser = await usersController.findById(uid);
    const existingIdPhoto = validateUser.documents.findIndex(doc => doc.uploadType === "id");
    const existingCardPhoto = validateUser.documents.findIndex(doc => doc.uploadType === "creditCard");
    const existingHousePhoto = validateUser.documents.findIndex(doc => doc.uploadType === "houseLocation");
    if (existingCardPhoto >= 0 && existingHousePhoto >= 0 && existingIdPhoto >= 0) {
        // Cambio el rol del usuario a premium si ha cargado todas las fotos.
        const user = await usersController.changeRol(uid);
        if (user) {
            const token = tokenGenerator(user);
            // Elimino la cookie de acceso y redirijo a la página de perfil.
            res.clearCookie('access_token');
            res
                .cookie('access_token', token, { maxAge: 1000 * 60 * 30, httpOnly: true, signed: true })
                .status(200)
                .redirect("/profile");
        } else {
            res.redirect("/profile");
        }
    } else {
        res.json({ message: "Debes cargar fotos de tu identificación." });
    }
});

// Ruta para cargar documentos de usuario.
router.post('/users/:uid/documents', upload.single('file'), async (req, res) => {
    const { uploadType } = req.body;
    const uid = req.params.uid;
    const fileName = req.file.filename;
    const imgPath = req.file.path;
    if (imgPath) {
        // Genero una ruta relativa al archivo cargado.
        const imgIndex = imgPath.indexOf('img');
        const relativePath = imgPath.substring(imgIndex);
        // Guardo la información del archivo en la base de datos.
        const saved = await usersController.uploadFile(uid, fileName, relativePath, uploadType);
        if (saved) {
            res.redirect('/profile');
        } else {
            res.json({ message: "El archivo puede haber sido cargado, pero no está conectado a tu cuenta de usuario debido a un error." });
        }
    } else {
        return res.status(400).json({ error: "Invalid upload type" });
    }
});

// Otras rutas para la gestión de usuarios.
router.get('/users/postDocuments', async (req, res) => {
    const user = req.user;
    const uid = user._id;
    res.render('files', { title: "Uploading files", uid: uid });
});

router.get('/users', authenticateLevel(2), async (req, res) => {
    const { limit, page, sort, firstName, role, provider } = req.query;
    // Filtrar y paginar los usuarios según los parámetros proporcionados.
    try {
        const options = {
            limit: limit ? parseInt(limit) : 10,
            page: page ? parseInt(page) : 1,
        };
        const filter = {};
        if (role) {
            filter.role = role;
        }
        if (provider) {
            filter.provider = provider;
        }
        if (firstName) {
            filter.firstName = firstName;
        }
        if (sort === 'asc' || sort === 'desc') {
            options.sort = { lastConnection: sort === 'asc' ? 1 : -1 };
        }
        const result = await userModel.paginate(filter, options);
        res.render('users', {
            users: result.docs,
            totalPages: result.totalPages,
            prevLink: result.hasPrevPage ? `/api/users?page=${result.page - 1}&limit=${options.limit}` : null,
            nextLink: result.hasNextPage ? `/api/users?page=${result.page + 1}&limit=${options.limit}` : null,
        });
    } catch (error) {
        req.logger.error("Error al obtener usuarios:", error);
        res.status(500).send("Error al obtener usuarios.");
    }
});

router.delete('/users/clean', authenticateLevel(2), async (req, res) => {
    // Limpiar usuarios no conectados.
    const deleted = await usersController.cleanUnconnectedUsers();
    if (deleted === 'cleaned') {
        res.json({ message: "Usuarios eliminados, regresa y actualiza para ver los cambios." });
    } else {
        res.json({ message: "Algo salió mal" });
    }
});

router.get('/users/adminPanel', authenticateLevel(2), async (req, res) => {
    const { limit, page, _id } = req.query;
    // Obtener usuarios para el panel de administración.
    try {
        const options = {
            limit: limit ? parseInt(limit) : 1,
            page: page ? parseInt(page) : 1,
        };
        const filter = {};
        if (_id) {
            filter._id = _id;
        }
        const result = await userModel.paginate(filter, options);
        res.render('usersAdminPanel', {
            users: result.docs,
            totalPages: result.totalPages,
            prevLink: result.hasPrevPage ? `/api/users/adminPanel?page=${result.page - 1}&limit=${options.limit}` : null,
            nextLink: result.hasNextPage ? `/api/users/adminPanel?page=${result.page + 1}&limit=${options.limit}` : null,
        });
    } catch (error) {
        req.logger.error("Error al obtener usuarios:", error);
        res.status(500).send("Error al obtener usuarios.");
    }
});

router.post('/users/:uid/changeRoleByAdmin', authenticateLevel(2), async (req, res) => {
    // Cambiar el rol de un usuario por el administrador.
    const uid = req.params.uid;
    const user = await usersController.changeRol(uid);
    if (user) {
        res.json({ message: "Rol actualizado, regresa y actualiza para ver los cambios." });
    } else {
        res.json({ message: "Algo salió mal" });
    }
});

router.delete('/users/:uid/deleteUser', authenticateLevel(2), async (req, res) => {
    // Eliminar un usuario por el administrador.
    const uid = req.params.uid;
    const deleted = await usersController.deleteUser(uid);
    if (deleted) {
        res.json({ message: "Usuario eliminado, regresa y actualiza para ver los cambios." });
    } else {
        res.json({ message: "Algo salió mal" });
    }
});

// Exporto el enrutador para que pueda ser utilizado por otros archivos.
export default router;