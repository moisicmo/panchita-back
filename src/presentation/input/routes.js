const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('./../../config');
const { validateJWT } = require('./../../middlewares');
const { createInput } = require('./controller');

const router = Router();

router.use(validateJWT);

router.post(
  '/',
  [
    check('branchOfficeId', 'El id del negocio es obligatorio').not().isEmpty(),
    check('productId', 'El id del negocio es obligatorio').not().isEmpty(),
    check('quantity', 'El id del negocio es obligatorio').not().isEmpty(),
    check('price', 'El id del negocio es obligatorio').not().isEmpty(),
    check('detail', 'El id del negocio es obligatorio').not().isEmpty(),
    validateFields
  ],
  createInput
);


module.exports = router;