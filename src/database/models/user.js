'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.belongsTo(models.typeDocument, {
        foreignKey: 'typeDocumentId',
        targetKey: 'id'
      });
      user.hasMany(models.staff, {
        foreignKey: 'userId'
      });
      user.hasMany(models.customer, {
        foreignKey: 'userId'
      });
    }
  }
  user.init({
    typeDocumentId: DataTypes.INTEGER,
    numberDocument: DataTypes.STRING,
    name: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};