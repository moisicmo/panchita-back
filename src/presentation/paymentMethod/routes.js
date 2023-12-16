const { Router } = require('express');
const { validateJWT } = require('./../../middlewares');
const { getPaymentMethods } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getPaymentMethods)


module.exports = router;