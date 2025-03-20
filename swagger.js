require("dotenv").config();
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const PORT = process.env.PORT;
const APP_URL = process.env.APP_URL;

const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "AI Email Responder",
        version: "1.0.0",
        description: "AI Email Responder API documentation",
      },
      servers: [
        {
          url: `${APP_URL}:${PORT}/api/email`
        },
      ],
    },
    apis: ["./routes/email.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;