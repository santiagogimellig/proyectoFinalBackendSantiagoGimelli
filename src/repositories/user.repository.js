// Clase que representa un servicio para manejar operaciones relacionadas con los usuarios
export default class User {
    // Constructor de la clase User que recibe un objeto dao como argumento
    constructor(dao) {
        // Asigno el objeto dao recibido como propiedad dao de la clase
        this.dao = dao;
    }

    // Método para crear un nuevo usuario
    async create(data) {
        // Llamo al método create del dao y retorno el resultado
        return await this.dao.create(data);
    }

    // Método para encontrar un usuario por su email
    async findOneDataEmail(data) {
        // Llamo al método findOneDataEmail del dao y retorno el resultado
        return await this.dao.findOneDataEmail(data);
    }

    // Método para encontrar un usuario por su ID de GitHub
    async findOneGithubId(data) {
        // Llamo al método findOneGithubId del dao y retorno el resultado
        return await this.dao.findOneGithubId(data);
    }

    // Método para encontrar un usuario por su ID
    async findById(uid) {
        // Llamo al método findById del dao y retorno el resultado
        return await this.dao.findById(uid);
    }

    // Método para encontrar un usuario por su email
    async findOneByEmail(email) {
        // Llamo al método findOneByEmail del dao y retorno el resultado
        return await this.dao.findOneByEmail(email);
    }

    // Método para encontrar un usuario por su ID de GitHub
    async findOneByGithubId(gitId) {
        // Llamo al método findOneByGithubId del dao y retorno el resultado
        return await this.dao.findOneByGithubId(gitId);
    }

    // Método para obtener todos los usuarios
    async getUsers() {
        // Llamo al método getUsers del dao y retorno el resultado
        return await this.dao.getUsers();
    }

    // Método para eliminar un usuario por su ID
    async deleteUser(uid) {
        // Llamo al método deleteUser del dao y retorno el resultado
        return await this.dao.deleteUser(uid);
    }
}