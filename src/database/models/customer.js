'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      customer.belongsTo(models.user, {
        foreignKey: 'userId',
        targetKey: 'id'
      });
      customer.hasMany(models.credit, {
        foreignKey: 'customerId'
      });
      customer.hasMany(models.order, {
        foreignKey: 'customerId'
      });
    }
  }
  customer.init({
    userId: DataTypes.INTEGER,
    state: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'customer',
  });
  return customer;
};