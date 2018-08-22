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


// module.export.changeInfo = function changeInfo() {
//
//
//
// }



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
