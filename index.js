require('dotenv').config();
const ServerApp = require('./src/server');
const server = new ServerApp();
server.listen();