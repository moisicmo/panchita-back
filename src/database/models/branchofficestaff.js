'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class branchOfficeStaff extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      branchOfficeStaff.belongsTo(models.branchOffice, {
        foreignKey: 'branchOfficeId',
        targetKey: 'id'
      });
      branchOfficeStaff.belongsTo(models.staff, {
        foreignKey: 'staffId',
        targetKey: 'id'
      });
    }
  }
  branchOfficeStaff.init({
    branchOfficeId: DataTypes.INTEGER,
    staffId: DataTypes.INTEGER,
    state: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'branchOfficeStaff',
  });
  return branchOfficeStaff;
};