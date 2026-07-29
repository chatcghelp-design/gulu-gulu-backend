const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Gulu-Gulu Admin API',
            version: '1.0.0',
            description: 'API documentation for your Dating Admin backend'
        },
        servers: [
            {
                url: `${process.env.API_URL}` || 'http://localhost:3001/api/v1',
                description: 'Local server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/routes/**/*.js', './src/controllers/**/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
