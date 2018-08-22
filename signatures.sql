
DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
        id          SERIAL PRIMARY KEY,
        first_name  VARCHAR(255),
        last_name   VARCHAR(255),
        signature   TEXT

    );


DROP TABLE IF EXISTS users;

CREATE TABLE users (
        id         SERIAL PRIMARY KEY,
        first_name VARCHAR(255),
        last_name  VARCHAR(255),
        email      VARCHAR(255),
        password   VARCHAR(255)

    );


DROP TABLE IF EXISTS info;

CREATE TABLE info (

        id          SERIAL PRIMARY KEY,
        age         VARCHAR(255),
        city        VARCHAR(255),
        homepage    VARCHAR(255),
        user_id     INTEGER NOT NULL


    );
