'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('kardexs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      branchOfficeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'branchOffices',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      inputOrOutputId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      inputOrOutputType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      detail: {
        type: Sequelize.STRING
      },
      stock: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // No se especifica directamente la referencia a 'inputs_outputs' aquí

    await queryInterface.addIndex('kardexs', ['inputOrOutputId', 'inputOrOutputType'], {
      name: 'idx_kardexs_inputOrOutput'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('kardexs', 'idx_kardexs_inputOrOutput');
    await queryInterface.dropTable('kardexs');
  }
};
