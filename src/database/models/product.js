'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      product.belongsTo(models.business, {
        foreignKey: 'businessId',
        targetKey: 'id'
      });
      product.belongsTo(models.category, {
        foreignKey: 'categoryId',
        targetKey: 'id'
      });
      product.belongsTo(models.measurementUnit, {
        foreignKey: 'measurementUnitId',
        targetKey: 'id'
      });
      product.hasMany(models.output, {
        foreignKey: 'productId'
      });
      product.hasMany(models.input, {
        foreignKey: 'productId'
      });
      product.hasMany(models.price, {
        foreignKey: 'productId'
      });
      product.hasMany(models.productDiscount, {
        foreignKey: 'productId'
      });
      product.hasMany(models.kardex, {
        foreignKey: 'productId'
      });
    }
  }
  product.init({
    businessId: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER,
    measurementUnitId: DataTypes.INTEGER,
    code: DataTypes.STRING,
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    barCode: DataTypes.STRING,
    visible: DataTypes.BOOLEAN,
    state: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'product',
  });
  return product;
};