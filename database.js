////////////////REQUIRMENTS///////////////

const spicedPG = require('spiced-pg');

const db = spicedPG('postgres:postgres:postgres@localhost:5432/petition');

//////////////FUN////////////////////////

module.exports.newSignatureInDb = function newSignatureInDb(
    first_name,
    last_name,
    signature
) {
    //////the required parameters
    return db.query(
        'INSERT INTO signatures (first_name, last_name, signature) VALUES ($1, $2, $3) RETURNING id',
        [first_name || null, last_name || null, signature || null]
    );
};

module.exports.numbOfSig = function numbOfSig() {
    return db.query('SELECT * FROM signatures');
};

module.exports.allUserData = function allUserData() {
    return db.query(`SELECT

                        users.first_name,
                        users.last_name,
                        users.email,
                        info.age,
                        info.city,
                        info.homepage
                    FROM users
                    JOIN info

                    ON users.id = info.user_id`);
};

module.exports.allExPass = function allExPass(
    first_name,
    last_name,
    email,
    id
) {
    console.log(first_name, last_name, email, id, 'inside allExPass module');

    return db.query(
        `

        UPDATE users
        SET     first_name = $1,
                last_name = $2,
                email = $3

        WHERE   id = $4

        `,
        [first_name || null, last_name || null, email || null, id || null]
    );
};

module.exports.extractUserInfo = function extractUserInfo(id) {
    return db.query(
        `
        SELECT users.first_name, users.last_name, users.email, info.age, info.city, info.homepage
        FROM users
        JOIN info
        ON users.id = info.user_id
        WHERE users.id = $1`,

        [id]
    );
};

module.exports.allInfo = function allInfo(
    first_name,
    last_name,
    email,
    password,
    id
) {
    console.log(
        first_name,
        last_name,
        email,
        password,
        id,
        'inside allInfo module'
    );

    return db.query(
        `

            UPDATE users
            SET
                    first_name = $1,
                    last_name = $2,
                    email = $3,
                    password = $4

            WHERE   id = $5

            `,
        [first_name || null, last_name || null, email || null, password, id]
    );
};

module.exports.miscInfo = function miscInfo(age, city, homepage, user_id) {
    console.log(age, city, homepage, user_id, 'inside misc module');
    return db.query(
        `

                INSERT INTO info (age, city, homepage, user_id)
                VALUES ($1,$2,$3,$4)
                ON CONFLICT (user_id)
                DO UPDATE SET age = $1, city = $2, homepage = $3

`,
        [age || null, city || null, homepage || null, user_id]
    );
};

module.exports.newUser = function(first, last, email, pw) {
    return db.query(
        'INSERT INTO users (first_name, last_name, email, password) VALUES($1, $2, $3, $4) RETURNING id, first_name, last_name',
        [first || null, last || null, email || null, pw || null]
    );
};

module.exports.getUsers = () => {
    return db.query('SELECT * FROM users');
};

module.exports.newInfo = (age, city, homepage, user_id) => {
    return db.query(
        'INSERT INTO info (age, city, homepage, user_id) VALUES($1, $2, $3, $4)',
        [age || null, city || null, homepage || null, user_id]
    );
};
