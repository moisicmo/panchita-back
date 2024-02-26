const { Router } = require('express');
const { validateJWT } = require('./../../middlewares');
const { getKardex,getKardexByBranchOffice } = require('./controller');

const router = Router();

router.use(validateJWT);

router.get('/', getKardex);

router.get('/:branchOfficeId', getKardexByBranchOffice);


module.exports = router;