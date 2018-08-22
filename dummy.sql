CREATE TABLE users (

    id          SERIAL PRIMARY KEY,
    first       VARCHAR (200) NOT NULL,
    last        VARCHAR (200) NOT NULL,
    email       VARCHAR (200) NOT NULL UNIQUE,
    password    VARCHAR (200) NOT NULL

);


CREATE TABLE signatures (

    id              SERIAL PRIMARY KEY,
    first           VARCHAR (200) NOT NULL,
    last            VARCHAR (200) NOT NULL,
    signature       TEXT  NOT NULL,
    user_id         INTEGER REFERENCES users(id) NOT NULL


);
