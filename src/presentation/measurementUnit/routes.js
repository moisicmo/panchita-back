const { Router } = require('express');
const { validateJWT } = require('../../middlewares');
const { getMeasurementUnits } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getMeasurementUnits)


module.exports = router;