'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class discount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      discount.hasMany(models.productDiscount, {
        foreignKey: 'discountId'
      });
    }
  }
  discount.init({
    name: DataTypes.STRING,
    percentage: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    state: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'discount',
  });
  return discount;
};