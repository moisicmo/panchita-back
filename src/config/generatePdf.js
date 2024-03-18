const pdfMake = require('pdfmake');
const numeroEnLetras = require('./convertNumbertoString');

const { format } = require('date-fns');
const esES = require('date-fns/locale/es')

const generatePdf = async (order, title) => {
  const fonts = {
    Roboto: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique'
    }
  };

  const printer = new pdfMake(fonts);
  const docDefinition = {
    pageSize: "LETTER",
    pageMargins: [40, 50, 40, 50],
    defaultStyle: {
      fontSize: 12,
    },
    content: [
      {
        margin: [0, 30, 0, 0],
        layout: 'noBorders',
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: 'SUPER BALANCE', style: 'styleLeft' },
              { text: `COMPROBANTE N° ${order.id}`, style: 'styleRight' },
            ],
            [
              { text: `Sucursal: ${order.branchOffice.name}`, style: 'styleLeft', colSpan: 2 },
            ],
            [
              { text: `Dirección: ${order.branchOffice.address}`, style: 'styleLeft', colSpan: 2 },
            ],
            [
              { text: `Teléfono: ${order.branchOffice.phone}`, style: 'styleLeft', colSpan: 2 },
            ],
          ],
        },
      },
      {
        margin: [0, 30, 0, 0],
        text: `${title}`, fontSize: 24, alignment: 'center', bold: true,
      },
      {
        margin: [0, 30, 0, 0],
        layout: 'noBorders',
        table: {
          widths: ['auto', '*'],
          body: [
            [
              { text: 'Fecha:', style: 'styleLeft', bold: true },
              `${format(order.createdAt, 'dd MMMM yyyy', { locale: esES })}`,
            ],
            [
              { text: 'Razon Social:', style: 'styleLeft', bold: true },
              `${order.customer.user.name}`,
            ],
            [
              { text: 'NIT/CI/Otro:', style: 'styleLeft', bold: true },
              `${order.customer.user.numberDocument}`,
            ],
            [
              { text: 'Emitido por:', style: 'styleLeft', bold: true },
              `${order.staff.user.name}`,
            ],
          ],
        },
      },
      {
        margin: [0, 30, 0, 0],
        layout: {
          hLineWidth: function (_, _) {
            return 1;
          },
          vLineWidth: function (_, _) {
            return 0;
          }
        },
        table: {
          widths: ['8%', '12%', '*', '18%', '9%', '14%'],
          body: [
            [
              { text: 'CANT.', bold: true, style: 'styleRight', margin: [1, 3, 1, 3] },
              { text: 'UND. DE MEDIDA', bold: true, style: 'styleLeft', margin: [1, 3, 1, 3] },
              { text: 'DESCRIPCION', bold: true, style: 'styleCenter', margin: [1, 3, 1, 3] },
              { text: 'PRECIO UNIT.', bold: true, style: 'styleRight', margin: [1, 3, 1, 3] },
              { text: 'DESC.', bold: true, style: 'styleRight', margin: [1, 3, 1, 3] },
              { text: 'SUBTOTAL', bold: true, style: 'styleRight', margin: [1, 3, 1, 3] },
            ],
            ...order.outputs.filter((e)=>e.quantity != 0).map(element => {
                return [
                  { text: `${element.quantity}`, style: 'styleRight', margin: [1, 3, 1, 3] },
                  { text: `${element.product.measurementUnit.name}`, style: 'styleLeft', margin: [1, 3, 1, 3] },
                  { text: `${element.product.code} - ${element.product.name}`, style: 'styleCenter', margin: [1, 3, 1, 3] },
                  { text: `${element.price}`, style: 'styleRight', margin: [1, 3, 1, 3] },
                  { text: `${element.discount}`, style: 'styleRight', margin: [1, 3, 1, 3] },
                  { text: `${element.quantity * element.price}`, style: 'styleRight', margin: [1, 3, 1, 3] },
                ];
            }),
          ],
        },
      },
      {
        margin: [0, 30, 5, 0],
        layout: 'noBorders',
        table: {
          widths: ['*', '30%'],
          body: [
            [
              { text: `Son: ${numeroEnLetras(order.amount)} 00/100 Bolivianos`, style: 'styleLeft' },
              {
                layout: 'noBorders',
                table: {
                  widths: ['*', 'auto'],
                  body: [
                    [
                      { text: 'TOTAL A PAGAR:', style: 'styleRight' },
                      `${order.amount}`
                    ],
                  ]
                }
              }
            ]
          ]
        },
      }
    ],
    styles: {
      styleCenter: {
        alignment: 'center'
      },
      styleLeft: {
        alignment: 'left'
      },
      styleRight: {
        alignment: 'right'
      }
    }
  };
  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    let chunks = [];
    pdfDoc.on('data', (chunk) => {
      chunks.push(chunk);
    });
    pdfDoc.on('end', async () => {
      const pdfData = Buffer.concat(chunks);
      const pdfBase64 = pdfData.toString('base64');
      resolve({ pdfBase64 });
    });
    pdfDoc.end();
  });
};

module.exports = generatePdf;
