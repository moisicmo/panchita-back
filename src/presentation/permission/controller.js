const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");

const getPermissions = async (req, res = response) => {
  try {
    const permissions = await db.permission.findAll();
    return res.json({
      ok: true,
      permissions: permissions.map(permission => omit(permission.toJSON(), ['createdAt', 'updatedAt'])),
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

module.exports = {
  getPermissions,
}