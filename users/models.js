const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: String,
  phone: String,
  // gameEvents: [{
  //  type: mongoose.Schema.Types.ObjectId,
  //  ref: 'gameEvent',
  // }],
});

UserSchema.methods.serialize = function () {
  return {
    username: this.username || '',
    // gameEvents: this.gameEvents,
    email: this.email,
    phone: this.phone,
    id: this._id,
  };
};

UserSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = {
  User,
};
