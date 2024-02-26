const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");
const generateDocument = require('./../../config/generatePdf');
const { functionGetKardex } = require('../kardex/controller');

const searchOrder = async (orderId) => {
  const order = await db.order.findByPk(orderId, {
    include: [
      {
        model: db.output,
        include: [{ model: db.product }]
      }
    ]
  });
  return order;
}

const formatOrder = (order) => ({
  ...omit(order.toJSON(), ['branchOfficeId', 'staffId', 'customerId', 'paymentMethodId', 'updatedAt', 'state', 'businessId']),
  staff: {
    ...omit(order.staff.toJSON(), ['userId', 'state', 'createdAt', 'updatedAt']),
    user: omit(order.staff.user.toJSON(), ['typeDocumentId', 'createdAt', 'updatedAt']),
  },
  customer: {
    ...omit(order.customer.toJSON(), ['userId', 'state', 'createdAt', 'updatedAt']),
    user: omit(order.customer.user.toJSON(), ['typeDocumentId', 'createdAt', 'updatedAt']),
  },
  paymentMethod: omit(order.paymentMethod.toJSON(), ['createdAt', 'updatedAt']),
  branchOffice: omit(order.branchOffice.toJSON(), ['businessId', 'state', 'createdAt', 'updatedAt']),
  
  outputs: order.outputs.map((output) => (
    {
      ...omit(output.toJSON(), ['createdAt', 'updatedAt']),
      quantityOrigin: output.quantity,
    }
    // omit(output.toJSON(), ['branchOfficeId', 'productId', 'state', 'createdAt', 'updatedAt']),
    // product: {
    //   ...omit(orderOutput.output.product.toJSON(), ['businessId', 'categoryId', 'measurementUnitId', 'visible', 'state', 'createdAt', 'updatedAt']),
    //   category: omit(orderOutput.output.product.category.toJSON(), ['businessId', 'state', 'createdAt', 'updatedAt']),
    //   measurementUnit: omit(orderOutput.output.product.measurementUnit.toJSON(), ['createdAt', 'updatedAt'])
    // }
  ))
});

const functionGetOrder = async (orderId = null, where = undefined, whereBranchOffice = undefined) => {
  let queryOptions = {
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
      {
        model: db.branchOffice,
        where: whereBranchOffice
      },
      {
        model: db.output,
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
    ],
  };
  if (orderId) {
    const order = await db.order.findByPk(orderId, queryOptions);
    return formatOrder(order);
  } else {
    const orders = await db.order.findAll({ ...queryOptions, where: where });
    return orders.map(order => formatOrder(order));
  }
};

