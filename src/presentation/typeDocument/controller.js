const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");

const getTypeDocuments = async (req, res = response) => {
  try {
    const typeDocuments = await db.typeDocument.findAll();
    return res.json({
      ok: true,
      typeDocuments: typeDocuments.map(typeDocument => omit(typeDocument.toJSON(), ['createdAt', 'updatedAt'])),
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

module.exports = {
  getTypeDocuments,
}