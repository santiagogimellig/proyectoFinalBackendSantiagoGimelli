// Importo el modelo de usuario desde el archivo user.model.js
import userModel from './models/user.model.js'

// Clase que maneja operaciones CRUD relacionadas con los usuarios
export default class {
    // Método para crear un nuevo usuario
    static async create(data) {
        // Creo un nuevo usuario con los datos proporcionados
        return await userModel.create(data)
    }

    // Método para encontrar un usuario por su dirección de correo electrónico
    static async findOneDataEmail(data) {
        // Encuentro y retorno el primer usuario que coincida con la dirección de correo electrónico proporcionada
        return await userModel.findOne({ email: data.email })
    }

    // Método para encontrar un usuario por su ID de GitHub
    static async findOneGithubId(data) {
        // Encuentro y retorno el primer usuario que coincida con el ID de GitHub proporcionado
        return await userModel.findOne({ githubId: data.githubId })
    }

    // Método para encontrar un usuario por su ID
    static async findById(uid) {
        // Encuentro y retorno el usuario con el ID dado
        return await userModel.findById(uid)
    }

    // Método para encontrar un usuario por su dirección de correo electrónico
    static async findOneByEmail(email) {
        // Encuentro y retorno el primer usuario que coincida con la dirección de correo electrónico proporcionada
        return await userModel.findOne({ email })
    }

    // Método para encontrar un usuario por su ID de GitHub
    static async findOneByGithubId(gitId) {
        // Encuentro y retorno el primer usuario que coincida con el ID de GitHub proporcionado
        return await userModel.findOne({ githubId: gitId })
    }

    // Método para obtener todos los usuarios
    static async getUsers() {
        // Encuentro y retorno todos los usuarios
        return await userModel.find()
    }

    // Método para eliminar un usuario por su ID
    static async deleteUser(uid) {
        // Elimino el usuario con el ID dado
        return await userModel.deleteOne({ _id: uid })
    }
}