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
      // sucursales
      {
        name: 'listar sucursales',
        module: 'sucursales',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'crear sucursal',
        module: 'sucursales',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'editar sucursal',
        module: 'sucursales',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'eliminar sucursal',
        module: 'sucursales',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // administradores
      {
        name: 'listar administradores',
        module: 'administradores',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'crear administrador',
        module: 'administradores',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'editar administrador',
        module: 'administradores',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'eliminar administrador',
        module: 'administradores',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // roles
      {
        name: 'listar roles',
        module: 'roles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'crear rol',
        module: 'roles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'editar rol',
        module: 'roles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'eliminar rol',
        module: 'roles',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // permisos
      {
        name: 'listar permisos',
        module: 'permisos',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // clientes
      {
        name: 'listar clientes',
        module: 'clientes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'crear cliente',
        module: 'clientes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'editar cliente',
        module: 'clientes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'eliminar cliente',
        module: 'clientes',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // categorias
      {
        name: 'crear categoria',
        module: 'categorias',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'editar categoria',
        module: 'categorias',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'eliminar categoria',
        module: 'categorias',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // unidades de medidas
      {
        name: 'crear unidad de medida',
        module: 'unidades de medidas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'editar unidad de medida',
        module: 'unidades de medidas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'eliminar unidad de medida',
        module: 'unidades de medidas',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // productos
      {
        name: 'listar productos',
        module: 'productos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'crear producto',
        module: 'productos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'editar producto',
        module: 'productos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'eliminar producto',
        module: 'productos',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // movimientos
      {
        name: 'listar movimientos',
        module: 'movimientos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'crear ingreso de productos',
        module: 'movimientos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      //punto de venta
      {
        name: 'ver punto de venta',
        module: 'punto de venta',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'vender',
        module: 'punto de venta',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      //ordenes y ventas
      {
        name: 'listar ordenes y ventas',
        module: 'ordenes y ventas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'editar orden',
        module: 'ordenes y ventas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'descargar pdf',
        module: 'ordenes y ventas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'eliminar orden o venta',
        module: 'ordenes y ventas',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // entregas
      {
        name: 'listar entregas',
        module: 'entregas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'hacer entrega',
        module: 'entregas',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      //reporte
      {
        name: 'generar reportes',
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
