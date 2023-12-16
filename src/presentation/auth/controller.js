const { response } = require('express');
const db = require('../../database/models');
const bcrypt = require('bcryptjs');
const { generateJWT } = require('./../../config');
const { omit } = require("lodash");

const authStaff = async (req, res = response) => {
  const { email, password } = req.body;
  try {
    //buscamos al usuario
    const user = await db.user.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({
        errors: [{ msg: 'Lo lamento, no pudimos encontrarte' }]
      })
    }
    //verificamos que es staff
    const staff = await db.staff.findOne({
      where: { userId: user.id },
      include: [
        { model: db.user },
        {
          model: db.role,
          include: [
            {
              model: db.rolePermission,
              include: [
                {
                  model: db.permission,
                }
              ]
            }
          ]
        },
      ],
    });
    if (!staff) {
      return res.status(404).json({
        errors: [{ msg: 'Lo lamento, no pudimos encontrarte' }]
      })
    }
    //verificamos si tiene permitido el acceso
    if (!staff.state) {
      return res.status(404).json({
        errors: [{ msg: 'No tienes permitido el acceso' }]
      })
    }
    //verificamos si la contraseña es correcta
    const validPassword = bcrypt.compareSync(password, staff.password);
    if (!validPassword) {
      return res.status(400).json({
        errors: [{ msg: 'Contraseña incorrecta' }]
      });
    }
    //generamos un token
    const token = await generateJWT(staff.id, user.name);
    const staffWhitUserAndRole = (
      {
        ...omit(staff.toJSON(), ['userId', 'roleId', 'password', 'state', 'createdAt', 'updatedAt']),
        user: omit(user.toJSON(), ['roleId', 'createdAt', 'updatedAt']),
        role: ({
          ...omit(staff.role.toJSON(), ['state', 'createdAt', 'updatedAt', 'rolePermissions']),
          permissions: staff.role.rolePermissions.map(rolePermission =>
            omit(rolePermission.permission.toJSON(), ['createdAt', 'updatedAt'])
          )
        })
      });
    return res.json({
      ok: true,
      token: token,
      staff: staffWhitUserAndRole,
      msg: 'Autenticación correcta'
    })

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

module.exports = {
  authStaff,
}