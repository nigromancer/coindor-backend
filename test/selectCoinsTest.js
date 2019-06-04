const chai = require('chai');
const chaiHttp = require('chai-http');
const settings = require('../config/test.json');
const { initializeDB, closeConnection } = require('./initializeData');
require('../app');

const { assert } = chai;
chai.use(chaiHttp);

describe('Select coins', function() {
  const url = `http://${settings.host}:${settings.appPort}`;
  let token;
  let userId;

  before(function(done) {
    initializeDB(({adminId}) => {
      userId = adminId;
      chai.request(url)
        .post('/login')
        .send({username: "admin2", password: "admin"})
        .end((err, res) => {
          token = res.body.token;
          done();
        })
    });
  });

  after(function(done) {
    closeConnection();
    done();
  })

  it('Coins are added', function(done) {
    chai.request(url)
      .patch('/api/user/' + userId)
      .set('x-access-token', token)
      .send({coins: ["ARS"], coins: ["EUR"]})
      .end((err, res) => {
        assert.equal(res.text, 'Successfully modified');
        done();
      });
  });

  it('Try to add coins, but user doesn\'t exist', function(done) {
    chai.request(url)
      .patch('/api/user/aaaaaaaaaaaaaaaaaaaaaaaa')
      .set('x-access-token', token)
      .send({coins: ["ARS"]})
      .end((err, res) => {
        assert.equal(res.text, 'User doesn\'t exist');
        done();
      });
  });
});