// Exporto la clase createError.
export class createError {
    // Método estático para crear un error con los parámetros especificados.
    static Error({ name = 'Error', cause, message, code = 1 }) {
        // Creo una nueva instancia de Error con el mensaje proporcionado.
        const error = new Error(message);
        // Asigno los valores proporcionados a las propiedades del error.
        error.name = name;
        error.cause = cause;
        error.code = code;
        // Lanzo el error.
        throw error;
    }
}