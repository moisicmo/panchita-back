const { response } = require('express');
const db = require('../../database/models');
const { functionGetKardex } = require('./../kardex/controller');

const createInput = async (req, res = response) => {
  try {
    const { branchOfficeId, productId, detail } = req.body;
    //creamos el input
    const input = new db.input(req.body);
    await input.save();
    // obtener el último registro en el kardex
    const kardex = await db.kardex.findOne({
      where: {
        productId: productId,
        branchOfficeId: branchOfficeId
      },
      order: [['createdAt', 'DESC']]
    });
    //registramos en el kardex
    const newKardex = new db.kardex();
    newKardex.productId = productId;
    newKardex.branchOfficeId = branchOfficeId;
    newKardex.inputOrOutputId = input.id;
    newKardex.inputOrOutputType = 'inputs';
    newKardex.detail = detail;
    newKardex.stock = kardex ? (kardex.stock + input.quantity) : input.quantity
    await newKardex.save();
    return res.json({
      ok: true,
      kardex: await functionGetKardex(newKardex.id),
      msg: 'movimiento registrado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}
module.exports = {
  createInput
}