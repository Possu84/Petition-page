////////////DEPENDENSIES//////////////////////////////
const express = require('express'); //require express

const app = express(); ///envoke and sign the function to app

const cookieSession = require('cookie-session');

const hb = require('express-handlebars');

const c = require('chalk-animation');

const pg = require('pg');

const database = require('./database');

var bcrypt = require('./bcrypt');

var csurf = require('csurf');

// const client = new pg.Client(
//     'postgres://spicedling:password@localhost:5432/singature'
// );

///////////////ENGINE SETUP///////////////////

app.engine('handlebars', hb());

app.set('view engine', 'handlebars');

app.use(require('cookie-parser')());

app.use(express.static('./public')); /// in default looks for the default files from public folder

app.use(
    require('body-parser').urlencoded({
        extended: false
    })
);

//////////////CODE///////////////////////

///////////////FUNCTIONS///////////////////////////

function checkForSigId(req, res, next) {
    // console.log('inside checkForSigId', req.session.rows);
    if (!req.session.sigId) {
        res.redirect('/');
    } else {
        next();
    }
}

// function checkForm() {
//     var isValid = true;
//     $('#form').each(function() {
//         if ($(this).val() === '') isValid = false;
//     });
//     return isValid;
// }

// client.connect(function(err) {
//     if (err) {
//         console.log(err);
//     } else {
//         client.query('SELECT * FROM singature', function(err, results) {
//             console.log(results.rows);
//             client.end();
//         });
//     }
// });

// when @ http://localhost:8080/index use main layout and imped the petition tempalte

//////////////cookie sessions/////////

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

////////petition get + post ///////////

app.get('/petition', (req, res) => {
    res.render('petition', {
        layout: 'main'
    });
});

app.post('/petition', (req, res) => {
    if (
        req.body.first_name == '' ||
        req.body.last_name == '' ||
        req.body.signature == ''
    ) {
        return res.render('petition', {
            layout: 'main',
            error: true
        });
    }
    // console.log(req.body);
    database
        .newSignatureInDb(
            req.body.first_name,
            req.body.last_name,
            req.body.hidden_input
        )
        .then(result => {
            req.session.sigId = result.rows[0].id;
            res.redirect('/thanks');
        })
        .catch(err => {
            // console.log(err);
            res.render('petition', {
                layout: 'main'
            });
        });
});

////////////////register get and post route///////////////

app.get('/', (req, res) => {
    res.render('register', {
        layout: 'main'
    });
});

app.post('/', (req, res) => {
    if (
        req.body.first == '' ||
        req.body.last == '' ||
        req.body.email == '' ||
        req.body.password == ''
    ) {
        return res.render('register', {
            layout: 'main',
            error: true
        });
    }
    let { first, last, email, password } = req.body; //// this is what we are sending when we push the submit
    bcrypt.hashPass(password).then(hashedpass => {
        database
            .newUser(first, last, email, hashedpass)
            .then(responce => {
                req.session.user = {
                    first: first,
                    last: last,
                    userId: responce.rows[0].id
                };
                res.redirect('/info');
            })
            .catch(() => {
                res.render('register', {
                    layout: 'main',
                    error: true
                });
            });
    });
    // console.log(first, last, email, password);
});

/////////////////login post and get ///////////////

app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'main'
    });
});

app.post('/login', (req, res) => {
    // console.log(req.body, 'this is log post');
    let { email, password } = req.body;

    database
        .getUsers()
        .then(responce => {
            // console.log(responce, 'responce');
            // because we are calling it from another file we need to write database.getUsers
            responce.rows.forEach(row => {
                console.log(row, 'rowoowow');
                // forEach loops through all the rows and arrays

                if (email == row.email) {
                    console.log('checking pass', password, row.password);
                    //// we are looping the email row
                    bcrypt.checkPass(password, row.password).then(doesMatch => {
                        if (doesMatch) {
                            console.log('correct pass');
                            req.session.user = {
                                first: row.first_name,
                                last: row.last_name,
                                userId: row.id
                            };
                            res.redirect('/petition');
                        } else {
                            console.log('error');
                            res.render('login', {
                                layout: 'main',
                                error: true
                            });
                        }
                    });
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.render('login', {
                layout: 'main',
                error: true
            });
        });
});

/////////////////// Thank you page get route//////////////
app.get('/thanks', checkForSigId, (req, res) => {
    database.numbOfSig().then(function(response) {
        let number = response.rows.length;
        let userSig;
        response.rows.forEach(function(item) {
            // console.log('signature: ', item.signature);
            // console.log('sigId: ', req.session.sigId);
            if (item.id == req.session.sigId) {
                userSig = item.signature;
            }
        });
        res.render('thanks', {
            layout: 'main',
            number,
            userSig
        });
    });
});

//////////////// Signers page get & post/////////////

app.get('/signers', checkForSigId, (req, res) => {
    database.numbOfSig().then(function(response) {
        res.render('signers', {
            layout: 'main',
            signers: response.rows
        });
    });
});

////////////////more info page//////////////

app.get('/info', (req, res) => {
    res.render('info', {
        layout: 'main'
    });
});

app.post('/info', (req, res) => {
    // console.log(req.session.row, 'profile info');
    database
        .newInfo(
            req.body.age,
            req.body.city,
            req.body.homepage,
            req.session.user.userId
        )
        .then(response => {
            res.redirect('/petition');
        })
        .catch(err => {
            console.log('HERE');
            res.render('info', {
                layout: 'main',
                error: true
            });
        });
});
// res.render('petition', { error: true });

/////////////LISTENING//////////////////////

// app.listen(8080, () => console.log('listening'));

app.listen(8080, () => c.glitch('Listening and pistening'));
