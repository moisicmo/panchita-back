'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class input extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      input.belongsTo(models.branchOffice, {
        foreignKey: 'branchOfficeId',
        targetKey: 'id'
      });
      input.belongsTo(models.product, {
        foreignKey: 'productId',
        targetKey: 'id'
      });
    }
  }
  input.init({
    branchOfficeId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    dueDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'input',
  });
  return input;
};