// Importo el módulo mongoose
import mongoose from 'mongoose';

// Defino el esquema para los carritos de compra
const cartsSchema = new mongoose.Schema({
    // El correo electrónico del usuario al que pertenece el carrito
    userEmail: { type: String },
    // Un array de objetos que representan los productos en el carrito
    products: [{
        // El ID del producto, que hace referencia al modelo 'Products'
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
        },
        // La cantidad de este producto en el carrito
        quantity: {
            type: Number,
        }
    }],
    // El precio total del carrito, con un valor predeterminado de 0
    totalPrice: { type: Number, default: 0 }
}, {
    // Configuro el esquema para que agregue campos de marca de tiempo automáticamente
    timestamps: true
});

// Defino un middleware que se ejecuta antes de una operación 'findOne'
cartsSchema.pre('findOne', function () {
    // Este middleware realiza una operación de 'populate' para cargar los datos de los productos
    this.populate('products.productId');
});

// Exporto el modelo 'Carts' basado en el esquema definido
export default mongoose.model('Carts', cartsSchema);