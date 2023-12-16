'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      category.belongsTo(models.business, {
        foreignKey: 'businessId',
        targetKey: 'id'
      });
      category.hasMany(models.product, {
        foreignKey: 'categoryId'
      });
    }
  }
  category.init({
    businessId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    state: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'category',
  });
  return category;
};