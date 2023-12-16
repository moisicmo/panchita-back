const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config.js')[env];

const dbConnection = async () => {
  try {
    const sequelize = new Sequelize(config.database, config.username, config.password, config);
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync(); // Esto sincronizará tus modelos con la base de datos
    console.log('Models synchronized');
  } catch (error) {
    console.error('Database connection error', error);
    throw new Error('Error a la hora de inicializar BD');
  }
};

module.exports = {
  dbConnection
};
