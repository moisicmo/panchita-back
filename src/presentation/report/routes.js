const { Router } = require('express');
const { validateJWT } = require('./../../middlewares');
const { getDashboard, getReport, getReportDocument } = require('./controller');

const router = Router();

router.use(validateJWT);

router.post('/', getReport)

router.post('/xlsx', getReportDocument)

router.get('/dashboard', getDashboard)



module.exports = router;