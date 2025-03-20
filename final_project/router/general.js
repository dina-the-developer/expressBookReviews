const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

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
    return res.status(200).json({ books });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
    const { isbn } = await req.params;

    if (books[isbn]) {
        return res.status(200).json({ book: books[isbn] });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
    const { author } = req.params;
    const filteredBooks = Object.values(books).filter(
        (book) => book.author === author
    );

    if (filteredBooks.length > 0) {
        return res.status(200).json({ books: filteredBooks });
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
    const { title } = req.params;
    const filteredBooks = Object.values(books).filter(
        (book) => book.title === title
    );

    if (filteredBooks.length > 0) {
        return res.status(200).json({ books: filteredBooks });
    } else {
        return res.status(404).json({ message: "No books found with this title" });
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
