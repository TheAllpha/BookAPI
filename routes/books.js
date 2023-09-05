const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");

const idLength = 5;

/**
 * @swagger
 * components:
 *    schemas:
 *      Book:
 *        type: object
 *        required:
 *          - title
 *          - author
 *        properties:
 *          id:
 *            type: string
 *            description: The auto-generated ID of the book
 *          title:
 *            type: string
 *            description: The book title
 *          author:
 *            type: string
 *            description: The book author
 *        example:
 *          id: d5fE_asz
 *          title: The new turing omnibus
 *          author: Alexander K. Dawney
 */

/**
 * @swagger
 * /books:
 *    get:
 *      summary: Get a list of all books
 *      tags: [Books]
 *      responses:
 *        200:
 *          description: A list of books
 *          content:
 *             application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Book' 
 */

router.get("/", (req, res) => {
  const books = req.app.db.get("books");

  res.send(books);
});

/**
 * @swagger
 * /books/{id}:
 *    get:
 *      summary: Get a book by ID
 *      tags: [Books]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema: 
 *            type: string
 *          required: true
 *          description: The book ID
 *      responses:
 *        200:
 *          description: The book description by ID
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Book'
 *        404:
 *          description: The book was not found
 */

router.get("/:id", (req, res) => {
  const book = req.app.db.get("books").find({ id: req.params.id }).value();

  if (!book) {
    return res.sendStatus(404);
  }

  res.send(book);
});

/**
 * @swagger
 * /books:
 *  post:
 *      summary: Create a new book
 *      tags: [Books]
 *      requestBody:
 *         required: true
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *      responses:
 *        201:
 *          description: The book was successfully created.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Book'
 *        500: 
 *          description: Some server error
 */

router.post("/", (req, res) => {
  try {
    const book = {
      id: nanoid(idLength),
      ...req.body,
    };

    req.app.db.get("books").push(book).write();

    res.status(201).send(book);
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * @swagger
 * /books/{id}:
 *  put:
 *      summary: Update a book by ID
 *      tags: [Books]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema: 
 *            type: string
 *          required: true
 *          description: The book ID
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Book'      
 *      responses:
 *        200:
 *          description: The book was updated
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Book'
 *        404:
 *          description: The book was not found
 *        500:
 *          description: Some server error
 */

router.put("/:id", (req, res) => {
  try {
    const book = req.app.db.get("books").find({ id: req.params.id });

    if (!book.value()) {
      return res.sendStatus(404);
    }

    book.assign(req.body).write();
    res.send(book.value());
  } catch (error) {
    return res.status(500).send(error);
  }
});

/**
 * @swagger
 * /books/{id}:
 *  delete:
 *      summary: Remove a book by ID
 *      tags: [Books]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema: 
 *            type: string
 *          required: true
 *          description: The book ID     
 *      responses:
 *        200:
 *          description: The book was deleted
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Book'
 *        404:
 *          description: The book was not found
 */

router.delete("/:id", (req, res) => {
  const book = req.app.db.get("books").remove({ id: req.params.id }).write();

  if (book.length === 0) {
    return res.sendStatus(404);
  }

  res.sendStatus(200);
});

module.exports = router;
