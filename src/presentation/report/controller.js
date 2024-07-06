const { response } = require('express');
const db = require('../../database/models');

const { functionGetCustomer } = require('./../customer/controller');
const { functionGetBranchOffice } = require('./../branchOffice/controller');
const { functionGetProduct } = require('./../product/controller');
const { functionGetOrder } = require('./../order/controller');
const {searchUser} = require('../staff/controller');

const generateXlsx = require('../../config/generateXlsx');
const { format } = require('date-fns');
const esES = require('date-fns/locale/es');

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
    console.log(req.uid)
    //encontramos al usuario que esta logueado
    const user = await searchUser(req.uid);
    if (!user) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró el staff' }]
      });
    }
    const branchOfficeIds = user.staffs[0].branchOfficeStaffs.map((e)=>e.branchOfficeId);
    const isSuperStaff = user.staffs[0].superStaff;
    let whereCondition = { };
    if (!isSuperStaff) {
      whereCondition.id = branchOfficeIds;
    }

    const customers = await functionGetCustomer();
    const branchOffices = await functionGetBranchOffice(null, { state: true })
    const products = await functionGetProduct(null, { state: true })
    const orders = await functionGetOrder(null,null,whereCondition);
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

const getReport = async (req, res = response) => {
  try {
    console.log(req.uid)
    //encontramos al usuario que esta logueado
    const user = await searchUser(req.uid);
    if (!user) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró el staff' }]
      });
    }
    const branchOfficeIds = user.staffs[0].branchOfficeStaffs.map((e)=>e.branchOfficeId);
    const isSuperStaff = user.staffs[0].superStaff;
    let whereCondition = { };
    if (!isSuperStaff) {
      whereCondition.id = branchOfficeIds;
    }

    const { branchOfficeId, date } = req.body;
    const whereDate = date ? {
      createdAt: {
        [db.Sequelize.Op.between]: [new Date(date[0]), new Date(date[1])],
      },
    } : null;
    const whereBranchOffice = branchOfficeId ? { id: branchOfficeId } : whereCondition;

    const orders = await functionGetOrder(null, whereDate, whereBranchOffice);
    return res.json({
      ok: true,
      orders: orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'Por favor hable con el administrador',
    });
  }
};

const getReportDocument = async (req, res = response) => {
  try {
    console.log(req.uid)
    //encontramos al usuario que esta logueado
    const user = await searchUser(req.uid);
    if (!user) {
      return res.status(404).json({
        errors: [{ msg: 'No se encontró el staff' }]
      });
    }
    const branchOfficeIds = user.staffs[0].branchOfficeStaffs.map((e)=>e.branchOfficeId);
    const isSuperStaff = user.staffs[0].superStaff;
    let whereCondition = { };
    if (!isSuperStaff) {
      whereCondition.id = branchOfficeIds;
    }
    const { branchOfficeId, dateTreatment } = req.body;
    const whereDate = dateTreatment ? {
      createdAt: {
        [db.Sequelize.Op.between]: [new Date(date[0]), new Date(date[1])],
      },
    } : null;
    const whereBranchOffice = branchOfficeId ? { id: branchOfficeId } : whereCondition;
    const orders = await functionGetOrder(null, whereDate, whereBranchOffice);
    const dataOrders = orders.map(order => ({
      "Nro": order.id,
      "Cliente": `${order.customer.user.name} ${order.customer.user.lastName}`,
      "Sucursal": order.branchOffice.name,
      "Fecha": `${format(new Date(order.createdAt), 'EEEE dd-MMMM-yyyy HH:mm', { locale: esES })}`,
      "Monto total": order.amount,
      "Etapa": order.stateSale ? 'vendido' : 'orden',
    }))
    const doc = await generateXlsx(dataOrders);


    return res.json({
      ok: true,
      document: doc
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: 'Por favor hable con el administrador',
    });
  }
};

module.exports = {
  getDashboard,
  getReport,
  getReportDocument,
}