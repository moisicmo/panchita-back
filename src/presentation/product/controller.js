const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");

const searchProduct = async (productId) => {
  const product = await db.product.findByPk(productId);
  if (!product) {
    return res.status(404).json({
      errors: [{ msg: 'No se encontró el producto' }]
    });
  }
  return;
}

const formatProduct = (product) => ({
  ...omit(product.toJSON(), ['createdAt', 'updatedAt', 'state', 'businessId', 'measurementUnit', 'category']),
  measurementUnitId: omit(product.measurementUnit.toJSON(), ['createdAt', 'updatedAt']),
  categoryId: omit(product.category.toJSON(), ['businessId', 'state', 'createdAt', 'updatedAt'])
});

const functionGetProduct = async (productId = null, where = undefined) => {
  let queryOptions = {
    include: [
      {
        model: db.measurementUnit,
      },
      {
        model: db.category,
      }
    ],
  };
  if (productId) {
    const product = await db.product.findByPk(productId, queryOptions);
    return formatProduct(product);
  } else {
    const products = await db.product.findAll({
      ...queryOptions, where: where
    });
    return products.map(product => formatProduct(product));
  }
};

const getProducts = async (req, res = response) => {
  try {
    return res.json({
      ok: true,
      products: await functionGetProduct(null, { state: true })
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const createProduct = async (req, res = response) => {
  try {
    const { name } = req.body;
    //creamos el producto
    let product = new db.product(req.body);
    product.code = name.substr(0, 3).toUpperCase();
    product.image = null;
    await product.save();

    return res.json({
      ok: true,
      product: await functionGetProduct(product.id),
      msg: 'producto registrado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const updateProduct = async (req, res = response) => {
  const { productId } = req.params;
  try {
    //encontramos el producto
    await searchProduct(productId)
    //modificamos el producto
    await db.product.update(
      req.body,
      { where: { id: productId } }
    )
    return res.json({
      ok: true,
      product: await functionGetProduct(productId),
      msg: 'producto editado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const deleteProduct = async (req, res = response) => {
  const { productId } = req.params;
  try {
    //encontramos el producto
    await searchProduct(productId)
    //modificamos el producto
    await db.product.update(
      { state: false },
      { where: { id: productId } }
    );
    return res.json({
      ok: true,
      product: await functionGetProduct(productId),
      msg: 'producto eliminado'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
}