////////////DEPENDENSIES//////////////////////////////
const express = require("express"); //require express

const app = express(); ///envoke and sign the function to app

const cookieSession = require("cookie-session");

const hb = require("express-handlebars");

const c = require("chalk-animation");

// const pg = require('pg');

const database = require("./database");

const bcrypt = require("./bcrypt");

// var csurf = require('csurf');

// const client = new pg.Client(
//     'postgres://spicedling:password@localhost:5432/singature'
// );

///////////////ENGINE SETUP///////////////////

app.engine("handlebars", hb());

app.set("view engine", "handlebars");

app.use(require("cookie-parser")());

app.use(express.static("./public")); /// in default looks for the default files from public folder

app.use(
    require("body-parser").urlencoded({
        extended: false
    })
);

//////////////CODE///////////////////////

///////////////FUNCTIONS///////////////////////////

function checkForSigId(req, res, next) {
    // console.log('inside checkForSigId', req.session.rows);
    if (!req.session.sigId) {
        res.redirect("/");
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

////////////////register get and post route///////////////

app.get("/", (req, res) => {
    res.render("register", {
        layout: "main"
    });
});

app.post("/", (req, res) => {
    if (
        req.body.first == "" ||
        req.body.last == "" ||
        req.body.email == "" ||
        req.body.password == ""
    ) {
        return res.render("register", {
            layout: "main",
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
                console.log(req.session, " this is req session");
                res.redirect("/info");
            })
            .catch(() => {
                res.render("register", {
                    layout: "main",
                    error: true
                });
            });
    });
    // console.log(first, last, email, password);
});

////////////////more info page//////////////

app.get("/info", (req, res) => {
    res.render("info", {
        layout: "main"
    });
});

app.post("/info", (req, res) => {
    // console.log(req.session.row, 'profile info');
    database
        .newInfo(
            req.body.age,
            req.body.city,
            req.body.homepage,
            req.session.user.userId
        )
        .then(response => {
            res.redirect("/petition");
        })
        .catch(err => {
            console.log("HERE");
            res.render("info", {
                layout: "main",
                error: true
            });
        });
});
// res.render('petition', { error: true });

///////////////login post and get ///////////////

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

app.post("/login", (req, res) => {
    // console.log(req.body, 'this is log post');
    let { email, password } = req.body;

    database
        .getUsers()
        .then(responce => {
            // console.log(responce, 'responce');
            // because we are calling it from another file we need to write database.getUsers
            responce.rows.forEach(row => {
                // forEach loops through all the rows and arrays

                if (email == row.email) {
                    console.log("checking pass", password, row.password);
                    //// we are looping the email row
                    bcrypt.checkPass(password, row.password).then(doesMatch => {
                        if (doesMatch) {
                            console.log("correct pass");
                            req.session.user = {
                                first: row.first_name,
                                last: row.last_name,
                                userId: row.id
                            };

                            database
                                .checkSignature(req.session.user.userId)
                                .then(responce => {
                                    req.session.sigId = responce.rows[0].id;
                                    res.redirect("/thanks");
                                });
                            res.redirect("/petition");
                            console.log(req.session, "in the login screen");
                        } else {
                            console.log("error");
                            res.render("login", {
                                layout: "main",
                                error: true
                            });
                        }
                    });
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.render("login", {
                layout: "main",
                error: true
            });
        });
});

// app.post('/login', (req, res) => {
//     let email = req.body.email;
//     let password = req.body.password;
//
//     database
//         .checkUserLogin(email)
//         .then(user => {
//             console.log('checking user.pass. it is', user.password, password);
//             return bcrypt.checkPass(password, user.password).then(status => {
//                 if (status) {
//                     console.log('correct pass');
//                     req.session.user = row.id;
//
//                     database
//                         .checkSignature(req.session.user.userId)
//                         .then(sig => {
//                             if (sig) {
//                                 req.session.user.sigId = sig.id;
//                                 res.redirect('/signers');
//                             } else {
//                                 res.redirect('/petition');
//                             }
//                         });
//                 } else {
//                     return Promise.reject('password or email dont match');
//                 }
//             });
//         })
//
//         .catch(err => {
//             console.log(err);
//             res.render('login', {
//                 layout: 'main',
//                 error: 'error'
//             });
//         });
// });

////////petition get + post ///////////

app.get("/petition", (req, res) => {
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main"
        });
    }
});

app.post("/petition", (req, res) => {
    // console.log('1here');
    if (req.body.hidden_input == "") {
        console.log("2nd");
        return res.render("petition", {
            layout: "main",
            error: true
        });
    }
    console.log("about to inserttttttt", req.session);
    database
        .newSignatureInDb(req.session.user.userId, req.body.hidden_input)
        .then(result => {
            console.log("did it work!!!!!!", result.rows);
            req.session.sigId = result.rows[0].id;
            res.redirect("/thanks");
        })
        .catch(err => {
            console.log(err, "catch err");
            res.render("petition", {
                layout: "main"
            });
        });
});

/////////////////// Thank you page get route//////////////
app.get("/thanks", checkForSigId, (req, res) => {
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
        res.render("thanks", {
            layout: "main",
            number,
            userSig
        });
    });
});

