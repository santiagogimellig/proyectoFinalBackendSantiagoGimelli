// Importo los repositorios y daos necesarios
import UserRepository from './user.repository.js';
import userDao from '../dao/user.dao.js';
import TicketRepository from './ticket.repository.js'
import ticketDao from '../dao/ticket.dao.js'
import CartRepository from './cart.repository.js'
import cartDao from '../dao/cart.dao.js'
import ChatRepository from './chat.repository.js'
import chatDao from '../dao/chat.dao.js'
import ProductsRepository from './products.repository.js'
import productsDao from '../dao/product.dao.js'

// Creo instancias de los repositorios usando los daos correspondientes
export const userRepository = new UserRepository(userDao);
export const ticketRepository = new TicketRepository(ticketDao);
export const cartRepository = new CartRepository(cartDao);
export const chatRepository = new ChatRepository(chatDao);
export const productsRepository = new ProductsRepository(productsDao);