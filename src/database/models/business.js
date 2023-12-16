'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class business extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      business.hasMany(models.branchOffice, {
        foreignKey: 'businessId'
      });
      business.hasMany(models.category, {
        foreignKey: 'businessId'
      });
      business.hasMany(models.role, {
        foreignKey: 'businessId'
      });
    }
  }
  business.init({
    name: DataTypes.STRING,
    state: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'business',
  });
  return business;
};