// global.DATABASE_URL = 'mongodb://localhost/test-games-db';
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const {
  app,
  runServer,
  closeServer,
} = require('../server');
const {
  User,
} = require('../users');

const expect = chai.expect;

chai.use(chaiHttp); // see: https://github.com/chaijs/chai-http


describe('/api/users', () => {
  let testUser;

  function createFakeUser() {
    return {
      username: `${faker.lorem.word()}${faker.random.number(100)}`,
      password: faker.internet.password(),
      email: faker.internet.email(),
      phone: faker.phone.phoneNumber(),
      // gameEvents: `${faker.lorem.word()}${faker.random.number(100)}`
      //          email: `${faker.lorem.word()}${faker.random.number(100)}`,
      //        phone: `${faker.lorem.word()}${faker.random.number(100)}`
    };
  }

  before(() => runServer(true));


  beforeEach(() => {
    testUser = createFakeUser();
    return User.create(testUser)
      .then(() => {})
      .catch((err) => {
        console.error(err);
      });
  });


  afterEach(() => new Promise((resolve, reject) => {
    mongoose.connection.dropDatabase()
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  }));


  after(() => closeServer());


  it('Should return all users', () => chai.request(app)
    .get('/api/users')
    .then((res) => {
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body).to.be.a('array');
      expect(res.body).to.have.lengthOf.at.least(1);
      expect(res.body[0]).to.include.keys('id', 'username', 'email', 'phone');
      expect(res.body[0]).to.not.include.keys('password');
    }));

  it('Should return a specific user', () => {
    let foundUser;
    debugger;
    return chai.request(app)
      .get('/api/users')
      .then((res) => {
        console.log(res.body);
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.lengthOf.at.least(1);
        foundUser = res.body[0];
        return chai.request(app).get(`/api/users/${foundUser.id}`);
      })
      .then((res) => {
        debugger;
        // console.log(res.body); take out gameEvents from userModel for now
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.id).to.equal(foundUser.id);
      });
  });

  it('Should create a new user', () => {
    const newUser = createFakeUser();
    return chai.request(app)
      .post('/api/users')
      .send(newUser)
      .then((res) => {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'username', 'email', 'phone');
        expect(res.body.username).to.equal(newUser.username);
        expect(res.body.email).to.equal(newUser.email);
        expect(res.body.phone).to.equal(newUser.phone);
      });
  });
});
// /////////////////////////////////////////////////////////////////////
// ////////////////////////////////////////////////////
/**
describe('/api/user', () => {
  const username = 'exampleUser';
  const password = 'examplePass';
  const email = 'exampleEmail';
  const id = 'idex'
  const phone = 'examplePhone';
  const usernameB = 'exampleUserB';
  const passwordB = 'examplePassB';
  const emailB = 'exampleEmailB';
  const phoneB = 'examplePhoneB';

  before(function () {
    return runServer();
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function () {});

  afterEach(function () {
    return User.remove({});
  });

  describe('/api/users', function () {
    describe('POST', function () {
      it('Should reject users with missing username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            password,
            email,
            phone,
            id
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with missing password', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            email,
            phone,
            id
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with non-string username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username: 1234,
            password,
            email,
            phone,
            id
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with non-string password', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: 1234,
            email,
            phone,
            id
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with non-string email', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            email: 1234,
            phone
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('email');
          });
      });
      it('Should reject users with non-string phone', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            email,
            phone: 1234,
            id
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('phone');
          });
      });
      it('Should reject users with non-trimmed username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username: ` ${username} `,
            password,
            email,
            phone,
            id
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with non-trimmed password', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: ` ${password} `,
            email,
            phone,
            id
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with empty username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username: '',
            password,
            email,
            phone,
            id
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at least 1 characters long'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with password less than ten characters', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: '123456789',
            email,
            phone,
            id
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at least 10 characters long'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with password greater than 72 characters', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: new Array(73).fill('a').join(''),
            email,
            phone,
            id
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at most 72 characters long'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with duplicate username', function () {
        // Create an initial user
        return User.create({
            username,
            password,
            email,
            phone,
            id
          })
          .then(() =>
            // Try to create a second user with the same username
            chai.request(app).post('/api/users').send({
              username,
              password,
              email,
              phone,
              id
            })
          )
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'username already taken'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should create a new user', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            email,
            phone,
            id
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'email',
              'phone',
              'id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.email).to.equal(email);
            expect(res.body.phone).to.equal(phone);
            return User.findOne({
              username
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.email).to.equal(email);
            expect(user.phone).to.equal(phone);
            return user.validatePassword(password);
          })
          .then(passwordIsCorrect => {
            expect(passwordIsCorrect).to.be.true;
          });
      });
      it('Should trim email and phone', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            email: ` ${email} `,
            phone: ` ${phone} `
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'email',
              'phone',
              'id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.email).to.equal(phone);
            expect(res.body.email).to.equal(phone);
            return User.findOne({
              username
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.email).to.equal(email);
            expect(user.phone).to.equal(phone);
          });
      });
    });

    describe('GET', function () {
      it('Should return an empty array initially', function () {
        return chai.request(app).get('/api/users').then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(0);
        });
      });
      it('Should return an array of users', function () {
        return User.create({
            username,
            password,
            email,
            phone
          }, {
            username: usernameB,
            password: passwordB,
            email: emailB,
            phone: phoneB
          })
          .then(() => chai.request(app).get('/api/users'))
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.length(2);
            expect(res.body[0]).to.deep.equal({
              username,
              email,
              phone
            });
            expect(res.body[1]).to.deep.equal({
              username: usernameB,
              email: emailB,
              phone: phoneB
            });
          });
      });
    });
  });
});
*/
