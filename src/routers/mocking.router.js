// Importo el módulo Router de Express para definir las rutas de la aplicación.
import { Router } from 'express';
// Importo las funciones de autenticación y generación de productos desde un archivo de utilidades.
import { authenticateLevel, generateProduct } from '../utils/utils.js';

// Creo una instancia del enrutador de Express.
const router = Router();

// Defino una ruta GET para generar productos simulados.
router.get("/mockingproducts", authenticateLevel(2), (req, res) => {
    try {
        // Defino el número de productos simulados que se generarán.
        const numberOfProducts = 100;
        // Genero un array con el número especificado de productos simulados utilizando la función de generación de productos.
        const simulatedProducts = Array.from({ length: numberOfProducts }, generateProduct);
        // Envío los productos simulados como respuesta en formato JSON.
        res.json(simulatedProducts);
    }
    catch (error) {
        // En caso de error, registro el error utilizando el logger y lo manejo.
        req.logger.error(error);
    }
});

// Defino una ruta GET para probar el logger.
router.get("/loggerTest", authenticateLevel(2), (req, res) => {
    try {
        // Pruebo los diferentes niveles del logger.
        req.logger.debug("Debug Test");
        req.logger.http("Http Test");
        req.logger.info("Info Test");
        req.logger.warning("Warning Test");
        req.logger.error("Error Test");
        req.logger.fatal("Fatal Test");
        // Envío una respuesta para indicar el final de las pruebas.
        res.send("End of tests");
    }
    catch (error) {
        // En caso de error, registro el error utilizando el logger y lo manejo.
        req.logger.error(error);
    }
});

// Exporto el enrutador para que pueda ser utilizado por otros archivos.
export default router;