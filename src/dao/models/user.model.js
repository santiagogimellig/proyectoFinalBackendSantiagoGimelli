// Importo mongoose, una biblioteca de modelado de objetos para MongoDB en Node.js
import mongoose from 'mongoose';
// Importo mongoosePaginate para paginación
import mongoosePaginate from 'mongoose-paginate-v2';

// Defino el esquema para el usuario
const userSchema = new mongoose.Schema({
    // Nombre del usuario
    firstName: { type: String },
    // Apellido del usuario
    lastName: { type: String },
    // Correo electrónico del usuario, único pero opcional
    email: {
        type: String,
        unique: true,
        sparse: true,
    },
    // Edad del usuario
    age: { type: Number },
    // Contraseña del usuario
    password: { type: String },
    // Rol del usuario, por defecto "usuario"
    role: { type: String, default: "user" },
    // Carrito del usuario, referencia a la colección Carts
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Carts',
    },
    // Proveedor de la cuenta del usuario, por defecto "app"
    provider: { type: String, default: "app" },
    // ID de GitHub del usuario, único pero opcional
    githubId: { type: String, unique: true, sparse: true, default: undefined },
    // Información para restablecer la contraseña del usuario
    resetLink: {
        token: { type: String, default: null },
        date: { type: Date, default: null },
    },
    // Documentos subidos por el usuario
    documents: [
        {
            name: { type: String },
            reference: { type: String },
            uploadType: { type: String }
        }
    ],
    // Última conexión del usuario
    lastConnection: { type: Date },
}, { timestamps: true }); // Utilizo esta opción para incluir automáticamente los campos createdAt y updatedAt

// Utilizo pre middleware para poblar el carrito antes de ejecutar findOne
userSchema.pre('findOne', function () {
    this.populate('cart.cartId');
});

// Aplico el plugin mongoosePaginate para la paginación
userSchema.plugin(mongoosePaginate);

// Exporto el modelo User, que utiliza el esquema userSchema que acabo de definir
export default mongoose.model('User', userSchema);