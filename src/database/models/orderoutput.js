'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class orderOutput extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      orderOutput.belongsTo(models.order, {
        foreignKey: 'orderId',
        targetKey: 'id'
      });
      orderOutput.belongsTo(models.output, {
        foreignKey: 'outputId',
        targetKey: 'id'
      });
    }
  }
  orderOutput.init({
    orderId: DataTypes.INTEGER,
    outputId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'orderOutput',
  });
  return orderOutput;
};