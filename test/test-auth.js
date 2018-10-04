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

  before(() => runServer(true)); // Mocha Hook: Runs before ALL the "it" test blocks.

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