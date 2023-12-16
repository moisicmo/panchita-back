const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");

const getPaymentMethods = async (req, res = response) => {
  try {
    const paymentMethods = await db.paymentMethod.findAll();
    return res.json({
      ok: true,
      paymentMethods: paymentMethods.map(paymentMethod => omit(paymentMethod.toJSON(), ['createdAt', 'updatedAt'])),
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

module.exports = {
  getPaymentMethods,
}