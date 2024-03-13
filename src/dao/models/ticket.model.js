// Importo mongoose, una biblioteca de modelado de objetos para MongoDB en Node.js
import mongoose from 'mongoose';

// Defino el esquema para el ticket
const ticketSchema = new mongoose.Schema({
    // Aquí guardo el código único del ticket, es obligatorio
    code: { type: String, unique: true, required: true },
    // Aquí guardo la fecha y hora de la compra del ticket, también es obligatorio
    purchase_datetime: { type: Date, required: true },
    // Aquí almaceno el monto total de la compra
    amount: { type: Number, required: true },
    // Aquí guardo el nombre del comprador
    purchaser: { type: String, required: true },
    // Aquí defino un array que contiene los productos comprados
    products: [{
        // Aquí almaceno el ID del producto comprado
        productId: {
            type: String,
        },
        // Aquí indico la cantidad comprada de ese producto
        quantity: {
            type: Number,
        }
    }],
}, { timestamps: true }) // Utilizo esta opción para incluir automáticamente los campos createdAt y updatedAt

// Exporto el modelo Ticket, que utiliza el esquema ticketSchema que acabo de definir
export default mongoose.model('Ticket', ticketSchema);
