const { expect } = require('chai');
const io = require('socket.io-client');
const util = require('util');
const sinon = require('sinon');

const sleep = util.promisify(setTimeout);

const monitoringClient = io('http://localhost:3000', { forceNew: true });

describe('socketio api tests', () => {
  let client;

  before((done) => {
    monitoringClient.emit('add user', 'monitoring');
    monitoringClient.once('connect', () => done());
  });

  beforeEach((done) => {
    client = io('http://localhost:3000', { forceNew: true });
    client.once('connect', () => done());
  });

  afterEach(() => {
    client.disconnect();
  });

  after(() => {
    monitoringClient.disconnect();
  });

  it('user joined and login', async () => {
    const login = sinon.stub();
    const joined = sinon.stub();

    monitoringClient.once('user joined', joined);
    client.once('login', login);

    client.emit('add user', 'new-user');

    // Admittedly a bit gross to use sleep here, but just wanted something simple.
    // The less brittle approach would be to block on a promise until the stubs are called.
    await sleep(100);

    expect(login.args).to.eql([[{ numUsers: 2 }]]);
    expect(joined.args).to.eql([[{ numUsers: 2, username: 'new-user' }]]);
  });

  it('user sent message', async () => {
    const monitoringMessage = sinon.stub();
    const clientMessage = sinon.stub();

    monitoringClient.once('new message', monitoringMessage);
    client.once('new message', clientMessage);

    client.emit('add user', 'new-user');
    await sleep(100);
    client.emit('new message', 'some-message');
    await sleep(100);

    expect(monitoringMessage.args).to.eql([[{ message: 'some-message', username: 'new-user' }]]);
    expect(clientMessage.args).to.eql([]);
  });
});
