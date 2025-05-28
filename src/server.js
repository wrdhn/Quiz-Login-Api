require('dotenv').config();
const Hapi = require('@hapi/hapi');
const authRoutes = require('./routes/auth');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: 'localhost',
        routes: {
            cors: {
                origin: ['*'], // Allow all origins for development
                headers: ['Accept', 'Authorization', 'Content-Type'],
                credentials: true
            }
        }
    });

    // Register routes
    server.route(authRoutes);

    // Error handling
    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        
        if (response.isBoom) {
            const errorResponse = {
                error: true,
                message: response.message,
                statusCode: response.output.statusCode
            };
            
            return h.response(errorResponse)
                .code(response.output.statusCode);
        }
        
        return h.continue;
    });

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
    console.log('Available routes:');
    console.log('POST /register - Register new user');
    console.log('POST /login - Login user');
    console.log('GET /verify - Verify JWT token');
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();