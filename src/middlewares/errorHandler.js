// Importo la lista de errores desde el archivo errorList.js en la carpeta utils
import errorList from "../utils/errorList.js";

// Middleware para el manejo de errores
export default (error, req, res, next) => {
    // Utilizo un switch para manejar diferentes tipos de errores basados en su código
    switch (error.code) {
        // En caso de error de solicitud incorrecta o parámetros inválidos, retorno un código de estado 400
        case errorList.BAD_REQUEST_ERROR:
        case errorList.INVALID_PARAMS_ERROR:
            res.status(400).json({ status: 'error', message: error.message });
            break;
        // En caso de error de base de datos o error de enrutamiento, retorno un código de estado 500
        case errorList.DATA_BASE_ERROR:
        case errorList.ROUTING_ERROR:
            res.status(500).json({ status: 'error', message: error.message });
            break;
        // Si no se puede identificar el tipo de error, retorno un código de estado 500 con un mensaje de error genérico
        default:
            res.status(500).json({ status: 'error', message: 'Error desconocido' });
            break;
    }
}