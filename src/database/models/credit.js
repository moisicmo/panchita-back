'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class credit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      credit.belongsTo(models.customer, {
        foreignKey: 'customerId',
        targetKey: 'id'
      });
      credit.hasMany(models.payment, {
        foreignKey: 'creditId'
      });
    }
  }
  credit.init({
    customerId: DataTypes.INTEGER,
    limit: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'credit',
  });
  return credit;
};