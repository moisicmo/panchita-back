'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class price extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      price.belongsTo(models.product, {
        foreignKey: 'productId',
        targetKey: 'id'
      });
    }
  }
  price.init({
    productId: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    discount: DataTypes.FLOAT,
    typeDiscount: DataTypes.STRING,
    state: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'price',
  });
  return price;
};