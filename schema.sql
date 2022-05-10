DROP TABLE IF EXISTS movie;

CREATE TABLE IF NOT EXISTS movie (
    id SERIAL PRIMARY KEY,
    title varchar(255),
    releaseDate  varchar(255),
    posterPath  varchar(255),
    overview  varchar(255),
    comments  varchar(255)
);