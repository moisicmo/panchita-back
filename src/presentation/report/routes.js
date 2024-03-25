const { Router } = require('express');
const { validateJWT } = require('./../../middlewares');
const { getDashboard } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/dashboard', getDashboard)



module.exports = router;