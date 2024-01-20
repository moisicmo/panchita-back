const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('../../config');
const { validateJWT } = require('./../../middlewares');
const { getMeasurementUnits, createMeasurementUnit, updateMeasurementUnit, deleteMeasurementUnit } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getMeasurementUnits)

router.post(
  '/',
  [
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    validateFields
  ],
  createMeasurementUnit
);

router.put(
  '/:measurementUnitId',
  [
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    validateFields
  ],
  updateMeasurementUnit
);

router.delete(
  '/:measurementUnitId',
  deleteMeasurementUnit
);

module.exports = router;