'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true)
const morgan = require('morgan');
const passport = require('passport');

// Can use destructuring with renaming so two variables called router (from ./users and ./auth) have different names
// For example: const actorSurnames = { james: "Stewart", robert: "De Niro" }; const { james: jimmy, robert: bobby } = actorSurnames;
// console.log(jimmy); // Stewart - the variable name is jimmy, not james // console.log(bobby); // De Niro - the variable name is bobby, not robert
const {
    router: usersRouter
} = require('./users');
const {
    router: gameEventsRouter
} = require('./gameEvents');
const {
    router: authRouter,
    localStrategy,
    jwtStrategy
} = require('./auth');

mongoose.Promise = global.Promise;

const {
    PORT,
    DATABASE_URL,
    TEST_DATABASE_URL
} = require('./config');

const app = express();
app.use(express.json()); // Required so AJAX request JSON data payload can be parsed and saved into request.body
//app.use(express.static('./public')); // Intercepts all HTTP requests that match files inside /public
app.use(express.static('public'));
app.use(morgan('common')); // Logging
const bodyParser = require('body-parser');
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));

// CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS') {
        return res.send(204);
    }
    next();
});


passport.use(localStrategy); // Configure Passport to use our localStrategy when receiving Username + Password combinations
passport.use(jwtStrategy); // Configure Passport to use our jwtStrategy when receving JSON Web Tokens

app.use('/api/gameevents', gameEventsRouter);
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);


const jwtAuth = passport.authenticate('jwt', {
    session: false
});

// A protected endpoint which needs a valid JWT to access it
app.get('/api/protected', jwtAuth, (req, res) => {
    return res.json({
        data: 'rosebud'
    });
});

app.use('*', (req, res) => {
    return res.status(404).json({
        message: 'Not Found'
    });
});

// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer(testEnv) {
    let mongoUrl;

    if (testEnv) {
        mongoUrl = TEST_DATABASE_URL;
    } else {
        mongoUrl = DATABASE_URL;
    }
    console.log(mongoUrl)
    return new Promise((resolve, reject) => {
        mongoose.connect(mongoUrl, {
            useNewUrlParser: true
        }, err => {
            if (err) {
                return reject(err);
            }
            server = app
                .listen(PORT, () => {
                    console.log(`Your app is listening on port ${PORT}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports = {
    app,
    runServer,
    closeServer
};