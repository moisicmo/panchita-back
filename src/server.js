const express = require('express');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const { dbConnection } = require('./database');
const { AppRoutes } = require('./presentation/routes');



class Server {

  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.server = createServer(this.app);

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

    this.app.use(express.json({ limit: '50mb' }));
    // CORS
    this.app.use(cors());

    // Lectura y parseo del body
    this.app.use(express.json());

    // Directorio Público
    const publicPath = path.resolve(__dirname, './../public');
    this.app.use(express.static(publicPath));
    this.app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, './../public/index.html'))
  })
  }

  routes() {
    AppRoutes(this.app);
  }

  listen() {
    this.server.listen(this.port, () => {
      console.log('Servidor corriendo en puerto', this.port);
    });
  }
}


module.exports = Server;
