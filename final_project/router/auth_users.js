const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const SECRET_KEY = "63c7d36a8f8744c6db4a1510e8d897dbb1016176929861576e3de5b6869fe16f";
let users = [{
    "username": "user",
    "password": "password123"
}];

const isValid = (username) => {
    return users.some((user) => user.username === username);
}

const authenticatedUser = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
        req.user = decoded.username;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: "1h" });

    req.session.token = token; // Store token in session
    return res.json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", authenticatedUser, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.user;

    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

// Delete a book review (only by the user who created it)
regd_users.delete("/auth/review/:isbn", authenticatedUser, (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
    if (!token) {
        return res.status(403).json({ message: "Authentication required" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        const username = decoded.username;
        const { isbn } = req.params;

        // Check if the book exists
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check if the book has reviews
        if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
            return res.status(404).json({ message: "No reviews found for this book" });
        }

        // Find the user's review
        if (books[isbn].reviews[username]) {
            delete books[isbn].reviews[username];
            return res.status(200).json({ message: "Review deleted successfully" });
        } else {
            return res.status(404).json({ message: "Review not found for this user" });
        }
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
