'use strict';

const express = require('express');

const router = express.Router();
const passport = require('passport');
const {
    GameEvent,
} = require('./models');
const {
    User,
} = require('../users/models');
const {
    jwtStrategy,
} = require('../auth');
const morgan = require('morgan');
router.use(morgan('common'));
router.use(express.json());
const jwtAuth = passport.authenticate('jwt', {
    session: false,
});


router.get('/', jwtAuth, (req, res) => {
    GameEvent
        .find()
        .populate('user')
        .then((gameEvents) => {
            res.json(gameEvents.map(gameEvent => gameEvent.serialize()));
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json(err);
        });
});

router.get('/:id', jwtAuth, (req, res) => {
    if (!(GameEvent.findById(req.params.id))) {
        return res.status.send(204);
    }
    GameEvent.findById(req.params.id)
        .populate('user')
        .then(gameEvent => {
            return res.status(200).json(gameEvent.serialize());
        })
        .catch(err => {
            console.error(err);
            res.status(500).json(err);
        });

});

router.post('/', jwtAuth, (req, res) => {
    const requiredFields = ['gameTitle', 'gameDateTime', 'maxPlayers'];
    requiredFields.forEach((field) => {
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    });

    const newGame = {
        user: req.user.id,
        maxPlayers: req.body.maxPlayers,
        gameTitle: req.body.gameTitle,
        gameDateTime: req.body.gameDateTime,
        address: req.body.address,
        gameInfo: req.body.gameInfo,
    };
    GameEvent.create(newGame)
        .then((createdUser) => res.status(201).json(createdUser.serialize()))
        .catch((err) => {
            console.error(err);
            return res.status(500).json(err);
        });
});


router.put('/:id', jwtAuth, (req, res) => {
    const updated = {};
    const updateableFields = ['gameTitle', 'maxPlayers', 'gameDateTime', 'address', 'gameInfo'];
    updateableFields.forEach((field) => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });


    GameEvent
        .findByIdAndUpdate(req.params.id, {
            $set: updated,
        }, {
            new: true,
        })
        .then(updatedGameEvent =>
            res.status(200).json(updatedGameEvent.serialize()))
        .catch((err) => {
            console.error(err);
            return res.status(500).json(err);
        });
});


router.delete('/:id', jwtAuth, (req, res) => {
    GameEvent
        .findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).json({
                message: `Deleted event with id \`${req.params.id}\``,
            });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json(err);
        });
});


module.exports = {
    router,
};