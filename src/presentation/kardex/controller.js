const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");

const formatKardex = (kardex) => ({
  ...omit(kardex.toJSON(), ['createdAt', 'updatedAt', 'productId', 'branchOfficeId', 'inputOrOutputId']),
  product: {
    price:kardex.product.prices[0].price,
    ...omit(kardex.product.toJSON(),['prices']),
    // ...kardex.product
    // ...kardex.product,
  //   productId: kardex.product.id,
  //   ...omit(kardex.product.toJSON(), ['businessId', 'categoryId', 'measurementUnitId', 'state', 'createdAt', 'updatedAt']),
  //   measurementUnitId: omit(kardex.product.measurementUnit.toJSON(), ['createdAt', 'updatedAt', 'state']),
  //   categoryId: omit(kardex.product.category.toJSON(), ['businessId', 'state', 'createdAt', 'updatedAt']),
  //   ...omit(kardex.product.prices.find((price) => price.state).toJSON(), ['state', 'createdAt', 'updatedAt', 'productId']),
  },
  branchOffice: omit(kardex.branchOffice.toJSON(), ['businessId', 'typeBranchOffice', 'state', 'createdAt', 'updatedAt']),
  input: omit(kardex.input?.toJSON(), ['updatedAt', 'branchOfficeId', 'productId']),
  output: omit(kardex.output?.toJSON(), ['updatedAt', 'branchOfficeId', 'productId'])
});

const functionGetKardex = async (kardexId = null,where = undefined) => {
  let queryOptions = {
    include: [
      {
        model: db.product,
        include: [
          { model: db.measurementUnit },
          { model: db.category },
          {
            model: db.price,
            where: { state: true }
          }
        ],
      },
      { model: db.branchOffice },
      { 
        model: db.input, 
        as: 'input', 
        required: false,
        order: [['createdAt', 'DESC']] // Ordena por la columna createdAt en orden descendente
      },
      { 
        model: db.output, 
        as: 'output', 
        required: false,
        order: [['createdAt', 'DESC']] // Ordena por la columna createdAt en orden descendente
      },
    ],
  };
  
  if (kardexId) {
    const kardexSearch = await db.kardex.findByPk(kardexId, queryOptions);
    const kardex =  formatKardex(kardexSearch);
    // Filtrar asociaciones no deseadas (inputs o outputs) dependiendo del tipo
    let filteredKardexs = { ...kardex };
    if (kardex.inputOrOutputType === 'inputs') {
      delete filteredKardexs.output;
    } else {
      delete filteredKardexs.input;
    }
    return groupKardex([filteredKardexs])[0];
  } else {

    const kardexSearch = await db.kardex.findAll({...queryOptions, where: where});
    const kardexs = await kardexSearch.map(kardex => formatKardex(kardex));

    // Filtrar asociaciones no deseadas (inputs o outputs) dependiendo del tipo
    const filteredKardexs = kardexs.map(kardex => {
      if (kardex.inputOrOutputType === 'inputs') {
        delete kardex.output;
      } else {
        delete kardex.input;
      }
      return kardex;
    });

    return groupKardex(filteredKardexs);
  }
};


const groupKardex = (inputArray) => {
  return inputArray.reduce((acc, item) => {
    const branchOfficeId = item.branchOffice.id;
    const productId = item.product.id;

    let branchEntry = acc.find(entry => entry.branchOffice.id === branchOfficeId);

    if (!branchEntry) {
      branchEntry = {
        branchOffice: {
          id: item.branchOffice.id,
          name: item.branchOffice.name,
          address: item.branchOffice.address,
          phone: item.branchOffice.phone,
          products: [],
        },
      };
      acc.push(branchEntry);
    }

    let productEntry = branchEntry.branchOffice.products.find(product => product.id === productId);

    if (!productEntry) {
      productEntry = {
        ...item.product,
        stock: 0,
        kardex: [],
      };
      branchEntry.branchOffice.products.push(productEntry);
    }

    // Calcular el stock según el tipo de entrada/salida y la cantidad
    if (item.inputOrOutputType === 'inputs') {
      productEntry.stock += item.input.quantity;
    } else if (item.inputOrOutputType === 'outputs') {
      productEntry.stock -= item.output.quantity;
    }
    
    // Determinar la fecha de creación a utilizar para ordenar
    const createdAt = item.inputOrOutputType === 'inputs' ? item.input.createdAt : item.output.createdAt;

    // Insertar en orden según la fecha de creación
    let inserted = false;
    for (let i = 0; i < productEntry.kardex.length; i++) {
      if (new Date(productEntry.kardex[i].createdAt) > new Date(createdAt)) {
        productEntry.kardex.splice(i, 0, {
          id: item.id,
          inputOrOutputType: item.inputOrOutputType,
          detail: item.detail,
          output: item.output,
          input: item.input,
          createdAt: createdAt
        });
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      productEntry.kardex.push({
        id: item.id,
        inputOrOutputType: item.inputOrOutputType,
        detail: item.detail,
        output: item.output,
        input: item.input,
        createdAt: createdAt
      });
    }

    return acc;
  }, []);
};



const getKardex = async (req, res = response) => {
  try {
    return res.json({
      ok: true,
      kardex: await functionGetKardex(null)
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const getKardexByBranchOffice = async (req, res = response) => {
  try {
    const { branchOfficeId } = req.params;
    const kardex = await functionGetKardex(null,{branchOfficeId:branchOfficeId});
    
    // Verificamos si el arreglo kardex está vacío
    if (kardex.length === 0) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontraron registros en el kardex' }]
      });
    }
    
    const productsWithBranchOfficeId = kardex[0].branchOffice.products.map((product) => ({
      ...product,
      branchOfficeId: parseInt(branchOfficeId)
    }));
    
    return res.json({
      ok:true,
      products: productsWithBranchOfficeId
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}



module.exports = {
  functionGetKardex,
  getKardexByBranchOffice,
  getKardex
}