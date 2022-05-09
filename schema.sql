DROP TABLE IF EXISTS film;

CREATE TABLE IF NOT EXISTS film (
    id SERIAL PRIMARY KEY,
    title varchar(255),
    releaseDate  varchar(255),
    posterPath  varchar(255),
    overview  varchar(255),
    pRating  varchar(255)
);