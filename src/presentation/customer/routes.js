const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('../../config');
const { validateJWT } = require('./../../middlewares');
const { getCustomers, createCustomer, updateCustomer, deleteCustomer } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getCustomers)

router.post(
  '/',
  [
    // user
    check('typeDocumentId', 'El id del tipo de documento es obligatorio').not().isEmpty(),
    check('numberDocument', 'El nombre es obligatorio').not().isEmpty(),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('lastName', 'El apellido es obligatorio').not().isEmpty(),
    check('email', 'El correo es obligatorio').isEmail(),
    check('phone', 'El telefono es obligatorio').isMobilePhone(),
    validateFields
  ],
  createCustomer
);

router.put(
  '/:customerId',
  [
    // user
    check('typeDocumentId', 'El id del tipo de documento es obligatorio').not().isEmpty(),
    check('numberDocument', 'El nombre es obligatorio').not().isEmpty(),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('lastName', 'El apellido es obligatorio').not().isEmpty(),
    check('email', 'El correo es obligatorio').isEmail(),
    check('phone', 'El telefono es obligatorio').isMobilePhone(),
    validateFields
  ],
  updateCustomer
);

router.delete(
  '/:customerId',
  deleteCustomer
);


module.exports = router;