const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");
const uuid = require('uuid');

const searchProduct = async (productId) => {
  const product = await db.product.findByPk(productId)
  return product;
}

const formatProduct = (product) => ({
  ...omit(product.toJSON(), ['createdAt', 'updatedAt', 'state', 'businessId', 'measurementUnit', 'category', 'prices']),
  measurementUnit: omit(product.measurementUnit.toJSON(), ['createdAt', 'updatedAt', 'state']),
  category: omit(product.category.toJSON(), ['businessId', 'state', 'createdAt', 'updatedAt']),
  ...omit(product.prices.find((price) => price.state).toJSON(), ['state', 'createdAt', 'updatedAt', 'productId']),
  id: product.id
});

const functionGetProduct = async (productId = null, where = undefined) => {
  let queryOptions = {
    include: [
      { model: db.measurementUnit },
      { model: db.category },
      {
        model: db.price,
        where: { state: true }
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
    const uuid4 = uuid.v4();
    const nameInitials = name.substr(0, 3).toUpperCase();
    const numericUuid = uuid4.replace(/\D/g, '');
    const uuidSlice = numericUuid.slice(0, 2) + numericUuid.slice(-2);
    let product = new db.product(req.body);
    product.code = nameInitials + uuidSlice;
    product.image = null;
    await product.save();
    let price = new db.price(req.body);
    price.productId = product.id;
    await price.save();

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
  const { price, discount, typeDiscount } = req.body;
  try {
    //encontramos el producto
    const product = await searchProduct(productId)
    if (!product) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró el producto' }]
      });
    }
    //modificamos el producto
    await db.product.update(
      req.body,
      { where: { id: productId } }
    )

    //verificamos si el precio o el descuento cambio
    const priceProduct = await db.price.findOne({ where: { productId: productId, state: true } });
    console.log(JSON.stringify(priceProduct));
    if (priceProduct.price != price || priceProduct.discount != discount || priceProduct.typeDiscount != typeDiscount) {
      await db.price.update(
        { state: false },
        { where: { productId: productId } }
      )
      let newPrice = new db.price(req.body);
      newPrice.productId = productId;
      await newPrice.save();
    }


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
    const product = await searchProduct(productId)
    if (!product) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró el producto' }]
      });
    }
    //modificamos el producto
    await db.product.update(
      { state: false },
      { where: { id: productId } }
    );
    res.json({
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
  //funciones
  functionGetProduct,
  //metodos
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
}