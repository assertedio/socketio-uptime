const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const attach = require('./socketMiddleware');

const app = express();
const port = 3000;

const server = http.createServer(app);

app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

const io = socketio(server, {
  pingTimeout: 1000,
});

attach(io);

server.listen(port, () => console.log(`socketio-uptime app listening at http://localhost:${port}`));
