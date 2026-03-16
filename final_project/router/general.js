const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


// NODE FUNCTIONS

// Register a new user
public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (username && password) {
    users.push({ username, password });
    return res.status(200).json({message: "User successfully registered. Now you can login"});
  } else {
    return res.status(400).json({message: "Unable to register user. Username and password required."});
  }
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book does not exist" });
  }

  return res.status(200).json(book);
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const author_books = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author.toLowerCase()
  );

  if (author_books.length === 0) {
    return res.status(404).json({
      message: `No books found for author: ${author}`
    });
  }

  return res.status(200).json(author_books);
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const foundBooks = Object.values(books).filter(
    (book) => book.title.toLowerCase() === title.toLowerCase()
  );

  if (foundBooks.length === 0) {
    return res.status(404).json({
      message: `No books found with title: ${title}`
    });
  }

  return res.status(200).json(foundBooks);
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;



// AXIOS FUNCTIONS


// Get all books
async function getAllBooks() {
  try {
    const response = await axios.get("http://localhost:5300/");
    console.log(response.data);
  } catch (error) {
    console.log("Error fetching books:", error.message);
  }
}


// Get books by ISBN
async function getBooksByISBN(isbn) {
  try {
    const response = await axios.get(`http://localhost:5300/isbn/${isbn}`);
    console.log(response.data);
  } catch (error) {
    console.log("Error fetching book by ISBN:", error.message);
  }
}


// Get books by author
async function getBookDetailsByAuthor(author) {
  try {
    const response = await axios.get(`http://localhost:5300/author/${author}`);
    console.log(response.data);

    if (response.data.length === 0) {
      console.log(`No books found for author: ${author}`);
    }

  } catch (error) {
    console.log("Error fetching books by author:", error.message);
  }
}


// Get books by title
async function getBookDetailByTitle(title) {
  try {
    const response = await axios.get(`http://localhost:5300/title/${title}`);
    console.log(response.data);

    if (response.data.length === 0) {
      console.log(`No books found with title: ${title}`);
    }

  } catch (error) {
    console.log("Error fetching books by title:", error.message);
  }
}