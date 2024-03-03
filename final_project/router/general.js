const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let getBooksWithoutISBN = require("./auth_users.js").getBooksWithoutISBN;
const public_users = express.Router();
const axios = require("axios").default;

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username, password });

      return res
        .status(200)
        .json({ message: "User successfully registred. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }

  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const { isbn } = req.params;

  if (books[isbn]) {
    return res.status(200).send(books[isbn]);
  }

  return res.status(404).json({ message: "Invalid ISBN!" });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const { author } = req.params;
  let foundBooks = getBooksWithoutISBN().filter(
    (book) => book.author === author
  );

  if (foundBooks.length > 0) {
    return res.status(200).send(foundBooks);
  }

  return res.status(404).json({ message: `Not found any ${author}'s book.` });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const { title } = req.params;
  let foundBooks = getBooksWithoutISBN().filter((book) => book.title === title);

  if (foundBooks.length > 0) {
    return res.status(200).send(foundBooks);
  }

  return res
    .status(404)
    .json({ message: `Not found any book with title ${title}` });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;

  if (books[isbn]) {
    let reviews = books[isbn].reviews;
    if (reviews.length > 0) {
      return res.status(200).send(reviews);
    }

    return res.status(201).send("This book does not have any review.");
  }

  return res
    .status(404)
    .json({ message: `Not found any book with ISBN ${isbn}` });
});

// ASYNC/AWAIT
const URL = "http://localhost:5000";

const getAllBooksAsync = async () => {
  const outcome = axios.get(URL);
  let booksResult = (await outcome).data;
  console.log(booksResult);
};

const getBookByISBNAsync = async (isbn) => {
  const outcome = axios.get(`${URL}/isbn/${isbn}`);
  let bookResult = (await outcome).data;
  console.log(bookResult);
};

const getBookByAuthorAsync = async (author) => {
  const outcome = axios.get(`${URL}/author/${author}`);
  let bookResult = (await outcome).data;
  console.log(bookResult);
};

const getBookByTitleAsync = async (title) => {
  const outcome = axios.get(`${URL}/title/${title}`);
  let bookResult = (await outcome).data;
  console.log(bookResult);
};

//getAllBooksAsync();
//getBookByISBNAsync(1);
//getBookByAuthorAsync("Unknown");
//getBookByTitleAsync("One Thousand and One Nights")

module.exports.general = public_users;
