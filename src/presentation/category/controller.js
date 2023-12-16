const { response } = require('express');
const db = require('../../database/models');
const { omit } = require("lodash");

const searchCategory = async (categoryId) => {
  const category = await db.category.findByPk(categoryId);
  if (!category) {
    return res.status(404).json({
      errors: [{ msg: 'No se encontró la categoria' }]
    });
  }
  return;
}

const formatCategory = (category) => ({
  ...omit(category.toJSON(), ['createdAt', 'updatedAt', 'state', 'businessId']),
});

const functionGetCategory = async (categoryId = null, where = undefined) => {
  if (categoryId) {
    const category = await db.category.findByPk(categoryId);
    return formatCategory(category);
  } else {
    const categories = await db.category.findAll({ where: where });
    return categories.map(category => formatCategory(category));
  }
};

const getCategories = async (req, res = response) => {
  try {
    return res.json({
      ok: true,
      categories: await functionGetCategory(null, { state: true })
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const createCategory = async (req, res = response) => {
  try {
    //creamos la categoria
    const category = new db.category(req.body);
    await category.save();
    return res.json({
      ok: true,
      category: await functionGetCategory(category.id),
      msg: 'categoria registrado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const updateCategory = async (req, res = response) => {
  const { categoryId } = req.params;
  try {
    //encontramos la categoria
    await searchCategory(categoryId)
    //modificamos la categoria
    await db.category.update(
      req.body,
      { where: { id: categoryId } }
    )
    return res.json({
      ok: true,
      category: await functionGetCategory(categoryId),
      msg: 'categoria editado exitosamente'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

const deleteCategory = async (req, res = response) => {
  const { categoryId } = req.params;
  try {
    //encontramos la categoria
    await searchCategory(categoryId)
    //modificamos la categoria
    await db.category.update(
      { state: false },
      { where: { id: categoryId } }
    );
    return res.json({
      ok: true,
      category: await functionGetCategory(categoryId),
      msg: 'categoria eliminado'
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      errors: [{ msg: 'Por favor hable con el administrador' }]
    });
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
}