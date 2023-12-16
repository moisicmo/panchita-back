const ExcelJS = require('exceljs');

const generateXlsx = async (list) => {
  // Crear un nuevo libro de Excel
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Mi hoja de cálculo');

  // Obtener las columnas basadas en las claves del primer objeto en el array
  const columns = Object.keys(list[0]);

  // Agregar datos a la hoja de cálculo
  worksheet.columns = columns.map((column) => ({
    header: column.charAt(0).toUpperCase() + column.slice(1), // Capitalizar la primera letra del nombre de la columna
    key: column,
    width: 10,
  }));

  for await (const item of list) {
    const row = {};
    // Iterar sobre las columnas y agregar los valores correspondientes a la fila
    columns.forEach((column) => {
      row[column] = item[column];
    });

    worksheet.addRow(row);
  }

  // Generar el archivo Excel en memoria
  const base64 = await workbook.xlsx.writeBuffer().then((buffer) => buffer.toString('base64'));
  return base64;
};

module.exports = generateXlsx;
