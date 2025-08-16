const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BeWare API',
      version: 'Beta',
      description: 'Your travelbuddy social media API for sharing travel safety + tips + experiences',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local Server, generally on PORT 3000' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app) {
  app.use('/interactive_api', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = swaggerDocs;