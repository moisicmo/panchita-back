'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class branchOffice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      branchOffice.belongsTo(models.business, {
        foreignKey: 'businessId',
        targetKey: 'id'
      });
      branchOffice.hasMany(models.branchOfficeStaff, {
        foreignKey: 'branchOfficeId'
      });
      branchOffice.hasMany(models.output, {
        foreignKey: 'branchOfficeId'
      });
      branchOffice.hasMany(models.input, {
        foreignKey: 'branchOfficeId'
      });
      branchOffice.hasMany(models.kardex, {
        foreignKey: 'branchOfficeId'
      });
    }
  }
  branchOffice.init({
    businessId: DataTypes.INTEGER,
    typeBranchOffice: DataTypes.STRING,
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
    state: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'branchOffice',
  });
  return branchOffice;
};