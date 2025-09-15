import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Workspace API",
      version: "1.0.0",
      description: "API docs cho hệ thống workspace",
    },
    servers: [
      {
        url: "http://localhost:4000", // URL backend
      },
    ],
  },
  apis: ["./routes/*.js"], // chỉ định nơi chứa comment swagger
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
