const validateFields = require('./validateFields');
const generateJWT = require('./generateJwt');
const generatePdf = require('./generatePdf');
const generateXlsx = require('./generateXlsx');

module.exports = {
  ...validateFields,
  ...generateJWT,
  ...generatePdf,
  ...generateXlsx,
}