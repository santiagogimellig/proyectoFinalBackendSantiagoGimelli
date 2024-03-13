// Función para generar un error relacionado con usuarios.
export const generatorUserError = (user) => {
  return `Todos los parámetros son requeridos.
  Datos recibidos:
    - Nombre - string      : ${user.firstName} como ${typeof (user.firstName)}
    - Apellido - string    : ${user.lastName} como ${typeof (user.lastName)}
    - Correo electrónico - string  : ${user.email} como ${typeof (user.email)}
    - Edad - número        : ${user.age} como ${typeof (user.age)}
    - Contraseña - string  : ${user.password} como ${typeof (user.password)}`
};

// Función para generar un error relacionado con productos.
export const generatorProductsError = (product) => {
  return `Faltan algunos parámetros,
  Los siguientes parámetros son requeridos y estos son los datos que se recibieron:
    - Título - string: ${product.title} como ${typeof (product.title)}
    - Descripción - string: ${product.description} como ${typeof (product.description)}
    - Precio - número: ${product.price} como ${typeof (product.price)}
    - Código - string: ${product.code} como ${typeof (product.code)}
    - Existencias - número: ${product.stock} como ${typeof (product.stock)}
    - Categoría - string: ${product.category} como ${typeof (product.category)}`
}

// Función para generar un error relacionado con el inicio de sesión de usuario.
export const generatorUserLoginError = ({ email, password }) => {
  return `Correo electrónico o contraseña no válidos.
  Datos recibidos:
    - Correo electrónico - string: ${email} como ${typeof (email)}
    - Contraseña - string: ${password} como ${typeof (password)}`
}

// Función para generar un error relacionado con el ID del carrito.
export const generatorCartIdError = (id) => {
  return `No hay ningún carrito con ese ID.
  Datos recibidos: ${id} como ${typeof (id)}`
}