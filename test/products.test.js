// Importo las librerías y módulos necesarios
import supertest from 'supertest';
import * as chai from 'chai';
import app from '../src/app.js';
import mongoose from 'mongoose';
import config from '../src/config/envConfig.js';

// Obtengo la función expect de chai
const expect = chai.expect;

// Describo un grupo de pruebas para el enrutador de productos
describe('Products Router', () => {
    // Antes de todas las pruebas, inicio el servidor y me conecto a la base de datos
    this.beforeAll(async () => {
        app.listen(8080)
        await mongoose.connect(config.db.URI_DEV)
    });

    // Después de todas las pruebas, desconecto de la base de datos
    this.afterAll(async () => {
        await mongoose.disconnect()
    });

    // Describo una prueba para la ruta GET /products
    describe('GET /products', () => {
        // Prueba: Obtener productos con paginación predeterminada
        it('should fetch products with default pagination', async () => {
            // Envío una solicitud GET al servidor para obtener productos
            const response = await supertest(app)
                .get('/api/products')
                .expect('Content-Type', /json/)
                .expect(200);
            // Verifico que la respuesta sea un objeto
            expect(response.body).to.be.an('object');
            // Verifico que haya una matriz de productos en la respuesta
            expect(response.body.products).to.be.an('array');
            // Verifico que haya un número total de páginas en la respuesta
            expect(response.body.totalPages).to.be.a('number');
            // Verifico que haya un enlace previo en la respuesta, que sea nulo o una cadena de texto
            expect(response.body.prevLink).to.satisfy((link) => link === null || typeof link === 'string');
            // Verifico que haya un enlace siguiente en la respuesta, que sea nulo o una cadena de texto
            expect(response.body.nextLink).to.satisfy((link) => link === null || typeof link === 'string');
        });
    });

    // Describo una prueba para la ruta GET /products/:pid
    describe('GET /products/:pid', () => {
        // Prueba: Obtener un solo producto por ID
        it('should fetch a single product by id', async () => {
            // Defino el ID del producto a obtener
            const productId = 'someProductId';
            // Envío una solicitud GET al servidor para obtener el producto por su ID
            const response = await supertest(app)
                .get(`/api/products/${productId}`)
                .expect('Content-Type', /json/)
                .expect(200);
            // Verifico que la respuesta sea un objeto
            expect(response.body).to.be.an('object');
            // Verifico que el producto en la respuesta sea un objeto
            expect(response.body.product).to.be.an('object');
            // Verifico que el ID del producto en la respuesta sea igual al ID esperado
            expect(response.body.product.id).to.equal(productId);
        });
    });

    // Describo una prueba para la ruta POST /products
    describe('POST /products', () => {
        // Prueba: Crear un nuevo producto
        it('should create a new product', async () => {
            // Defino los datos del nuevo producto
            const productData = {
                title: 'Test Product',
                price: 100,
                category: 'Test Category',
                status: 'available'
            };
            // Envío una solicitud POST al servidor para crear el nuevo producto
            const response = await supertest(app)
                .post('/api/products')
                .send(productData)
                .expect('Content-Type', /json/)
                .expect(200);
            // Verifico que la respuesta incluya las claves esperadas del nuevo producto
            expect(response.body).to.include.keys('id', 'title', 'price', 'category', 'status');
            // Verifico que el título del producto en la respuesta sea igual al título esperado
            expect(response.body.title).to.equal(productData.title);
        });
    });

    // Describo una prueba para la ruta PUT /products/:pid
    describe('PUT /products/:pid', () => {
        // Prueba: Actualizar un producto
        it('should update a product', async () => {
            // Defino el ID del producto a actualizar y los nuevos datos de actualización
            const productId = 'someProductId';
            const updateData = {
                price: 150
            };
            // Envío una solicitud PUT al servidor para actualizar el producto
            const response = await supertest(app)
                .put(`/api/products/${productId}`)
                .send(updateData)
                .expect('Content-Type', /json/)
                .expect(200);
            // Verifico que la respuesta sea un objeto
            expect(response.body).to.be.an('object');
            // Verifico que el precio del producto actualizado sea igual al precio esperado
            expect(response.body.price).to.equal(updateData.price);
        });
    });

    // Describo una prueba para la ruta DELETE /products/:pid
    describe('DELETE /products/:pid', () => {
        // Prueba: Eliminar un producto
        it('should delete a product', async () => {
            // Defino el ID del producto a eliminar
            const productId = 'someProductId';
            // Envío una solicitud DELETE al servidor para eliminar el producto
            const response = await supertest(app)
                .delete(`/api/products/${productId}`)
                .expect(200);
            // Verifico que el texto de la respuesta indique que el producto fue eliminado correctamente
            expect(response.text).to.include('The product is deleted? : true');
        });
    });
});