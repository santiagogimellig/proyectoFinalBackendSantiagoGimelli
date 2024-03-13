// Importo el modelo de ticket desde el archivo ticket.model.js
import ticketModel from "./models/ticket.model.js";

// Clase para manejar operaciones relacionadas con los tickets
export default class TicketService {
    // Método para crear un nuevo ticket
    static async create(req, code, purchase_datetime, amount, purchaser, products) {
        try {
            // Creo un nuevo ticket con los datos proporcionados
            const ticket = await ticketModel.create({
                code,
                purchase_datetime,
                amount,
                purchaser,
                products,
            });
            // Retorno el ticket creado
            return ticket;
        } catch (error) {
            // Si hay un error, registro el error y lanzo una excepción
            req.logger.error("Error al crear el ticket:", error);
            throw new Error("Error al crear el ticket.");
        }
    }
}