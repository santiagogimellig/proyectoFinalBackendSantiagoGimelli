// Importo la librería supertest para realizar pruebas HTTP
import supertest from 'supertest';
// Importo chai para realizar aserciones
import * as chai from 'chai';
// Importo la aplicación Express que se va a probar
import app from '../src/app.js';
// Importo mongoose para interactuar con la base de datos
import mongoose from 'mongoose';
// Importo la configuración de variables de entorno
import config from '../src/config/envConfig.js';

// Defino el objeto `expect` de chai para realizar aserciones
const expect = chai.expect;

// Describe el conjunto de pruebas para el router del carrito
describe('Cart Router', function () {
    // Antes de todas las pruebas, configuro la aplicación y me conecto a la base de datos
    this.beforeAll(async () => {
        // Pongo la aplicación a escuchar en el puerto 8080 para realizar pruebas
        app.listen(8080)
        // Conecto a la base de datos MongoDB utilizando la URI de desarrollo
        await mongoose.connect(config.db.URI_DEV)
    });

    // Después de todas las pruebas, me desconecto de la base de datos
    this.afterAll(async () => {
        // Desconecto de la base de datos MongoDB
        await mongoose.disconnect()
    });

    // Describo una prueba para la ruta POST /carts/:cid/product/:pid
    describe('POST /carts/:cid/product/:pid', () => {
        // Prueba: Agregar un producto al carrito
        it('should add a product to the cart', async () => {
            // Defino el ID del carrito y del producto a agregar
            const cartId = 'someCartId';
            const productId = 'someProductId';
            // Envío una solicitud POST al servidor con los datos del producto
            const response = await supertest(app)
                .post(`/api/carts/${cartId}/product/${productId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quantity: 1 })
                .expect(200);
            // Verifico que se haya agregado el producto al carrito correctamente
            expect(response.body).to.have.property('message', 'Product added to the cart');
            expect(response.body.cart).to.include.deep.members([{ productId, quantity: 1 }]);
        });
    });

    // Describo una prueba para la ruta PUT /carts/:cid/product/:pid
    describe('PUT /carts/:cid/product/:pid', () => {
        // Prueba: Actualizar la cantidad de un producto en el carrito
        it('should update the quantity of a product in the cart', async () => {
            // Defino el ID del carrito y del producto a actualizar
            const cartId = 'someCartId';
            const productId = 'someProductId';
            // Envío una solicitud PUT al servidor con la nueva cantidad del producto
            const response = await supertest(app)
                .put(`/api/carts/${cartId}/product/${productId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quantity: 2 })
                .expect(200);
            // Verifico que se haya actualizado la cantidad del producto en el carrito correctamente
            expect(response.body).to.have.property('message', 'Product quantity updated');
            expect(response.body.cart).to.include.deep.members([{ productId, quantity: 2 }]);
        });
    });

    // Describo una prueba para la ruta DELETE /carts/:cid/product/:pid
    describe('DELETE /carts/:cid/product/:pid', () => {
        // Prueba: Eliminar un producto del carrito
        it('should delete a product from the cart', async () => {
            // Defino el ID del carrito y del producto a eliminar
            const cartId = 'someCartId';
            const productId = 'someProductId';
            // Envío una solicitud DELETE al servidor para eliminar el producto del carrito
            const response = await supertest(app)
                .delete(`/api/carts/${cartId}/product/${productId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            // Verifico que se haya eliminado el producto del carrito correctamente
            expect(response.body).to.have.property('message', 'Product deleted from the cart');
        });
    });

    // Describo una prueba para la ruta POST /carts
    describe('POST /carts', () => {
        // Prueba: Crear un nuevo carrito
        it('should create a new cart', async () => {
            // Defino los datos del carrito a crear
            const cartData = { userId: 'someUserId' };
            // Envío una solicitud POST al servidor para crear un nuevo carrito
            const response = await supertest(app)
                .post('/api/carts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(cartData)
                .expect(201);
            // Verifico que se haya creado el carrito correctamente
            expect(response.body).to.have.property('message', 'Cart created successfully');
            expect(response.body.cart).to.include(cartData);
        });
    });

    // Describo una prueba para la ruta GET /carts/:cid
    describe('GET /carts/:cid', () => {
        // Prueba: Obtener los contenidos de un carrito
        it('should fetch the contents of a cart', async () => {
            // Defino el ID del carrito a obtener
            const cartId = 'someCartId';
            // Envío una solicitud GET al servidor para obtener los contenidos del carrito
            const response = await supertest(app)
                .get(`/api/carts/${cartId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            // Verifico que se hayan obtenido los contenidos del carrito correctamente
            expect(response.body).to.have.property('cart');
            expect(response.body.cart).to.be.an('object');
        });
    });

    // Describo una prueba para la ruta PUT /carts/:cid
    describe('PUT /carts/:cid', () => {
        // Prueba: Actualizar el array de productos de un carrito
        it('should update the products array of a cart', async () => {
            // Defino el ID del carrito y los nuevos productos a actualizar
            const cartId = 'someCartId';
            const products = [{ productId: 'someProductId', quantity: 3 }];
            // Envío una solicitud PUT al servidor para actualizar el array de productos del carrito
            const response = await supertest(app)
                .put(`/api/carts/${cartId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(products)
                .expect(200);
            // Verifico que se haya actualizado el array de productos del carrito correctamente
            expect(response.body).to.have.property('message', 'Products in the cart updated');
            expect(response.body.cart.products).to.deep.equal(products);
        });
    });

    // Describo una prueba para la ruta DELETE /carts/:cid
    describe('DELETE /carts/:cid', () => {
        // Prueba: Eliminar un carrito
        it('should delete a cart', async () => {
            // Defino el ID del carrito a eliminar
            const cartId = 'someCartId';
            // Envío una solicitud DELETE al servidor para eliminar el carrito
            const response = await supertest(app)
                .delete(`/api/carts/${cartId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            // Verifico que se haya eliminado el carrito correctamente
            expect(response.body).to.have.property('message', 'Cart deleted successfully');
        });
    });

    // Describo una prueba para la ruta POST /carts/:cid/purchase
    describe('POST /carts/:cid/purchase', () => {
        // Prueba: Completar el proceso de compra para un carrito
        it('should complete the purchase process for a cart', async () => {
            // Defino el ID del carrito a comprar
            const cartId = 'someCartId';
            // Envío una solicitud POST al servidor para completar el proceso de compra del carrito
            const response = await supertest(app)
                .post(`/api/carts/${cartId}/purchase`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            // Verifico que se haya completado el proceso de compra del carrito correctamente
            expect(response.body).to.have.property('ticket');
            expect(response.body.ticket).to.be.an('object');
        });
    });
});