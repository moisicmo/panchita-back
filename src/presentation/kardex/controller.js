const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");

const formatKardex = (kardex) => ({
  ...omit(kardex.toJSON(), ['createdAt', 'updatedAt', 'productId', 'branchOfficeId', 'inputOrOutputId']),
  product: omit(kardex.product.toJSON(), ['businessId', 'categoryId', 'measurementUnitId', 'state', 'createdAt', 'updatedAt']),
  branchOffice: omit(kardex.branchOffice.toJSON(), ['businessId', 'typeBranchOffice', 'state', 'createdAt', 'updatedAt']),
  input: omit(kardex.input?.toJSON(), ['updatedAt', 'branchOfficeId', 'productId']),
  output: omit(kardex.output?.toJSON(), ['updatedAt', 'branchOfficeId', 'productId'])
});

const functionGetKardex = async (kardexId = null, where = undefined) => {
  let queryOptions = {
    include: [
      { model: db.product },
      { model: db.branchOffice },
      { model: db.input },
      { model: db.output }
    ],
  };
  if (kardexId) {
    const kardex = await db.kardex.findByPk(kardexId, queryOptions);
    return formatKardex(kardex);
  } else {
    const kardexs = await db.kardex.findAll({ ...queryOptions, where: where });
    return kardexs.map(kardex => formatKardex(kardex));
  }
};

const getKardex = async (req, res = response) => {
  try {
    return res.json({
      ok: true,
      kardex: await functionGetKardex(null)
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

module.exports = {
  functionGetKardex,
  getKardex
}