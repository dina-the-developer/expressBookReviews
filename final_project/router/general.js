const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    return users.some((user) => user.username === username);
};

const getAllBooks = () => {
    return books;
};

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ message: "Username and password are required" });
    }

    if (users[username]) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users[username] = { password };
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
    try {
        const allBooks = await getAllBooks();
        return res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (e) {
        res.status(500).send(e);
    }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
    const isbn = parseInt(req.params.isbn)
    const book = await books[isbn];

    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
    const filteredBooks = Object.values(await books).filter(
        (book) => book.author.toLowerCase() === req.params.author.toLowerCase()
    );

    if (filteredBooks.length > 0) {
        return res.status(200).json({ books: filteredBooks });
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
    const title = Object.values(await books).filter(
        (book) => book.title.toLowerCase() === req.params.title.toLowerCase()
      )[0];
      if (title) {
        return res.status(200).json(title);
      } else {
        return res.status(404).json({ message: "Title not found." });
      }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
    const { isbn } = req.params;

    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json({ reviews: books[isbn].reviews });
    } else {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
});

module.exports.general = public_users;
