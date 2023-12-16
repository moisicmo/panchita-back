const { Router } = require('express');
const { validateJWT } = require('./../../middlewares');
const { getPermissions } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getPermissions)


module.exports = router;