const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('../../config');
const { authStaff } = require('./controller');

const router = Router();


router.post(
  '/',
  [
    check('email', 'El correo es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validateFields
  ],
  authStaff
);



module.exports = router;