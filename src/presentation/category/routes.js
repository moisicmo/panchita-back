const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('./../../config');
const { validateJWT } = require('./../../middlewares');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getCategories)

router.post(
  '/',
  [
    check('businessId', 'El id del negocio es obligatorio').not().isEmpty(),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    validateFields
  ],
  createCategory
);

router.put(
  '/:categoryId',
  [
    check('businessId', 'El id del negocio es obligatorio').not().isEmpty(),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    validateFields
  ],
  updateCategory
);

router.delete(
  '/:categoryId',
  deleteCategory
);

module.exports = router;