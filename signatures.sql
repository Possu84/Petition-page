
DROP TABLE IF EXISTS signatures;

DROP TABLE IF EXISTS info;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
        id         SERIAL PRIMARY KEY,
        first_name VARCHAR(255),
        last_name  VARCHAR(255),
        email      VARCHAR(255),
        password   VARCHAR(255)


    );

CREATE TABLE signatures (
        id          SERIAL PRIMARY KEY,
        signature   TEXT,
        user_id     INTEGER  REFERENCES users(id) NOT NULL UNIQUE
    );

CREATE TABLE info (

        id          SERIAL PRIMARY KEY,
        age         VARCHAR(255),
        city        VARCHAR(255),
        homepage    VARCHAR(255),
        user_id     INTEGER  REFERENCES users(id) NOT NULL UNIQUE


    );
