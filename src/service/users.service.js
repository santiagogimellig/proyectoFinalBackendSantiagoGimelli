// Importo el repositorio de usuarios.
import { userRepository } from "../repositories/index.js";

// Defino la clase UserService.
export default class UserService {
    // Método para crear un usuario con los datos proporcionados.
    static async create(data) {
        return await userRepository.create(data);
    }

    // Método para encontrar un usuario por su dirección de correo electrónico.
    static async findOneDataEmail(data) {
        return await userRepository.findOneDataEmail(data);
    }

    // Método para encontrar un usuario por su ID de GitHub.
    static async findOneGithubId(data) {
        return await userRepository.findOneGithubId(data);
    }

    // Método para encontrar un usuario por su ID.
    static async findById(uid) {
        return await userRepository.findById(uid);
    }

    // Método para encontrar un usuario por su dirección de correo electrónico.
    static async findOneByEmail(email) {
        return await userRepository.findOneByEmail(email);
    }

    // Método para encontrar un usuario por su ID de GitHub.
    static async findOneByGithubId(gitId) {
        return await userRepository.findOneByGithubId(gitId);
    }

    // Método para obtener todos los usuarios.
    static async getUsers() {
        return await userRepository.getUsers();
    }

    // Método para eliminar un usuario por su ID.
    static async deleteUser(uid) {
        return await userRepository.deleteUser(uid);
    }
}