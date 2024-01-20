'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class output extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      output.belongsTo(models.branchOffice, {
        foreignKey: 'branchOfficeId',
        targetKey: 'id'
      });
      output.belongsTo(models.product, {
        foreignKey: 'productId',
        targetKey: 'id'
      });
      output.hasMany(models.orderOutput, {
        foreignKey: 'outputId'
      });
      output.hasMany(models.kardex, {
        foreignKey: 'inputOrOutputId',
        constraints: false,
        scope: {
          commentableType: 'output'
        }
      });
    }
  }
  output.init({
    branchOfficeId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    discount: DataTypes.FLOAT,
    typeDiscount: DataTypes.STRING,
    state: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'output',
  });
  return output;
};