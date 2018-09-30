const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jsonwebtoken = require('jsonwebtoken');
const faker = require('faker');
const {
  JWT_SECRET,
  JWT_EXPIRY,
} = require('../config');


const {
  app,
  runServer,
  closeServer,
} = require('../server');
const {
  User,
} = require('../users');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Integration tests for: /api/auth', () => {
  let testUser;
  let authToken;

  // Mocha Hook: Runs before ALL the "it" test blocks.
  before(() => runServer(true));

  beforeEach(() => { // runs before each it test
    testUser = createFakerUser();

    return User.hashPassword(testUser.password).then(hashedPassword => User.create({
      username: testUser.username,
      password: hashedPassword,
      email: testUser.email,
      phone: testUser.phone,
    })
      .then((createdUser) => {
        testUser.id = createdUser.id;

        authToken = jsonwebtoken.sign({
          user: {
            id: testUser.id,
            username: testUser.username,
            email: testUser.email,
            phone: testUser.phone,
          },
        },
        JWT_SECRET, {
          algorithm: 'HS256',
          expiresIn: JWT_EXPIRY,
          subject: testUser.username,
        },
        );
      })
      .catch((err) => {
        console.error(err);
      }));
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

  it('Should login correctly and return a valid JSON Web Token', () => chai.request(app)
    .post('/api/auth/login')
    .send({
      username: testUser.username,
      password: testUser.password,
    })
    .then((res) => {
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body).to.be.a('object');
      expect(res.body).to.include.keys('authToken');

      const jwtPayload = jsonwebtoken.verify(res.body.authToken, JWT_SECRET, {
        algorithm: ['HS256'],
      });
      expect(jwtPayload.user).to.be.a('object');
      expect(jwtPayload.user).to.deep.include({
        username: testUser.username,
        email: testUser.email,
        phone: testUser.phone,
      });
    }));

  it('Should refresh the user JSON Web Token', () => {
    const firstJwtPayload = jsonwebtoken.verify(authToken, JWT_SECRET, {
      algorithm: ['HS256'],
    });
    return chai.request(app)
      .post('/api/auth/refresh')
      .set('Authorization', `Bearer ${authToken}`)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('authToken');

        const newJwtPayload = jsonwebtoken.verify(res.body.authToken, JWT_SECRET, {
          algorithm: ['HS256'],
        });
        expect(newJwtPayload.user).to.be.a('object');
        expect(newJwtPayload.user).to.deep.include({
          username: testUser.username,
          email: testUser.email,
          phone: testUser.phone,
        });

        expect(newJwtPayload.exp).to.be.at.least(firstJwtPayload.exp);
      });
  });

  function createFakerUser() {
    return {
      username: `${faker.lorem.word()}${faker.random.number(100)}`,
      password: faker.internet.password(),
      email: faker.internet.email(),
      phone: faker.phone.phoneNumber(),
    };
  }
});




/* 'use strict';
global.DATABASE_URL = 'mongodb://localhost/test-games-db';
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const {
  app,
  runServer,
  closeServer
} = require('../server');
const {
  User
} = require('../users');
const {
  JWT_SECRET
} = require('../config');

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Auth endpoints', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const email = 'exampleEmail';
  const phone = 'examplePhone';

  before(function () {
    return runServer();
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function () {
    return User.hashPassword(password).then(password =>
      User.create({
        username,
        password,
        email,
        phone
      })
    );
  });

  afterEach(function () {
    return User.remove({});
  });

  describe('/api/auth/login', function () {
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .post('/api/auth/login')
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(400);
        });
    });
    it('Should reject requests with incorrect usernames', function () {
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({
          username: 'wrongusername',
          password
        })
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with incorrect passwords', function () {
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({
          username,
          password: 'wrongPassword'
        })
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should return a valid auth token', function () {
      return chai
        .request(app)
        .post('/api/auth/login')
        .send({
          username,
          password
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ['HS256']
          });
          expect(payload.user).to.deep.equal({
            username,
            email,
            phone
          });
        });
    });
  });

  describe('/api/auth/refresh', function () {
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .post('/api/auth/refresh')
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with an invalid token', function () {
      const token = jwt.sign({
          username,
          email,
          phone
        },
        'wrongSecret', {
          algorithm: 'HS256',
          expiresIn: '7d'
        }
      );

      return chai
        .request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with an expired token', function () {
      const token = jwt.sign({
          user: {
            username,
            email,
            phone
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET, {
          algorithm: 'HS256',
          subject: username
        }
      );

      return chai
        .request(app)
        .post('/api/auth/refresh')
        .set('authorization', `Bearer ${token}`)
        .then(() =>
          expect.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should return a valid auth token with a newer expiry date', function () {
      const token = jwt.sign({
          user: {
            username,
            email,
            phone
          }
        },
        JWT_SECRET, {
          algorithm: 'HS256',
          subject: username,
          expiresIn: '7d'
        }
      );
      const decoded = jwt.decode(token);

      return chai
        .request(app)
        .post('/api/auth/refresh')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ['HS256']
          });
          expect(payload.user).to.deep.equal({
            username,
            email,
            phone
          });
          expect(payload.exp).to.be.at.least(decoded.exp);
        });
    });
  });
}); */