const getOrders = async (req, res = response) => {
  try {
    return res.json({
      ok: true,
      orders: await functionGetOrder(null)
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const getOrderByBranchOffice = async (req, res = response) => {
  try {
    return res.json({
      ok: true,
      orders: await functionGetOrder(null, null, { id: req.params.branchOfficeId })
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const createOrder = async (req, res = response) => {
  try {
    //creamos la order
    const order = new db.order(req.body);
    order.staffId = req.uid;

    order.amount = req.body.outputs.reduce((sum, element) => sum + (element.quantity * element.price), 0);
    const newOrder = await order.save();
    await Promise.all(req.body.outputs.map(async item => {
      //creamos el output
      const output = new db.output();
      output.branchOfficeId = req.body.branchOfficeId;
      output.orderId = newOrder.id;
      output.productId = item.productId;
      output.quantity = item.quantity;
      output.price = item.price;
      output.discount = item.discount;
      output.typeDiscount = item.typeDiscount;
      await output.save();
      // obtener el último registro en el kardex
      const kardex = await db.kardex.findOne({
        where: {
          productId: item.productId,
          branchOfficeId: req.body.branchOfficeId
        },
        order: [['createdAt', 'DESC']]
      });
      // registramos como venta en el kardex
      const newKardex = new db.kardex();
      newKardex.productId = item.productId;
      newKardex.branchOfficeId = req.body.branchOfficeId;
      newKardex.inputOrOutputId = output.id;
      newKardex.inputOrOutputType = 'outputs';
      newKardex.detail = 'pre venta';
      newKardex.stock = kardex.stock - output.quantity;
      await newKardex.save();
    }));



    const kardex = await functionGetKardex(null, { branchOfficeId: req.body.branchOfficeId });
    const productsWithBranchOfficeId = kardex[0].branchOffice.products.map((product) => ({
      ...product,
      branchOfficeId: parseInt(req.body.branchOfficeId)
    }));

    const orderInfo = await functionGetOrder(order.id)
    const { pdfBase64 } = await generateDocument(orderInfo, 'PROFORMA');
    return res.json({
      ok: true,
      products: productsWithBranchOfficeId,
      document: pdfBase64,
      msg: 'orden registrado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const updateOrder = async (req, res = response) => {
  console.log('HOLA EDITANDO');
  const { orderId } = req.params;
  try {
    // Encontramos la orden
    const order = await searchOrder(orderId);
    if (!order) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró la orden' }]
      });
    }
    // Identificamos los productos que deben revertirse
    const productsToInput = order.outputs.filter(
      (orderOutput) => !req.body.outputs.map(output => output.product.id).includes(orderOutput.product.id)
    );
    console.log(productsToInput)

    // Revertimos los productos  //TODO revisar
    await Promise.all(productsToInput.map(async (item) => {
      // Agregamos al nuevo input
      const input = new db.input({
        branchOfficeId: req.body.branchOfficeId,
        productId: item.product.id,
        quantity: item.quantity,
        price: item.price,
      });
      await input.save();

      // obtener el último registro en el kardex
      const kardex = await db.kardex.findOne({
        where: {
          productId: item.product.id,
          branchOfficeId: req.body.branchOfficeId
        },
        order: [['createdAt', 'DESC']]
      });
      // Creamos el registro del kardex
      // registramos como venta en el kardex
      const newKardex = new db.kardex();
      newKardex.productId = item.product.id;
      newKardex.branchOfficeId = req.body.branchOfficeId;
      newKardex.inputOrOutputId = input.id;
      newKardex.inputOrOutputType = 'inputs';
      newKardex.detail = 'ajuste';
      newKardex.stock = kardex.stock - input.quantity;
      await newKardex.save();
    }));

    // Verificamos, creamos o actualizamos productos
    const allOrderOutputs = order.outputs.map((orderOutput) => orderOutput.product.id);
    await Promise.all(req.body.outputs.map(async item => {
      if (!allOrderOutputs.includes(item.product.id)) {
        // Si no se encuentra; lo registramos
        const output = new db.output({
          orderId: orderId,
          branchOfficeId: req.body.branchOfficeId,
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          discount: item.discount,
          typeDiscount: item.typeDiscount,
        });
        await output.save();
        // obtener el último registro en el kardex
        const kardex = await db.kardex.findOne({
          where: {
            productId: item.product.id,
            branchOfficeId: req.body.branchOfficeId
          },
          order: [['createdAt', 'DESC']]
        });
        // Creamos el registro del kardex
        // registramos como venta en el kardex
        const newKardex = new db.kardex();
        newKardex.productId = item.product.id;
        newKardex.branchOfficeId = req.body.branchOfficeId;
        newKardex.inputOrOutputId = output.id;
        newKardex.inputOrOutputType = 'outputs';
        newKardex.detail = 'pre venta';
        newKardex.stock = kardex.stock - output.quantity;
        await newKardex.save();
      } else {
        // Si existe, actualizamos
        console.log(item)
        await db.output.update(
          item,
          { where: { id: item.id } }
        );
      }
    }));

    //actualizamos la orden
    await db.order.update(
      {
        amount: req.body.outputs.reduce((sum, element) => sum + (element.quantity * element.price), 0)
      },
      { where: { id: orderId } }
    );

    // return res.json({
    //   ok: true,
    //   order: await functionGetOrder(orderId),
    //   msg: 'Orden editada exitosamente'
    // });

    return res.json({
      ok: true
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errors: [{ msg: 'Error en el servidor. Por favor, contacte al administrador.' }]
    });
  }
}

const deleteOrder = async (req, res = response) => {
  const { orderId } = req.params;
  try {
    //encontramos la orden
    const order = await searchOrder(orderId);
    if (!order) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró la orden' }]
      });
    }
    //modificamos la orden
    await db.order.update(
      { state: false },
      { where: { id: orderId } }
    );
    // actualizamos los outputs y movemos a input
    await Promise.all(order.orderOutputs.map(async item => {
      // ponemos oputput en falso
      await db.output.update(
        { where: { productId: item.output.productId } }
      );
      // Agregamos al nuevo input
      const input = new db.input({
        branchOfficeId: item.output.branchOfficeId,
        productId: item.output.productId,
        quantity: item.output.quantity,
        price: item.output.price,
      });
      await input.save();

    }));

    return res.json({
      ok: true,
      order: await functionGetOrder(orderId),
      msg: 'orden eliminado'
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
    const order = await functionGetOrder(orderId)
    const { pdfBase64 } = await generateDocument(order, 'PROFORMA');
    res.json({
      document: pdfBase64
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

module.exports = {
  getOrders,
  getOrderByBranchOffice,
  createOrder,
  updateOrder,
  deleteOrder,
  getDocument,
}