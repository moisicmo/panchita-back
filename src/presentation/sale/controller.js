const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");
const generateDocument = require('./../../config/generatePdf');


const searchRole = async (roleId) => {
  const role = await db.role.findByPk(roleId, {
    include: [
      {
        model: db.rolePermission,
        include: [
          { model: db.permission }
        ]
      }
    ]
  });
  return role;
}

const formatSale = (sale) => ({
  ...omit(sale.order.toJSON(), ['branchOfficeId', 'staffId', 'customerId', 'paymentMethodId', 'updatedAt', 'state', 'businessId', 'orderOutputs']),
  staff: {
    ...omit(sale.order.staff.toJSON(), ['userId', 'state', 'createdAt', 'updatedAt']),
    user: omit(sale.order.staff.user.toJSON(), ['typeDocumentId', 'createdAt', 'updatedAt']),
  },
  customer: {
    ...omit(sale.order.customer.toJSON(), ['userId', 'state', 'createdAt', 'updatedAt']),
    user: omit(sale.order.customer.user.toJSON(), ['typeDocumentId', 'createdAt', 'updatedAt']),
  },
  paymentMethod: omit(sale.order.paymentMethod.toJSON(), ['createdAt', 'updatedAt']),
  branchOffice: omit(sale.order.branchOffice.toJSON(), ['businessId', 'state', 'createdAt', 'updatedAt']),
  outputIds:
    sale.order.orderOutputs.map((orderOutput) => ({
      ...omit(orderOutput.output.toJSON(), ['branchOfficeId', 'productId', 'state', 'createdAt', 'updatedAt']),
      product: {
        ...omit(orderOutput.output.product.toJSON(), ['businessId', 'categoryId', 'measurementUnitId', 'visible', 'state', 'createdAt', 'updatedAt']),
        category: omit(orderOutput.output.product.category.toJSON(), ['businessId', 'state', 'createdAt', 'updatedAt']),
        measurementUnit: omit(orderOutput.output.product.measurementUnit.toJSON(), ['createdAt', 'updatedAt'])
      }
    })),
});

const functionGetSale = async (saleId = null, where = undefined) => {
  let queryOptions = {
    include: [
      {
        model: db.order,
        include: [
          {
            model: db.staff,
            include: [{ model: db.user }]
          },
          {
            model: db.customer,
            include: [{ model: db.user }]
          },
          { model: db.paymentMethod },
          { model: db.branchOffice },
          {
            model: db.orderOutput,
            include: [
              {
                model: db.output,
                where: { state: true },
                include: [
                  {
                    model: db.product,
                    include: [
                      { model: db.category },
                      { model: db.measurementUnit }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
    ],
  };
  if (saleId) {
    const sale = await db.sale.findByPk(saleId, queryOptions);
    return formatSale(sale);
  } else {
    const sales = await db.sale.findAll({ ...queryOptions, where: where });
    return sales.map(sale => formatSale(sale));
  }
};

const getPdf = async (orderId) => {
  const order = await functionGetSale(orderId)
  const { pdfBase64 } = await generateDocument(order, 'NOTA DE VENTA');
  return pdfBase64;
}

const getSales = async (req, res = response) => {

  try {
    return res.json({
      ok: true,
      sales: await functionGetSale(),
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const createSale = async (req, res = response) => {
  const { orderId } = req.params;
  try {
    const sale = new db.sale();
    sale.orderId = orderId;
    await sale.save();
    return res.json({
      ok: true,
      document: await getPdf(orderId)

    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const getDocument = async (req, res = response) => {
const { orderId } = req.params;
try {
    res.json({
      document: await getPdf(orderId)
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}




module.exports = {
  getSales,
  createSale,
  getDocument,
}