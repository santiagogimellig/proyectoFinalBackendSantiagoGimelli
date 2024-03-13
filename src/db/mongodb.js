// Importo mongoose, una biblioteca de modelado de objetos para MongoDB en Node.js
import mongoose from 'mongoose';
// Importo la configuración de la base de datos desde el archivo envConfig.js
import config from '../config/envConfig.js';

// Función para inicializar la conexión con la base de datos
export const init = async () => {
    try {
        // Intento conectar con la base de datos utilizando la URI proporcionada en la configuración
        await mongoose.connect(config.db.URI);
        // Si la conexión es exitosa, imprimo un mensaje de confirmación en la consola
        console.log('"Base de datos conectada."');
    } catch (error) {
        // Si hay un error durante la conexión, imprimo un mensaje de error en la consola junto con el mensaje de error específico
        console.log('Se produjo un error al intentar conectar con la base de datos.', error.message);
    }
}