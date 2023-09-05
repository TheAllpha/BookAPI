const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const low = require("lowdb");
const booksRouter = require("./routes/books");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const FileSync = require("lowdb/adapters/FileSync");

const PORT = process.env.PORT || 4000;

const adapter = new FileSync("db.json");
const db = low(adapter);

db.defaults({ books: [] }).write();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Book API",
      version: "1.0.0",
      description: "A sample Express Book API",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

const app = express();

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

app.db = db;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/books", booksRouter);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
