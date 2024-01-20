const { Router } = require('express');
const { validateJWT } = require('./../../middlewares');
const { getSales, createSale, getDocument } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getSales)

router.post('/:orderId', createSale)

router.get('/document/:saleId', getDocument);

module.exports = router;