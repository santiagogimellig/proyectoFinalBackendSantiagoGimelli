// Importo el módulo mongoose
import mongoose from 'mongoose';

// Defino el esquema para los mensajes
const messagesSchema = new mongoose.Schema({
    // El correo electrónico del usuario que envía el mensaje (campo requerido)
    userEmail: { type: String, required: true },
    // El contenido del mensaje (campo requerido)
    message: { type: String, required: true }
}, {
    // Configuro el esquema para que agregue campos de marca de tiempo automáticamente
    timestamps: true
});

// Exporto el modelo 'Messages' basado en el esquema definido
export default mongoose.model('Messages', messagesSchema);