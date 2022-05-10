const express = require("express");
const cors = require("cors");
const axios = require("axios").default;
const bodyParser = require("body-parser");
require("dotenv").config();
const PORT = 3000;
const data = require("./Movie Data/data.json");
const app = express();
const morgan = require("morgan");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan());

// keys
let apiKey = process.env.API_KEY;
let url = process.env.DATABASE_URL;

// sql
const { Client } = require("pg");
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Home page
app.get("/", HandleMoive);

// @rout
// @description: Trending Movie
app.get("/trending", getTrendingMovies);
// @rout
// @description: Search by movie name
app.get("/search", searchMovies);
// @rout
// @description: Favorite page
app.get("/tv", getGenres);
// @rout
// @description: Movie changed in the past 24 hours.
app.get("/changes", getChanges);

// @rout
// @description: Favorite page
app.get("/favorite", (req, res) => {
  res.send("Welcome to Favorite Page");
});

// @rout
// @description: addMovie
app.post("/addMovie", addMovie);
// @rout
// @description: getMovie
app.get("/getMovies", getMovies);

// @rout
// @description: updateMovies
app.put("/updateMovie/:id", updateMovie);

// @rout
// @description: updateMovies
app.delete("/deleteMovie/:id", deleteMovie);

// @rout
// @description: updateMovies
app.get("/getMovie/:id", getMovie);

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
  res.json(movie);
}

// * Task 12 *//
function getTrendingMovies(req, res) {
  let url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`;
  axios
    .get(url)
    .then((result) => {
      // res.json(result.data.results);
      // throw new Error
      let movies = result.data.results.map((movie) => {
        return new Movie(
          movie.id,
          movie.title,
          movie.release_date,
          movie.poster_path,
          movie.overview
        );
      });
      res.json(movies);
    })
    .catch((error) => {
      res.send("error in getting data from API");
    });
}

function searchMovies(req, res) {
  let q_name = req.query.name;
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${q_name}&page=1`;
  axios
    .get(url)
    .then((result) => {
      let movieArray = result.data.results.map((movie) => {
        return new Movie(
          movie.id,
          movie.title,
          movie.release_date,
          movie.poster_path,
          movie.overview
        );
      });
      res.json(movieArray);
    })
    .catch((error) => {
      res.json(error);
    });
}

function getGenres(req, res) {
  let url = `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=en-US`;
  axios
    .get(url)
    .then((result) => {
      let tvGenre = result.data.genres.map((genre) => {
        return new TVGenre(genre.id, genre.name);
      });
      res.json(tvGenre);
    })
    .catch((error) => {
      res.send(error);
    });
}

function getChanges(req, res) {
  let url = `https://api.themoviedb.org/3/movie/changes?api_key=${apiKey}&page=1`;
  axios
    .get(url)
    .then((result) => {
      let changes = result.data.results.map((changes) => {
        return new Changes(changes.id, changes.adult);
      });
      res.json(changes);
    })
    .catch((error) => {
      res.send(error);
    });
}

// Constructer function
function Movie(title, poster_path, overview) {
  this.title = title;
  this.poster_path = poster_path;
  this.overview = overview;
}

function Movie(id, title, release_date, poster_path, overview) {
  (this.id = id),
    (this.title = title),
    (this.release_date = release_date),
    (this.poster_path = poster_path),
    (this.overview = overview);
}

function TVGenre(id, name) {
  (this.id = id), (this.name = name);
}

function Changes(id, adult) {
  (this.id = id), (this.adult = adult);
}

function addMovie(req, res) {
  let { title, releaseDate, posterPath, overview, comments } = req.body;
  let sql = `INSERT INTO movie (title,releaseDate,posterPath,overview,comments  ) VALUES($1, $2, $3,$4,$5) RETURNING *;`;
  let values = [title, releaseDate, posterPath, overview, comments];

  client
    .query(sql, values)
    .then((result) => {
      console.log(result);
      return res.status(201).json(result.rows);
    })
    .catch((error) => {
      console.log(error);
    });
}

function getMovies(req, res) {
  let sql = `SELECT * FROM movie ;`;
  client
    .query(sql)
    .then((result) => {
      console.log(result);
      res.json(result.rows);
    })
    .catch((err) => {
      console.log(err);
    });
}

function updateMovie(req, res) {
  // comments
  let id = req.params.id;
  let comments = req.body.comments;

  let sql = `UPDATE movie SET comments =$1 WHERE id = ${id} RETURNING *`;
  let values = [comments];
  client
    .query(sql, values)
    .then((result) => {
      res.status(301).json(result.rows);
    })
    .catch((err) => {
      throw err;
    });
}

function deleteMovie(req, res) {
  let id = req.params.id;
  let sql = `DELETE FROM movie WHERE id =${id} RETURNING *`;
  client
    .query(sql)
    .then((result) => {
      res.status(202).json({ Message: "Movie deleted successfully" });
    })
    .catch((err) => {
      console.log(err);
    });
}

function getMovie(req, res) {
  let id = req.params.id;
  console.log(id, "ididididiidd");

  let sql = `SELECT * FROM movie  WHERE id =${id}`;
  client
    .query(sql)
    .then((result) => {
      res.json(result.rows);
    })
    .catch((err) => {
      console.log(err);
    });
}

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });
});
