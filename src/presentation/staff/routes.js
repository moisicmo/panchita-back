const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('./../../config');
const { validateJWT } = require('./../../middlewares');
const { getStaffs, createStaff, updateStaff, deleteStaff } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getStaffs)

router.post(
  '/',
  [
    //user
    check('typeDocumentId', 'El id del tipo de documento es obligatorio').not().isEmpty(),
    check('numberDocument', 'El nombre es obligatorio').not().isEmpty(),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('lastName', 'El apellido es obligatorio').not().isEmpty(),
    check('email', 'El correo es obligatorio').isEmail(),
    check('phone', 'El telefono es obligatorio').isMobilePhone(),
    //staff
    check('roleId', 'El rol es obligatorio').not().isEmpty(),
    validateFields
  ],
  createStaff
);

router.put(
  '/:staffId',
  [
    //user
    check('typeDocumentId', 'El id del tipo de documento es obligatorio').not().isEmpty(),
    check('numberDocument', 'El nombre es obligatorio').not().isEmpty(),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('lastName', 'El apellido es obligatorio').not().isEmpty(),
    check('email', 'El correo es obligatorio').isEmail(),
    check('phone', 'El telefono es obligatorio').isMobilePhone(),
    //staff
    check('roleId', 'El rol es obligatorio').not().isEmpty(),
    validateFields
  ],
  updateStaff
);

router.delete(
  '/:staffId',
  deleteStaff
);

module.exports = router;