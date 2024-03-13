// Importo el repositorio de tickets.
import { ticketRepository } from "../repositories/index.js";

// Defino la clase TicketService.
export default class TicketService {
    // Método para crear un ticket con los datos proporcionados.
    static async createTicket(req, uniqueCode, date, amount, userEmail, purchasedProductsData) {
        return await ticketRepository.create(req, uniqueCode, date, amount, userEmail, purchasedProductsData);
    }
}