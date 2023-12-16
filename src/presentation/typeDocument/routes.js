const { Router } = require('express');
const { validateJWT } = require('./../../middlewares');
const { getTypeDocuments } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getTypeDocuments)


module.exports = router;