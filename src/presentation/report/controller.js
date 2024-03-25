const { response } = require('express');
const db = require('../../database/models');

const { functionGetCustomer } = require('./../customer/controller');
const { functionGetBranchOffice } = require('./../branchOffice/controller');
const { functionGetProduct } = require('./../product/controller');
const { functionGetOrder } = require('./../order/controller');

const getMonthKey = (date) => {
  const month = new Date(date).getMonth() + 1;
  const year = new Date(date).getFullYear();
  return `${year}-${month}`;
};

const groupSalesByMonth = (orders) => {
  const objetosAgrupados = orders.reduce((agrupados, objeto) => {
    const branchId = objeto.branchOffice.id;
    if (!agrupados[branchId]) agrupados[branchId] = { branchOffice: objeto.branchOffice, orders: [] };
    agrupados[branchId].orders.push(objeto);
    return agrupados;
  }, {});

  const result = [];
  
  for (const branchId in objetosAgrupados) {
    const branchData = objetosAgrupados[branchId];
    const branchOrders = branchData.orders;
    
    const branchResult = branchOrders.reduce((acc, order) => {
      const monthKey = getMonthKey(order.createdAt);

      if (!acc.months.includes(monthKey)) {
        acc.months.push(monthKey);
        acc.salesCount.push(1);
      } else {
        const index = acc.months.indexOf(monthKey);
        acc.salesCount[index]++;
      }

      return acc;
    }, { branchOffice: branchData.branchOffice, months: [], salesCount: [] });
    
    result.push(branchResult);
  }
  
  return result;
};



const getDashboard = async (req, res = response) => {
  try {
    const customers = await functionGetCustomer();
    const branchOffices = await functionGetBranchOffice(null, { state: true })
    const products = await functionGetProduct(null, { state: true })
    const orders = await functionGetOrder(null);
    const groupedSalesByMonth = await groupSalesByMonth(orders.filter((e) => e.state && e.stateSale));
    // const groupedTreatmentsByStageType = await groupTreatmentByStageType(treatments)
    return res.json({
      ok: true,
      countCustomers: customers.length,
      countBranchOffices: branchOffices.length,
      countProducts: products.length,
      countOrders: orders.filter((e) => e.state && !e.stateSale).length,
      countSales: orders.filter((e) => e.state && e.stateSale).length,
      SalesLineTime: groupedSalesByMonth,
      sales: orders.filter((e) => e.state && e.stateSale),
      // treatmentDonut: groupedTreatmentsByStageType
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      ok: false,
      msg: 'Por favor hable con el administrador'
    });
  }
}


module.exports = {
  getDashboard,
}