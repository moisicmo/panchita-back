'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      order.belongsTo(models.branchOffice, {
        foreignKey: 'branchOfficeId',
        targetKey: 'id'
      });
      order.belongsTo(models.staff, {
        foreignKey: 'staffId',
        targetKey: 'id'
      });
      order.belongsTo(models.customer, {
        foreignKey: 'customerId',
        targetKey: 'id'
      });
      order.belongsTo(models.paymentMethod, {
        foreignKey: 'paymentMethodId',
        targetKey: 'id'
      });
      order.hasMany(models.output, {
        foreignKey: 'orderId'
      });
    }
  }
  order.init({
    branchOfficeId: DataTypes.INTEGER,
    staffId: DataTypes.INTEGER,
    customerId: DataTypes.INTEGER,
    paymentMethodId: DataTypes.INTEGER,
    amount: DataTypes.FLOAT,
    document:DataTypes.STRING,
    stateSale: DataTypes.BOOLEAN,
    delivery: DataTypes.BOOLEAN,
    state: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'order',
  });
  return order;
};