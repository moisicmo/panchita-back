const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('./../../config');
const { validateJWT } = require('./../../middlewares');
const { getProducts, createProduct, updateProduct, deleteProduct } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getProducts)

router.post(
  '/',
  [
    check('businessId', 'El id del negocio es obligatorio').not().isEmpty(),
    check('categoryId', 'El id de la categoria es obligatorio').not().isEmpty(),
    check('measurementUnitId', 'El id de la categoria es obligatorio').not().isEmpty(),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('barCode', 'El nombre es obligatorio').not().isEmpty(),
    check('price', 'El nombre es obligatorio').not().isEmpty(),
    check('discount', 'El nombre es obligatorio').not().isEmpty(),
    check('typeDiscount', 'El nombre es obligatorio').not().isEmpty(),
    validateFields
  ],
  createProduct
);

router.put(
  '/:productId',
  [
    check('businessId', 'El id del negocio es obligatorio').not().isEmpty(),
    check('categoryId', 'El id de la categoria es obligatorio').not().isEmpty(),
    check('measurementUnitId', 'El id de la categoria es obligatorio').not().isEmpty(),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('barCode', 'El nombre es obligatorio').not().isEmpty(),
    check('price', 'El nombre es obligatorio').not().isEmpty(),
    check('discount', 'El nombre es obligatorio').not().isEmpty(),
    check('typeDiscount', 'El nombre es obligatorio').not().isEmpty(),
    validateFields
  ],
  updateProduct
);

router.delete(
  '/:productId',
  deleteProduct
);

module.exports = router;