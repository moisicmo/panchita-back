const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('../../config');
const { authStaff,changePassword } = require('./controller');

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

router.post(
  '/change/pwd/:staffId',
  changePassword
);



module.exports = router;