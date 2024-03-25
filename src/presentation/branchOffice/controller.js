const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");

const searchBranchOffice = async (branchOfficeId) => {
  const branchOffice = await db.branchOffice.findByPk(branchOfficeId);
  if (!branchOffice) {
    return res.status(404).json({
      errors: [{ msg: 'No se encontró la sucursal' }]
    });
  }
  return;
}

const formatBranchOffice = (branchOffice) => ({
  ...omit(branchOffice.toJSON(), ['createdAt', 'updatedAt', 'state', 'businessId']),
});

const functionGetBranchOffice = async (branchOfficeId = null, where = undefined) => {
  if (branchOfficeId) {
    const branchOffice = await db.branchOffice.findByPk(branchOfficeId);
    return formatBranchOffice(branchOffice);
  } else {
    const branchOffices = await db.branchOffice.findAll({ where: where });
    return branchOffices.map(branchOffice => formatBranchOffice(branchOffice));
  }
};

const getBranchOffices = async (req, res = response) => {
  try {
    return res.json({
      ok: true,
      branchOffices: await functionGetBranchOffice(null, { state: true })
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const createBranchOffice = async (req, res = response) => {
  try {
    //creamos la sucursal
    const branchOffice = new db.branchOffice(req.body);
    await branchOffice.save();
    return res.json({
      ok: true,
      branchOffice: await functionGetBranchOffice(branchOffice.id),
      msg: 'sucursal registrado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const updateBranchOffice = async (req, res = response) => {
  const { branchOfficeId } = req.params;
  try {
    //encontramos la sucursal
    await searchBranchOffice(branchOfficeId)
    //modificamos la sucursal
    await db.branchOffice.update(
      req.body,
      { where: { id: branchOfficeId } }
    )
    return res.json({
      ok: true,
      branchOffice: await functionGetBranchOffice(branchOfficeId),
      msg: 'sucursal editado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const deleteBranchOffice = async (req, res = response) => {
  const { branchOfficeId } = req.params;
  try {
    //encontramos la sucursal
    await searchBranchOffice(branchOfficeId)
    //modificamos la sucursal
    await db.branchOffice.update(
      { state: false },
      { where: { id: branchOfficeId } }
    );
    return res.json({
      ok: true,
      branchOffice: await functionGetBranchOffice(branchOfficeId),
      msg: 'sucursal eliminado'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

module.exports = {
  //funciones
  functionGetBranchOffice,
  //metodos
  getBranchOffices,
  createBranchOffice,
  updateBranchOffice,
  deleteBranchOffice,
}