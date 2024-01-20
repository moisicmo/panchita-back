const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");

const searchMeasurementUnit = async (measurementUnitId) => {
  const measurementUnit = await db.measurementUnit.findByPk(measurementUnitId);
  return measurementUnit;
}

const formatMeasurementUnit = (measurementUnit) => ({
  ...omit(measurementUnit.toJSON(), ['createdAt', 'updatedAt', 'state']),
});

const functionGetMeasurementUnit = async (measurementUnitId = null, where = undefined) => {
  if (measurementUnitId) {
    const measurementUnit = await db.measurementUnit.findByPk(measurementUnitId);
    return formatMeasurementUnit(measurementUnit);
  } else {
    const measurementUnits = await db.measurementUnit.findAll({ where: where });
    return measurementUnits.map(measurementUnit => formatMeasurementUnit(measurementUnit));
  }
};

const getMeasurementUnits = async (req, res = response) => {
  try {
    return res.json({
      ok: true,
      measurementUnits: await functionGetMeasurementUnit(null, { state: true })
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}
const createMeasurementUnit = async (req, res = response) => {
  try {
    const measurementUnit = new db.measurementUnit(req.body);
    await measurementUnit.save();
    return res.json({
      ok: true,
      measurementUnit: await functionGetMeasurementUnit(measurementUnit.id),
      msg: 'unidad de medida registrado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const updateMeasurementUnit = async (req, res = response) => {
  const { measurementUnitId } = req.params;
  try {
    //encontramos la categoria
    const measurementUnit = await searchMeasurementUnit(measurementUnitId)
    if (!measurementUnit) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró la unidad de medida' }]
      });
    }
    //modificamos la categoria
    await db.measurementUnit.update(
      req.body,
      { where: { id: measurementUnitId } }
    )
    return res.json({
      ok: true,
      measurementUnit: await functionGetMeasurementUnit(measurementUnitId),
      msg: 'unidad de medida editado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const deleteMeasurementUnit = async (req, res = response) => {
  const { measurementUnitId } = req.params;
  try {
    //encontramos la categoria
    const measurementUnit = await searchMeasurementUnit(measurementUnitId)
    if (!measurementUnit) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró la unidad de medida' }]
      });
    }
    //modificamos la categoria
    await db.measurementUnit.update(
      { state: false },
      { where: { id: measurementUnitId } }
    );
    return res.json({
      ok: true,
      measurementUnit: await functionGetMeasurementUnit(measurementUnitId),
      msg: 'categoria eliminado'
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
  createMeasurementUnit,
  updateMeasurementUnit,
  deleteMeasurementUnit
}