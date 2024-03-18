const { Router } = require('express');
const { check } = require('express-validator');
const { validateFields } = require('./../../config');
const { validateJWT } = require('./../../middlewares');
const { getOrders, getOrderByBranchOffice, getDocument, createSale, createOrder, updateOrder, deleteOrder } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getOrders);

router.get('/:branchOfficeId', getOrderByBranchOffice);

router.post('/sale/:orderId', createSale);

router.post(
  '/',
  [
    check('branchOfficeId', 'El id de la sucursal es obligatorio').not().isEmpty(),
    check('customerId', 'El id del cliente es obligatorio').not().isEmpty(),
    check('paymentMethodId', 'El id del metodo de pago es obligatorio').not().isEmpty(),
    validateFields
  ],
  createOrder
);


router.put(
  '/:orderId',
  [
    check('branchOfficeId', 'El id de la sucursal es obligatorio').not().isEmpty(),
    check('customerId', 'El id del cliente es obligatorio').not().isEmpty(),
    check('paymentMethodId', 'El id del metodo de pago es obligatorio').not().isEmpty(),
    validateFields
  ],
  updateOrder
);

router.delete(
  '/:orderId',
  deleteOrder
);

router.get('/document/:orderId', getDocument);

module.exports = router;