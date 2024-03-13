// Importo la librería supertest para realizar pruebas HTTP y la función expect de chai para realizar afirmaciones
import supertest from 'supertest';
import { expect } from 'chai';
// Importo la aplicación express para realizar las pruebas
import app from '../src/app.js';

// Describo un grupo de pruebas para el enrutador de sesiones
describe('Sessions Router', () => {
    // Describo una prueba para la ruta POST /sessions/register
    describe('POST /sessions/register', () => {
        // Prueba: Registrar un nuevo usuario y redirigir al inicio de sesión
        it('should register a new user and redirect to login', async () => {
            // Defino los datos del nuevo usuario
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                age: "1"
            };
            // Envío una solicitud POST al servidor para registrar el nuevo usuario
            const response = await supertest(app)
                .post('/auth/sessions/register')
                .send(userData)
                .expect(302);
            // Verifico que la cabecera de ubicación en la respuesta sea igual a '/login'
            expect(response.headers.location).to.equal('/login');
        });
    });

    // Describo una prueba para la ruta POST /sessions/login
    describe('POST /sessions/login', () => {
        // Prueba: Iniciar sesión del usuario y redirigir a /api/products
        it('should login the user and redirect to /api/products', async () => {
            // Defino las credenciales del usuario para iniciar sesión
            const credentials = {
                email: 'test@example.com',
                password: 'password123',
            };
            // Envío una solicitud POST al servidor para iniciar sesión con las credenciales
            const response = await supertest(app)
                .post('/auth/sessions/login')
                .send(credentials)
                .expect(302);
            // Verifico que la cabecera de ubicación en la respuesta sea igual a '/api/products'
            expect(response.headers.location).to.equal('/api/products');
            // Verifico que la cabecera 'set-cookie' en la respuesta sea un array no vacío
            expect(response.headers['set-cookie']).to.be.an('array').that.is.not.empty;
        });
    });

    // Describo una prueba para la ruta GET /sessions/logout
    describe('GET /sessions/logout', () => {
        // Prueba: Cerrar sesión del usuario y redirigir a /login
        it('should logout the user and redirect to /login', async () => {
            // Envío una solicitud GET al servidor para cerrar sesión
            const response = await supertest(app)
                .get('/auth/sessions/logout')
                .expect(302);
            // Verifico que la cabecera de ubicación en la respuesta sea igual a '/login'
            expect(response.headers.location).to.equal('/login');
        });
    });

    // Describo una prueba para la ruta POST /sessions/changePassword
    describe('POST /sessions/changePassword', () => {
        // Prueba: Iniciar el proceso de cambio de contraseña
        it('should initiate the password change process', async () => {
            // Defino los datos de solicitud para iniciar el cambio de contraseña
            const requestData = {
                email: 'test@example.com',
            };
            // Envío una solicitud POST al servidor para iniciar el cambio de contraseña
            const response = await supertest(app)
                .post('/auth/sessions/changePassword')
                .send(requestData)
                .expect(200);
        });
    });

    // Describo una prueba para la ruta POST /sessions/trueChangePassword
    describe('POST /sessions/trueChangePassword', () => {
        // Prueba: Cambiar la contraseña con éxito y redirigir al inicio de sesión
        it('should successfully change the password and redirect to login', async () => {
            // Defino los datos de solicitud para cambiar la contraseña
            const requestData = {
                uid: 'validUserId',
                password: 'newUniquePassword123'
            };
            // Envío una solicitud POST al servidor para cambiar la contraseña
            const response = await supertest(app)
                .post('/auth/sessions/trueChangePassword')
                .send(requestData)
                .expect(302);
            // Verifico que la cabecera de ubicación en la respuesta sea igual a '/login'
            expect(response.headers.location).to.equal('/login');
        });
    });
});