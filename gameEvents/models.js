'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


const gameEventSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gameTitle: {
        type: String,
        required: true
    },
    maxPlayers: {
        type: Number,
        required: true
    },
    gameDateTime: {
        type: Date,
        default: Date.now,
    },
    address: String,
    gameInfo: String
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});


gameEventSchema.virtual('user_name').get(function () {
    return `${this.user.username}`.trim();
});


gameEventSchema.methods.serialize = function () {
    let user;
    if (typeof this.user.serialize === 'function') {
        user = this.user.serialize();
    } else {
        user = this.user;
    }

    return {
        id: this._id,
        user: user,
        gameTitle: this.gameTitle,
        maxPlayers: this.maxPlayers,
        gameDateTime: this.gameDateTime,
        address: this.address,
        gameInfo: this.gameInfo
    };
};

const GameEvent = mongoose.model('GameEvent', gameEventSchema);


module.exports = {
    GameEvent
};