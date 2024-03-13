// Importo los módulos necesarios
import usersService from "../service/users.service.js";
import { Exception } from '../utils/utils.js';
import bcrypt from 'bcrypt';
import cartsController from '../controller/carts.controller.js';
import { createError } from "../utils/createError.js";
import { generatorUserError } from "../utils/errorCause.js";
import errorList from "../utils/errorList.js";
import { transporter } from "../app.js";
import config from "../config/envConfig.js";

export default class {
    // Método para agregar un nuevo usuario
    static async addUser(data) {
        try {
            // Hasheo la contraseña del usuario
            const saltRounds = 10;
            data.password = await bcrypt.hash(data.password, saltRounds);

            // Creo un nuevo carrito para el usuario
            const userCart = await cartsController.addCart(data.email)
            const finalData = {
                ...data,
                cart: userCart._id
            }

            // Guardo los datos del usuario en la base de datos
            await usersService.create(finalData);
            return await usersService.findOneDataEmail(finalData);
        }
        catch (error) {
            // Manejo de errores
            createError.Error({
                name: 'User creation error',
                cause: generatorUserError(data),
                message: `Se produjo un error al crear un usuario.`,
                code: errorList.USER_CREATION_ERROR,
            });
        }
    }

    // Método para agregar un usuario de GitHub
    static async addGithubUser(data) {
        const finalData = {
            ...data,
            cart: undefined
        }
        // Guardo los datos del usuario en la base de datos
        await usersService.create(finalData);
        return await usersService.findOneGithubId(data);
    }

    // Método para obtener los datos de un usuario
    static async getUserData(email, password) {
        const user = await this.findEmail(email)
        if (!user) {
            return "Correo electrónico o contraseña no válidos.";
        }
        // Verifico si la contraseña es correcta
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            return user;
        } else {
            return "Correo electrónico o contraseña no válidos.";
        }
    }

    // Método para buscar un usuario por su correo electrónico
    static async findEmail(email) {
        const user = await usersService.findOneByEmail(email);
        if (!user) {
            return null;
        } else {
            return user;
        }
    }

    // Método para actualizar los datos de un usuario
    static async updateData(dataToUpdate, data, uid) {
        try {
            let user = await usersService.findById(uid);
            if (dataToUpdate === "email") {
                let email = data
                const existingUser = await usersService.findOneByEmail(email);
                if (existingUser && existingUser._id.toString() !== uid) {
                    throw new Exception("El correo electrónico no se puede utilizar.");
                }
                user.email = data;
                if (user.cart === undefined) {
                    const userCart = await cartsController.addCart(data)
                    user.cart = userCart
                }
                await user.save();
                const newUser = await usersService.findOneByEmail(email)
                return newUser;
            } else if (dataToUpdate === "password") {
                const passwordMatch = await bcrypt.compare(data, user.password);
                if (passwordMatch) {
                    return false
                } else {
                    const saltRounds = 10;
                    data = await bcrypt.hash(data, saltRounds);
                    user.password = data;
                    await user.save();
                    return true;
                }
            }
        } catch (error) {
            console.error("Error al actualizar los datos:", error);
            throw error;
        }
    }

    // Método para buscar un usuario por su ID de GitHub
    static async findUserByGithubId(gitId) {
        const user = await usersService.findOneByGithubId(gitId)
        if (!user) {
            return null;
        }
        else {
            return user;
        }
    }

    // Método para buscar un usuario por su ID
    static async findById(id) {
        return await usersService.findById(id)
    }

    // Método para generar un enlace de restablecimiento de contraseña
    static async generateLink(email, token) {
        const date = Date()
        const user = await usersService.findOneByEmail(email)
        user.resetLink.token = token
        user.resetLink.date = date
        user.save()
        const newUser = await usersService.findOneByEmail(email)
        return newUser;
    }

    // Método para cambiar el rol de un usuario
    static async changeRol(uid) {
        const user = await usersService.findById(uid)
        if (user.role === "user") {
            user.role = "premium"
            user.save()
            const newUser = await usersService.findById(uid)
            return newUser
        } else if (user.role === "premium") {
            user.role = "user"
            user.save()
            const newUser = await usersService.findById(uid)
            return newUser
        } else {
            return null
        }
    }

    // Método para registrar la última conexión de un usuario
    static async lastConnection(uid, date) {
        const user = await usersService.findById(uid)
        if (user) {
            user.lastConnection = date
            user.save()
            return true
        } else {
            return false
        }
    }

    // Método para subir un archivo a un usuario
    static async uploadFile(uid, filename, link, uploadType) {
        const user = await usersService.findById(uid);
        if (user) {
            if (uploadType === "productPhoto") {
                const document = {
                    name: filename,
                    reference: link,
                    uploadType: uploadType
                };
                user.documents.push(document);
            } else {
                const existingDocumentIndex = user.documents.findIndex(doc => doc.uploadType === uploadType);
                if (existingDocumentIndex !== -1) {
                    user.documents[existingDocumentIndex].name = filename;
                    user.documents[existingDocumentIndex].reference = link;
                } else {
                    const document = {
                        name: filename,
                        reference: link,
                        uploadType: uploadType
                    };
                    user.documents.push(document);
                }
            }
            await user.save();
            return true;
        } else {
            return false;
        }
    }

    // Método para eliminar usuarios desconectados
    static async cleanUnconnectedUsers(date) {
        const allUsers = await usersService.getUsers();
        const currentDate = new Date();
        const twoDaysAgo = new Date(currentDate);
        twoDaysAgo.setDate(currentDate.getDate() - 2);
        const unconnectedUsers = allUsers.filter(u => {
            return new Date(u.lastConnection) < twoDaysAgo;
        });
        for (const user of unconnectedUsers) {
            const sended = await sendMail(user);
            if (sended) {
                await cartsController.deleteCart(user.cart)
                await this.deleteUser(user._id);
            }
            console.log("next");
        }
        return 'cleaned';
    }

    // Método para eliminar un usuario
    static async deleteUser(uid) {
        const user = await usersService.findById(uid);
        await cartsController.deleteCart(user.cart);
        return await usersService.deleteUser(uid);
    }
}

// Función auxiliar para enviar un correo electrónico
async function sendMail(user) {
    const mailOptions = {
        from: config.nodemailer.email,
        to: user.email,
        subject: 'Your user on the santa tabla shop was deleted',
        text: `¡Hola desde la tienda de santa tanbla!
        Tu usuario fue eliminado porque estuvo sin conexión durante más de dos días, y el administrador decidió eliminarlo. Si deseas seguir utilizando nuestros servicios, por favor crea una nueva cuenta registrándote nuevamente en nuestra tienda.
        ¡Esperamos verte de nuevo!`
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(info);
        return true;
    } catch (error) {
        console.error('Error al enviar correo electrónico:', error);
        return false;
    }
}