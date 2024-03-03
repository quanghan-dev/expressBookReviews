const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
let booksWithoutISBN = [];

const isValid = (username) => {
  let usersWithSameName = users.filter((user) => {
    return user.username === username;
  });

  return usersWithSameName > 0;
};

const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => {
    return user.username === username && user.password === password;
  });

  return validUsers.length > 0;
};

const getBooksWithoutISBN = () => {
  if (booksWithoutISBN.length <= 0) {
    for (var isbn in books) {
      booksWithoutISBN.push(books[isbn]);
    }
  }
  return booksWithoutISBN;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, "access", {
      expiresIn: 60 * 60,
    });

    req.session.authorization = { accessToken, username };

    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  let book = books[isbn];
  let username = req.session.authorization.username;

  if (!book) {
    return res.status(404).json({ message: "Invalid ISBN!" });
  }

  let reviews = book.reviews;
  let reviewedReview = reviews.filter(
    (review) => review.username === username
  )[0];

  if (reviews.length === 0 || !reviewedReview) {
    reviews.push({ username, review });
  } else {
    reviewedReview.review = review;
  }

  return res.status(200).send(book);
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  let book = books[isbn];
  let username = req.session.authorization.username;

  if (!book) {
    return res.status(404).json({ message: "Invalid ISBN!" });
  }

  let reviews = book.reviews;
  let reviewedReview = reviews.filter(
    (review) => review.username === username
  )[0];

  if (!reviewedReview) {
    return res.status(400).send("You've not commented this book.");
  } else {
    reviews = reviews.filter((review) => review.username !== username);
  }

  return res.status(200).send(`Your comment on book ${isbn} has been deleted.`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.getBooksWithoutISBN = getBooksWithoutISBN;
