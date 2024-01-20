'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class staff extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      staff.belongsTo(models.user, {
        foreignKey: 'userId',
        targetKey: 'id'
      });
      staff.belongsTo(models.role, {
        foreignKey: 'roleId',
        targetKey: 'id'
      });
      staff.hasMany(models.branchOfficeStaff, {
        foreignKey: 'staffId'
      });
      staff.hasMany(models.order, {
        foreignKey: 'staffId'
      });
    }
  }
  staff.init({
    userId: DataTypes.INTEGER,
    roleId: DataTypes.INTEGER,
    password: DataTypes.STRING,
    state: DataTypes.BOOLEAN,
    superStaff: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'staff',
  });
  return staff;
};