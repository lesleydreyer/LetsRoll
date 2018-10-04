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
const {
    GameEvent,
} = require('../gameEvents');


const expect = chai.expect;
chai.use(chaiHttp);

describe('Integration tests for: /api/gameEvents', () => {
    let testUser;
    let authToken;

    before(() => runServer(true));

    beforeEach(() => {
        testUser = createFakerUser();

        return User.hashPassword(testUser.password)
            .then(hashedPassword =>
                // Create a randomized test user.
                User.create({
                    username: testUser.username,
                    email: testUser.email,
                    phone: testUser.phone,
                    password: hashedPassword,
                }).catch((err) => {
                    console.error(err);
                    throw new Error(err);
                }),
            )
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

                const seedData = [];
                for (let i = 1; i <= 10; i++) {
                    const newGame = createFakerGame();
                    newGame.user = createdUser.id;
                    seedData.push(newGame);
                }
                return GameEvent.insertMany(seedData)
                    .catch((err) => {
                        console.error(err);
                        throw new Error(err);
                    });
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

    after(() =>
        closeServer()
    );


    it('Should return user games', () => {
        debugger;
        return chai.request(app)
            .get('/api/gameevents')
            .set('Authorization', `Bearer ${authToken}`)
            .then((res) => {
                debugger;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body).to.have.lengthOf.at.least(1);
                const gameEvent = res.body[0];
                expect(gameEvent).to.include.keys('user', 'gameTitle', 'maxPlayers', 'gameDateTime', 'address', 'gameInfo');
            });
    });

    it('Should return a specific game', () => {
        let foundGame;
        return GameEvent.find()
            .then((gameEvents) => {
                expect(gameEvents).to.be.a('array');
                expect(gameEvents).to.have.lengthOf.at.least(1);
                foundGame = gameEvents[0];

                return chai.request(app)
                    .get(`/api/gameevents/${foundGame.id}`)
                    .set('Authorization', `Bearer ${authToken}`);
            })
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys('user', 'gameTitle', 'maxPlayers', 'gameDateTime', 'address', 'gameInfo');
                expect(res.body).to.deep.include({
                    id: foundGame.id,
                    gameTitle: foundGame.gameTitle,
                    maxPlayers: foundGame.maxPlayers,
                    gameDateTime: foundGame.gameDateTime.toISOString(),
                    address: foundGame.address,
                    gameInfo: foundGame.gameInfo,
                });
            });
    });


    it('Should update a specific game', () => {
        let gameToUpdate;
        const newGameData = createFakerGame();
        return GameEvent.find()
            .then((gameEvents) => {
                expect(gameEvents).to.be.a('array');
                expect(gameEvents).to.have.lengthOf.at.least(1);
                gameToUpdate = gameEvents[0];

                return chai.request(app)
                    .put(`/api/gameEvents/${gameToUpdate.id}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(newGameData);
            })
            .then((res) => {
                expect(res).to.have.status(200);

                return GameEvent.findById(gameToUpdate.id);
            })
            .then((gameEvent) => {
                expect(gameEvent).to.be.a('object');
                expect(gameEvent).to.deep.include({
                    id: gameToUpdate.id,
                    gameTitle: newGameData.gameTitle,
                    maxPlayers: newGameData.maxPlayers,
                    gameDateTime: newGameData.gameDateTime,
                    address: newGameData.address,
                    gameInfo: newGameData.gameInfo,
                });
            });
    });


    it('Should update a specific game', () => {
        let gameToDelete;
        const newGameData = createFakerGame();
        return GameEvent.find()
            .then((gameEvents) => {
                expect(gameEvents).to.be.a('array');
                expect(gameEvents).to.have.lengthOf.at.least(1);
                gameToDelete = gameEvents[0];

                return chai.request(app)
                    .delete(`/api/gameEvents/${gameToDelete.id}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(newGameData);
            })
            .then((res) => {
                expect(res).to.have.status(204);

                return GameEvent.findById(gameToDelete.id);
            })
            .then((gameEvent) => {
                expect(gameEvent).to.not.exist;
            });
    });

    function createFakerUser() {
        return {
            name: `${faker.name.firstName()} ${faker.name.lastName()}`,
            username: `${faker.lorem.word()}${faker.random.number(100)}`,
            password: faker.internet.password(),
            email: faker.internet.email(),
        };
    }

    function createFakerGame() {
        return {
            gameTitle: faker.lorem.word(),
            maxPlayers: faker.random.number(),
            gameDateTime: faker.date.future(),
            address: faker.lorem.sentence(),
            gameInfo: faker.lorem.sentence(),
        };
    }
});