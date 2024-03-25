const express = require('express');
const cors = require('cors');
const path = require('path');
const { Server } = require("socket.io");
const { createServer } = require('http');
const { dbConnection } = require('./database');
const { AppRoutes } = require('./presentation/routes');

class ServerApp {

  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: "*", // Permite solicitudes desde cualquier origen
        methods: ["GET", "POST"] // Permite los métodos GET y POST
      }
    });
    
    // Conectar a base de datos
    this.conectarDB();

    // Middlewares
    this.middlewares();

    // Rutas de mi aplicación
    this.routes();

  }


  async conectarDB() {
    await dbConnection();
  }

  middlewares() {
    // CORS para solicitudes REST
    this.app.use(cors());

    this.app.use(express.json({ limit: '50mb' }));

    // Lectura y parseo del body
    this.app.use(express.json());

    // Directorio Público
    const publicPath = path.resolve(__dirname, './../public');
    this.app.use(express.static(publicPath));
  }

  routes() {
    AppRoutes(this.app,this.io);
  }

  listen() {
    this.server.listen(this.port, () => {
      console.log('Servidor corriendo en puerto', this.port);
    });
    // Manejando conexiones de Socket.IO
    this.io.on('connection', (socket) => {
      console.log('Un usuario se ha conectado');
      // Maneja eventos aquí...
      socket.on('disconnect', () => {
        console.log('Usuario desconectado');
      });
    });
  }
}

module.exports = ServerApp;