app.post("/thanks", (req, res) => {
    database.deleteSig(req.session.sigId).then(function() {
        req.session.sigId = null;
        res.redirect("/petition");
    });
});
//////////////// Signers page get & post/////////////

app.get("/signers", checkForSigId, (req, res) => {
    database.allUserData().then(function(response) {
        res.render("signers", {
            layout: "main",
            signers: response.rows
        });
    });
});

//////////////// change info & post/////////////

app.get("/change_info", (req, res) => {
    database
        .extractUserInfo(req.session.user.userId)
        .then(function(userInfo) {
            console.log(userInfo.rows);
            res.render("change_info", {
                layout: "main",
                userInfo: userInfo.rows
            });
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.post("/change_info", (req, res) => {
    console.log("inside the post route 1");
    if (req.body.password == "") {
        console.log(req.body);
        ///// the function parameters need to be same as in the refered module
        database
            .allExPass(
                req.body.first_name,
                req.body.last_name,
                req.body.email,
                req.session.user.userId
            )
            .then(() => {
                console.log(
                    req.body.first_name,
                    req.body.last_name,
                    req.body.email,
                    req.session.user.userId,
                    "all exept eMail post route"
                );
                database
                    .miscInfo(
                        req.body.age,
                        req.body.city,
                        req.body.homepage,
                        req.session.user.userId
                    )
                    .then(() => {
                        console.log(
                            req.body.age,
                            req.body.city,
                            req.body.homepage,
                            req.session.user.userId,
                            "misc Info Route"
                        );
                        res.render("change_info", {
                            layout: "main"
                        });
                    })
                    .catch(err => {
                        console.log("post error 1 BROOOO", err);
                        res.render("change_info", {
                            layout: "main"
                        });
                    });
            })
            .catch(err => {
                console.log("post error 2", err);
                res.render("change_info", {
                    layout: "main"
                });
            });
    } else {
        bcrypt.hashPass(req.body.password).then(hashedpass => {
            console.log(hashedpass);

            database
                .allInfo(
                    req.body.first_name,
                    req.body.last_name,
                    req.body.email,
                    hashedpass,
                    req.session.user.userId
                )
                .then(() => {
                    console.log(
                        req.body.first_name,
                        req.body.last_name,
                        req.body.email,
                        req.body.password,
                        req.session.user.userId,
                        "all info on post route"
                    );
                    database
                        .miscInfo(
                            req.body.age,
                            req.body.city,
                            req.body.homepage,
                            req.session.user.userId
                        )
                        .then(() => {
                            console.log(
                                req.body.age,
                                req.body.city,
                                req.body.homepage,
                                req.session.user.userId,
                                "inside post miscInfo"
                            );
                            res.render("change_info", {
                                layout: "main"
                            });
                        })
                        .catch(err => {
                            console.log("post error 3", err);
                            res.render("change_info", {
                                layout: "main"
                            });
                        });
                })
                .catch(err => {
                    console.log("post error 4", err);
                    res.render("change_info", {
                        layout: "main"
                    });
                });
        });
    }
});

/////////////LOGOUT/////////////

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

/////////////LISTENING//////////////////////

// app.listen(8080, () => console.log('listening'));
app.listen(process.env.PORT || 8080, () => c.glitch("Listening and pistening"));

// app.listen(8080, () => c.glitch('Listening and pistening'));
