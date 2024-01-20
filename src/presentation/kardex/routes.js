const { Router } = require('express');
const { validateJWT } = require('./../../middlewares');
const { getKardex } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getKardex)


module.exports = router;