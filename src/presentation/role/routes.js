const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('./../../config');
const { validateJWT } = require('./../../middlewares');
const { getRoles, createRole, updateRole, deleteRole } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getRoles)

router.post(
  '/',
  [
    check('businessId', 'El nombre es obligatorio').not().isEmpty(),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('permissionIds', 'permissionIds debe ser un array').isArray(),
    validateFields
  ],
  createRole
);

router.put(
  '/:roleId',
  [
    check('businessId', 'El nombre es obligatorio').not().isEmpty(),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('permissionIds', 'permissionIds debe ser un array').isArray(),
    validateFields
  ],
  updateRole
);

router.delete(
  '/:roleId',
  deleteRole
);

module.exports = router;