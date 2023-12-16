const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");

const searchCustomer = async (customerId) => {
  const customer = await db.customer.findByPk(customerId);
  return customer;
}

const formatCustomer = (customer) => ({
  ...omit(customer.toJSON(), ['state', 'userId', 'responsableId', 'createdAt', 'updatedAt', 'treatments']),
  user: {
    ...omit(customer.user.toJSON(), ['createdAt', 'updatedAt', 'typeDocument']),
    typeDocumentId: omit(customer.user.typeDocument.toJSON(), ['createdAt', 'updatedAt'])
  },

});

const functionGetCustomer = async (customerId) => {
  let queryOptions = {
    where: { state: true },
    include: [
      {
        model: db.user,
        include: [{ model: db.typeDocument }]
      },
    ],
  };
  if (customerId) {
    const customer = await db.customer.findByPk(customerId, queryOptions);
    return formatCustomer(customer);
  } else {
    const customers = await db.customer.findAll(queryOptions);
    return customers.map(customer => formatCustomer(customer))
  }
}

const getCustomers = async (req, res = response) => {
  try {
    return res.json({
      ok: true,
      customers: await functionGetCustomer()
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const createCustomer = async (req, res = response) => {
  try {
    //verificamos si existe el usuario
    let user = await db.user.findOne({ where: { numberDocument: req.body.numberDocument } });
    if (!user) {
      //  creacion de usuario
      user = new db.user(req.body);
      await user.save();
    }
    //verificamos si existe el cliente
    let customer = await db.customer.findOne({ where: { userId: user.id, state: true } });
    if (customer) {
      return res.status(400).json({
        errors: [{ msg: 'El Cliente ya se encuentra registrado' }]
      });
    }
    //creamos al cliente
    customer = new db.customer();
    customer.userId = user.id;
    await customer.save();

    return res.json({
      ok: true,
      customer: await functionGetCustomer(customer.id),
      msg: 'cliente registrado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const updateCustomer = async (req, res = response) => {
  const { customerId } = req.params;
  try {
    //encontramos al cliente
    const customer = await searchCustomer(customerId)
    if (!customer) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró el cliente' }]
      });
    }
    //modificamos el cliente
    await db.customer.update(
      req.body,
      {
        where: { id: customerId },
      }
    )
    //modificamos el usuario
    await db.user.update(
      req.body,
      {
        where: { id: customer.userId }
      }
    )

    return res.json({
      ok: true,
      customer: await functionGetCustomer(customerId),
      msg: 'cliente editado exitosamente'
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const deleteCustomer = async (req, res = response) => {
  const { customerId } = req.params;
  try {
    //encontramos al cliente
    const customer = await searchCustomer(customerId)
    if (!customer) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró el cliente' }]
      });
    }
    //modificamos al cliente
    await db.customer.update(
      { state: false },
      {
        where: { id: customerId },
      }
    )
    return res.json({
      ok: true,
      customer: await functionGetCustomer(customerId),
      msg: 'cliente eliminado'
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

module.exports = {
  functionGetCustomer,
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
}