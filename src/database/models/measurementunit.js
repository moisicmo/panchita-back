'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class measurementUnit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      measurementUnit.hasMany(models.product, {
        foreignKey: 'measurementUnitId'
      });
    }
  }
  measurementUnit.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'measurementUnit',
  });
  return measurementUnit;
};