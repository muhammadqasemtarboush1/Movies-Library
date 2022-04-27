const express = require("express");
const data = require("./Movie Data/data.json");
const app = express();
const port = 3000;

// Home page
app.get("/", HandleMoive);

// @rout
// @description: Favorite page
app.get("/favorite", (req, res) => {
  res.send("Welcome to Favorite Page");
});

// error rout just for testing purposes
app.get("/err", (req, res, next) => {
  next(new Error("Sorry the page you are trying to access is not available"));
});

// Error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});
app.use(function (err, req, res, next) {
  res.status(err.status || 500);

  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

// Controller Home page
function HandleMoive(req, res) {
  let movie = new Movie(data.title, data.poster_path, data.overview);
  console.log(movie);
  res.json(movie);
}

// Constructer function
function Movie(title, poster_path, overview) {
  this.title = title;
  this.poster_path = poster_path;
  this.overview = overview;
}

let PORT = process.env.PORT || 3000;

// runing the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
