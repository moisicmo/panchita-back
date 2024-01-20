'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class productDiscount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      productDiscount.belongsTo(models.product, {
        foreignKey: 'productId',
        targetKey: 'id'
      });
      productDiscount.belongsTo(models.discount, {
        foreignKey: 'discountId',
        targetKey: 'id'
      });
    }
  }
  productDiscount.init({
    productId: DataTypes.INTEGER,
    discountId: DataTypes.INTEGER,
    state: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'productDiscount',
  });
  return productDiscount;
};