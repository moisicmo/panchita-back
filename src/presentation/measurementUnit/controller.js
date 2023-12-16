const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");

const getMeasurementUnits = async (req, res = response) => {
  try {
    const measurementUnits = await db.measurementUnit.findAll();
    return res.json({
      ok: true,
      measurementUnits: measurementUnits.map(measurementUnit => omit(measurementUnit.toJSON(), ['createdAt', 'updatedAt'])),
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

module.exports = {
  getMeasurementUnits,
}