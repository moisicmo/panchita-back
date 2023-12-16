const path = require('path');

const AppRoutes = async (app) => {

  app.use('/api/auth', require('./auth/routes'));

  app.use('/api/typeDocument', require('./typeDocument/routes'));
  app.use('/api/paymentMethod', require('./paymentMethod/routes'));
  app.use('/api/measurementUnit', require('./measurementUnit/routes'));
  app.use('/api/branchOffice', require('./branchOffice/routes'));
  app.use('/api/category', require('./category/routes'))
  app.use('/api/permission', require('./permission/routes'));
  app.use('/api/role', require('./role/routes'));
  app.use('/api/staff', require('./staff/routes'));
  app.use('/api/customer', require('./customer/routes'));
  app.use('/api/product', require('./product/routes'));
  app.use('/api/order', require('./order/routes'));
  // app.use('/api/sale', require('./product/routes'));

  // app.use('/api/report', require('./product/routes'));



  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './../public/index.html'))
  });
};

module.exports = { AppRoutes };
