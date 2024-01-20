const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");
const generateDocument = require('./../../config/generatePdf');

const searchOrder = async (orderId) => {
  const order = await db.order.findByPk(orderId, {
    include: [
      {
        model: db.orderOutput,
        include: [
          {
            model: db.output,
            where: { state: true },
            include: [{ model: db.product }]
          }
        ]
      }
    ]
  });
  return order;
}

const formatOrder = (order) => ({
  ...omit(order.toJSON(), ['branchOfficeId', 'staffId', 'customerId', 'paymentMethodId', 'updatedAt', 'state', 'businessId', 'orderOutputs']),
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
  outputIds:
    order.orderOutputs.map((orderOutput) => ({
      ...omit(orderOutput.output.toJSON(), ['branchOfficeId', 'productId', 'state', 'createdAt', 'updatedAt']),
      product: {
        ...omit(orderOutput.output.product.toJSON(), ['businessId', 'categoryId', 'measurementUnitId', 'visible', 'state', 'createdAt', 'updatedAt']),
        category: omit(orderOutput.output.product.category.toJSON(), ['businessId', 'state', 'createdAt', 'updatedAt']),
        measurementUnit: omit(orderOutput.output.product.measurementUnit.toJSON(), ['createdAt', 'updatedAt'])
      }
    })),
});

const functionGetOrder = async (orderId = null, where = undefined) => {
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

const createOrder = async (req, res = response) => {
  try {
    //creamos la order
    const order = new db.order(req.body);
    order.staffId = req.uid,
      order.amount = req.body.outputs.reduce((sum, element) => sum + (element.quantity * element.price), 0);
    await order.save();
    await Promise.all(req.body.outputs.map(async item => {
      //creamos el output
      const output = new db.output();
      output.branchOfficeId = req.body.branchOfficeId;
      output.productId = item.productId;
      output.quantity = item.quantity;
      output.price = item.price;
      output.discount = item.discount;
      output.typeDiscount = item.typeDiscount;
      await output.save();
      //creamos la asignacion
      const orderOutput = new db.orderOutput();
      orderOutput.orderId = order.id;
      orderOutput.outputId = output.id;
      await orderOutput.save();
      // obtener el último registro en el kardex
      const kardex = await db.kardex.findOne({
        where: {
          productId: item.productId,
          branchOfficeId: req.body.branchOfficeId
        },
        order: [['createdAt', 'DESC']]
      });
      //registramos como venta en el kardex
      const newKardex = new db.kardex();
      newKardex.productId = item.productId;
      newKardex.branchOfficeId = req.body.branchOfficeId;
      newKardex.inputOrOutputId = output.id;
      newKardex.inputOrOutputType = 'outputs';
      newKardex.detail = 'venta';
      newKardex.stock = kardex.stock - output.quantity;
      await newKardex.save();
    }));
    return res.json({
      ok: true,
      order: await functionGetOrder(order.id),
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
    const productsToInput = order.orderOutputs.filter(
      (orderOutput) => !req.body.outputs.map(output => output.productId).includes(orderOutput.output.productId)
    );

    // Revertimos los productos
    await Promise.all(productsToInput.map(async (item) => {
      // Agregamos al nuevo input
      const input = new db.input({
        branchOfficeId: item.output.branchOfficeId,
        productId: item.output.productId,
        quantity: item.output.quantity,
        price: item.output.price,
      });
      await input.save();

      // Cambiamos el estado del output
      await db.output.update(
        { state: false },
        { where: { id: item.id } }
      );
    }));

    // Verificamos, creamos o actualizamos productos
    const allOrderOutputs = order.orderOutputs.map((orderOutput) => orderOutput.output.productId);
    await Promise.all(req.body.outputs.map(async item => {
      if (!allOrderOutputs.includes(item.productId)) {
        // Si no se encuentra; lo registramos
        const output = new db.output({
          branchOfficeId: req.body.branchOfficeId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          typeDiscount: item.typeDiscount,
        });
        await output.save();

        // Creamos la asignacion
        const orderOutput = new db.orderOutput({
          orderId: orderId,
          outputId: output.id,
        });
        await orderOutput.save();
      } else {
        // Si existe, actualizamos
        await db.output.update(
          item,
          { where: { productId: item.productId } }
        );
      }
    }));

    return res.json({
      ok: true,
      order: await functionGetOrder(orderId),
      msg: 'Orden editada exitosamente'
    });
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
        { state: false },
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
  createOrder,
  updateOrder,
  deleteOrder,
  getDocument,
}