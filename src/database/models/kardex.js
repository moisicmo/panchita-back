'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kardex extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      kardex.belongsTo(models.product, {
        foreignKey: 'productId',
        targetKey: 'id'
      });
      kardex.belongsTo(models.branchOffice, {
        foreignKey: 'branchOfficeId',
        targetKey: 'id'
      });
      kardex.belongsTo(models.input, {
        foreignKey: 'inputOrOutputId',
        constraints: false
      });
      kardex.belongsTo(models.output, {
        foreignKey: 'inputOrOutputId',
        constraints: false
      });
      // kardex.belongsTo(models.input, {
      //   foreignKey: 'inputOrOutputId',
      //   constraints: false,
      //   as: 'inputAssociation',
      //   scope: {
      //     inputOrOutputType: 'input',
      //   },
      // });
      // kardex.belongsTo(models.output, {
      //   foreignKey: 'inputOrOutputId',
      //   constraints: false,
      //   as: 'outputAssociation',
      //   scope: {
      //     inputOrOutputType: 'output',
      //   },
      // });
    }
  }
  kardex.init({
    productId: DataTypes.INTEGER,
    branchOfficeId: DataTypes.INTEGER,
    inputOrOutputId: DataTypes.INTEGER,
    inputOrOutputType: DataTypes.STRING,
    detail: DataTypes.STRING,
    stock: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'kardex',
    tableName: 'kardexs',
  });
  return kardex;
};