// Importo los módulos necesarios
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'

// Defino el esquema para los productos
const productsSchema = new mongoose.Schema({
    // El título del producto (campo requerido)
    title: { type: String, required: true },
    // La descripción del producto (campo requerido)
    description: { type: String, required: true },
    // El precio del producto (campo requerido)
    price: { type: Number, required: true },
    // La URL de la imagen del producto
    thumbnail: { type: String },
    // El código del producto (campo requerido)
    code: { type: String, required: true },
    // El stock disponible del producto (campo requerido)
    stock: { type: Number, required: true },
    // El estado del producto (activo o inactivo), con un valor predeterminado de 'active'
    status: { type: Boolean, default: 'active' },
    // La categoría del producto (campo requerido)
    category: { type: String, required: true },
    // El propietario del producto, con un valor predeterminado de 'admin'
    owner: { type: String, default: "admin" }
}, {
    // Configuro el esquema para que agregue campos de marca de tiempo automáticamente
    timestamps: true
});

// Aplico el plugin de paginación al esquema
productsSchema.plugin(mongoosePaginate);

// Exporto el modelo 'Products' basado en el esquema definido
export default mongoose.model('Products', productsSchema);