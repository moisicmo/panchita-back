const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");

const searchRole = async (roleId) => {
  const role = await db.role.findByPk(roleId, {
    include: [
      {
        model: db.rolePermission,
        include: [
          { model: db.permission }
        ]
      }
    ]
  });
  return role;
}

const formatRole = (role) => ({
  ...omit(role.toJSON(), ['createdAt', 'updatedAt', 'rolePermissions', 'state', 'businessId']),
  permissionIds: role.rolePermissions.map(rolePermission => omit(rolePermission.permission.toJSON(), ['createdAt', 'updatedAt'])),
});

const functionGetRole = async (roleId = null, where = undefined) => {
  let queryOptions = {
    include: [
      {
        model: db.rolePermission,
        where: { state: true },
        include: [
          {
            model: db.permission,
          }
        ]
      }
    ],
  };
  if (roleId) {
    const role = await db.role.findByPk(roleId, queryOptions);
    return formatRole(role);
  } else {
    const roles = await db.role.findAll({
      ...queryOptions,
      where: where
    });
    return roles.map(role => formatRole(role));
  }
};

const getRoles = async (req, res = response) => {
  try {
    return res.json({
      ok: true,
      roles: await functionGetRole(null, { state: true }),
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const createRole = async (req, res = response) => {
  try {
    //creamos el rol
    const role = new db.role(req.body);
    await role.save();
    //asignamos los permisos al rol
    await Promise.all(req.body.permissionIds.map(async item => {
      const rolePermission = new db.rolePermission({
        roleId: role.id,
        permissionId: item
      });
      await rolePermission.save();
    }));
    return res.json({
      ok: true,
      role: await functionGetRole(role.id),
      msg: 'rol registrado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const updateRole = async (req, res = response) => {
  const { roleId } = req.params;
  try {
    //encontramos al rol
    const role = await searchRole(roleId)
    if (!role) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró el rol' }]
      });
    }
    //modificamos el rol
    await db.role.update(
      req.body,
      { where: { id: roleId } }
    )
    //encontramos todas las asignaciones existentes para el rol
    const existingRolePermissions = await db.rolePermission.findAll({
      where: { roleId: roleId },
    });
    //identificamos los permisos que deben eliminarse
    const permissionsToDelete = existingRolePermissions.filter(
      (rolePermission) => !req.body.permissionIds.includes(rolePermission.permissionId)
    );
    //eliminamos las asignaciones de permisos que deben eliminarse
    await Promise.all(permissionsToDelete.map(async (rolePermission) => {
      console.log(rolePermission)
      await db.rolePermission.update(
        { state: false },
        { where: { id: rolePermission.id } }
      )
    }));
    //modificamos la asignación si corresponde
    const permissions = role.rolePermissions.map((rolePermission) => rolePermission.permissionId);

    await Promise.all(req.body.permissionIds.map(async item => {
      //encontramos al permiso asignado
      if (!permissions.includes(item)) {
        //si no se encuentra; lo registramos
        const rolePermission = new db.rolePermission({
          roleId: roleId,
          permissionId: item
        });
        await rolePermission.save();
      }
    }));
    return res.json({
      ok: true,
      role: await functionGetRole(roleId),
      msg: 'rol editado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const deleteRole = async (req, res = response) => {
  const { roleId } = req.params;
  try {
    //encontramos al rol
    const role = await searchRole(roleId)
    if (!role) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró el rol' }]
      });
    }
    //modificamos al rol
    await db.role.update(
      { state: false },
      { where: { id: roleId } }
    );
    //modificamos las asociaciones
    await db.rolePermission.update(
      { state: false },
      { where: { roleId: roleId } }
    );
    return res.json({
      ok: true,
      msg: 'rol eliminado'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
}