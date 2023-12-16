const { response } = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../database/models');
const { omit } = require("lodash");

const searchStaff = async (staffId) => {
  const staff = await db.staff.findByPk(staffId, {
    include: [
      {
        model: db.branchOfficeStaff,
        where: { state: true },
        include: [{ model: db.branchOffice }]
      }
    ]
  });
  return staff;
}

const formatStaff = (staff) => ({
  ...omit(staff.toJSON(), ['userId', 'roleId', 'password', 'state', 'superStaff', 'createdAt', 'updatedAt', 'role', 'branchOfficeStaffs']),
  user: {
    ...omit(staff.user.toJSON(), ['typeDocumentId', 'createdAt', 'updatedAt', 'typeDocument']),
    typeDocumentId: omit(staff.user.typeDocument.toJSON(), ['createdAt', 'updatedAt'])
  },
  roleId: {
    ...omit(staff.role.toJSON(), ['businessId', 'state', 'createdAt', 'updatedAt']),
    rolePermissions: staff.role.rolePermissions.map(rolePermission => omit(rolePermission.permission.toJSON(), ['createdAt', 'updatedAt'])),
  },
  branchOfficeIds: staff.branchOfficeStaffs.map(branchOfficeStaff => omit(branchOfficeStaff.branchOffice.toJSON(), ['businessId', 'state', 'createdAt', 'updatedAt'])),
});

const functionGetStaff = async (staffId = null, where = undefined) => {
  let queryOptions = {
    include: [
      {
        model: db.user,
        include: [{ model: db.typeDocument }]
      },
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
      {
        model: db.branchOfficeStaff,
        where: { state: true },
        include: [{ model: db.branchOffice }]
      }
    ],
  };
  if (staffId) {
    const staff = await db.staff.findByPk(staffId, queryOptions);
    return formatStaff(staff);
  } else {
    const staffs = await db.staff.findAll({ ...queryOptions, where: where });
    return staffs.map(staff => formatStaff(staff));
  }
};

const getStaffs = async (req, res = response) => {
  try {
    return res.json({
      ok: true,
      staffs: await functionGetStaff(null, { state: true })
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const createStaff = async (req, res = response) => {
  try {
    //verificamos si existe el usuario
    let user = await db.user.findOne({ where: { numberDocument: req.body.numberDocument } });
    if (!user) {
      //  creamos al usuario
      user = new db.user(req.body);
      await user.save();
    }
    //verificamos si existe el staff
    let staff = await db.staff.findOne({ where: { userId: user.id, state: true } });
    if (staff) {
      return res.status(400).json({
        errors: [{ msg: 'El Staff ya se encuentra registrado' }]
      });
    }
    //  creaciön de un staff
    staff = new db.staff();
    staff.userId = user.id;
    staff.roleId = req.body.roleId;
    //  encriptar contraseña
    const salt = bcrypt.genSaltSync();
    staff.password = bcrypt.hashSync(`${user.numberDocument}`, salt);
    await staff.save();
    //registrar la relacion entre staff y sucursal
    await Promise.all(req.body.branchOfficeIds.map(async item => {
      //encontramos al permiso asignado
      const branchOfficeStaff = new db.branchOfficeStaff();
      branchOfficeStaff.branchOfficeId = item;
      branchOfficeStaff.staffId = staff.id;
      await branchOfficeStaff.save();
    }));
    return res.json({
      ok: true,
      staff: await functionGetStaff(staff.id),
      msg: 'staff registrado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const updateStaff = async (req, res = response) => {
  const { staffId } = req.params;
  try {
    //encontramos el staff
    const staff = await searchStaff(staffId)
    if (!staff) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró el staff' }]
      });
    }
    //modificamos el staff
    await db.staff.update(
      req.body,
      {
        where: { id: staffId },
      }
    )
    //modificamos el usuario
    await db.user.update(
      req.body,
      {
        where: { id: staff.userId }
      }
    )
    //


    //encontramos todas las asignaciones existentes entre el staff y la sucursal
    const existingBranchOfficeStaff = await db.branchOfficeStaff.findAll({
      where: { staffId: staffId },
    });
    //identificamos las asignaciones que no se consideran
    const branchOfficesToDelete = existingBranchOfficeStaff.filter(
      (branchOfficeStaff) => !req.body.branchOfficeIds.includes(branchOfficeStaff.branchOfficeId)
    );
    //eliminamos las asignaciones de permisos que deben eliminarse
    await Promise.all(branchOfficesToDelete.map(async (branchOfficeStaff) => {
      await db.branchOfficeStaff.update(
        { state: false },
        { where: { id: branchOfficeStaff.id } }
      )
    }));

    //modificamos la asignación si corresponde
    const branchOffices = staff.branchOfficeStaffs.map((branchOfficeStaff) => branchOfficeStaff.branchOfficeId);

    await Promise.all(req.body.branchOfficeIds.map(async item => {
      //encontramos al permiso asignado
      if (!branchOffices.includes(item)) {
        //si no se encuentra; lo registramos
        const branchOfficeStaff = new db.branchOfficeStaff({
          staffId: staffId,
          branchOfficeId: item
        });
        await branchOfficeStaff.save();
      }
    }));

    return res.json({
      ok: true,
      staff: await functionGetStaff(staffId),
      msg: 'staff editado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const deleteStaff = async (req, res = response) => {
  const { staffId } = req.params;
  try {
    //encontramos el staff
    const staff = await searchStaff(staffId)
    if (!staff) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró el staff' }]
      });
    }
    //modificamos al staff
    await db.staff.update(
      { state: false },
      {
        where: { id: staffId },
      }
    );
    //modificamos las asociaciones
    await db.branchOfficeStaff.update(
      { state: false },
      { where: { staffId: staffId } }
    );
    return res.json({
      ok: true,
      staff: await functionGetStaff(staffId),
      msg: 'staff eliminado'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

module.exports = {
  getStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
}