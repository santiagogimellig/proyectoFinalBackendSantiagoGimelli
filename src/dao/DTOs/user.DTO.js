export default class UserDTO {
    // Método constructor que se ejecuta al crear una nueva instancia de la clase
    constructor(user) {
        // Verifico que el objeto 'user' tenga las propiedades requeridas
        if (!user || !user._id || !user.cart || !user.role || !user.email) {
            // Si faltan propiedades, lanzo un error
            throw new Error('UserDTO: "Propiedades requeridas faltantes."');
        }

        // Asigno las propiedades del objeto 'user' a las propiedades de la instancia
        this._id = user._id;
        this.cart = user.cart;
        this.role = user.role;
        this.email = user.email;
    }
}