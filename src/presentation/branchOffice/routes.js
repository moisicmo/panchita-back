const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('./../../config');
const { validateJWT } = require('./../../middlewares');
const { getBranchOffices, createBranchOffice, updateBranchOffice, deleteBranchOffice } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getBranchOffices)

router.post(
  '/',
  [
    check('businessId', 'El id del negocio es obligatorio').not().isEmpty(),
    check('typeBranchOffice', 'El tipo de negocio es obligatorio').not().isEmpty(),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('address', 'La direccion es obligatorio').not().isEmpty(),
    check('phone', 'El telefono es obligatorio').not().isEmpty(),
    validateFields
  ],
  createBranchOffice
);

router.put(
  '/:branchOfficeId',
  [
    check('businessId', 'El id del negocio es obligatorio').not().isEmpty(),
    check('typeBranchOffice', 'El tipo de negocio es obligatorio').not().isEmpty(),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('address', 'La direccion es obligatorio').not().isEmpty(),
    check('phone', 'El telefono es obligatorio').not().isEmpty(),
    validateFields
  ],
  updateBranchOffice
);

router.delete(
  '/:branchOfficeId',
  deleteBranchOffice
);

module.exports = router;