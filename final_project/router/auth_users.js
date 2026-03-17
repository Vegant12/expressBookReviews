const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  if (username == users.filter((user) => {
    user.username == username
  })) {
    return true;
  }
}

const authenticatedUser = (username,password)=>{ 
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60});

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const {username} = req.session.authorization;
  const isbn = req.params.isbn;
  const review = req.query.review;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" })
  }

  if (!review) {
    return res.status(200).json({ message: "Review cannot be empty" })
  }

  book.reviews[username] = review;
  return res.status(200).json({
    message: "Review added/updated succesfully",
    reviews: book.reviews
  })
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session?.authorization?.username;
  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }
  const isbn = req.params.isbn;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" })
  }

  if (!book.reviews || !Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  delete book.reviews[username];
  return res.status(200).json({
    message: "Review deleted succesfully",
  })
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
