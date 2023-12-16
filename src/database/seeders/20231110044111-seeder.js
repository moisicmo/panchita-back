'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //crear metodos de pago
    await queryInterface.bulkInsert('paymentMethods', [
      {
        name: 'Efectivo',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Deposito',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'QR',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Transferencia',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    //crear unidades de medida
    await queryInterface.bulkInsert('measurementUnits', [
      {
        name: 'Unidad',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Caja',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Docena',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bulto',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    //crear permisos
    await queryInterface.bulkInsert('permissions', [
      //administradores
      {
        name: 'ver administradores',
        module: 'administradores',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'crear administradores',
        module: 'administradores',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'editar administradores',
        module: 'administradores',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'eliminar administradores',
        module: 'administradores',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      //roles
      {
        name: 'ver roles',
        module: 'roles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'crear roles',
        module: 'roles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'editar roles',
        module: 'roles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'eliminar roles',
        module: 'roles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      //permisos
      {
        name: 'ver permisos',
        module: 'permisos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      //pacientes
      {
        name: 'ver pacientes',
        module: 'pacientes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'crear pacientes',
        module: 'pacientes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'editar pacientes',
        module: 'pacientes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'eliminar pacientes',
        module: 'pacientes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      //calendario
      {
        name: 'ver calendario',
        module: 'calendario',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'efectuar pago',
        module: 'calendario',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'eliminar pago',
        module: 'calendario',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      //tratamiento
      {
        name: 'crear tratamiento',
        module: 'tratamiento',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'editar tratamiento',
        module: 'tratamiento',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'eliminar tratamiento',
        module: 'tratamiento',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      //reporte
      {
        name: 'ver reportes',
        module: 'reporte',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
    //crear tipos de documentos
    await queryInterface.bulkInsert('typeDocuments', [
      {
        name: 'CARNET DE IDENTIDAD',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'PASAPORTE',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'NIT',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
    //crear el negocio
    await queryInterface.bulkInsert('businesses', [{
      name: 'Super Balance',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
    const business = await queryInterface.sequelize.query(
      `SELECT id from businesses;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    //crear sucursal
    await queryInterface.bulkInsert('branchOffices', [{
      businessId: business[0].id,
      typeBranchOffice: 'Tienda',
      name: 'Achachicala',
      address: 'Av ALgun sitio 123',
      phone: '73735766',
      state: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    //crear rol
    await queryInterface.bulkInsert('roles', [{
      businessId: business[0].id,
      name: 'administrador',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
    //crear la asociación entre rol y los permisos creados
    const permissions = await queryInterface.sequelize.query(
      `SELECT id from permissions;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const roles = await queryInterface.sequelize.query(
      `SELECT id from roles;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    for (const permission of permissions) {
      await queryInterface.bulkInsert('rolePermissions', [{
        roleId: roles[0].id,
        permissionId: permission.id,
        state: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }
    const typeDocuments = await queryInterface.sequelize.query(
      `SELECT id FROM "typeDocuments";`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    //crear al usuario
    await queryInterface.bulkInsert('users', [{
      typeDocumentId: typeDocuments[0].id,
      numberDocument: '8312915',
      name: 'Moises',
      lastName: 'Ochoa',
      email: 'moisic.mo@gmail.com',
      phone: 73735766,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
    //crear el staff
    const users = await queryInterface.sequelize.query(
      `SELECT * from users;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    await queryInterface.bulkInsert('staffs', [{
      userId: users[0].id,
      roleId: roles[0].id,
      password: bcrypt.hashSync(`${users[0].numberDocument}`, bcrypt.genSaltSync()),
      superStaff: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    //crear la asociación entre sucursal y el staff
    const staffs = await queryInterface.sequelize.query(
      `SELECT id from staffs;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const branchOffices = await queryInterface.sequelize.query(
      `SELECT id from "branchOffices";`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    for (const branchOffice of branchOffices) {
      await queryInterface.bulkInsert('branchOfficeStaffs', [{
        branchOfficeId: branchOffice.id,
        staffId: staffs[0].id,
        state: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }

  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
