'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const {
    User,
} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

const passport = require('passport');
const {
    jwtStrategy,
} = require('../auth');

const jwtAuth = passport.authenticate('jwt', {
    session: false,
});


// Post to register a new user
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField,
        });
    }

    const stringFields = ['username', 'password'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string');

    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField,
        });
    }

    const explicityTrimmedFields = ['username', 'password', 'email', 'phone'];
    const nonTrimmedField = explicityTrimmedFields.find(
        field => req.body[field].trim() !== req.body[field],
    );

    if (nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            location: nonTrimmedField,
        });
    }

    const sizedFields = {
        username: {
            min: 1,
        },
        password: {
            min: 10,
            max: 72,
        },
    };

    const {
        username,
        password,
        email,
        phone,
    } = req.body;

    return User.find({
            username,
        })
        .count()
        .then((count) => {
            if (count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'username already taken',
                    location: 'username',
                });
            }
            return User.hashPassword(password);
        })
        .then(hash => User.create({
            username,
            email,
            phone,
            password: hash,
        }))
        .then(user => res.status(201).json(user.serialize()))
        .catch((err) => {
            console.log(err);
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({
                code: 500,
                message: 'Internal server error',
            });
        });
});


//LEFT IN TO SHOW TESTS BUT WOULD REMOVE IN THE REAL WORLD
router.get('/', (req, res) => User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({
        message: 'Internal server error',
        error: err,
    })));


//LEFT IN TO SHOW TESTS BUT WOULD REMOVE IN THE REAL WORLD
router.get('/:id', (req, res) => User.findById(req.params.id)
    .then(((user) => {
        res.json({
            id: user.id,
            username: user.username,
            password: user.password,
            email: user.email,
            phone: user.phone,
        });
    }))
    .catch(err => res.status(500).json({
        message: 'Internal server error',
        error: err,
    })));



module.exports = {
    router
};