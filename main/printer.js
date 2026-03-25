const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

async function printReceipt(receiptData) {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'printer:POS-58', // change to your printer name or USB
    options: { timeout: 5000 },
    width: 48, // characters per line
  });

  printer.alignCenter();
  printer.println('Coffee Shop');
  printer.println('Jl. Contoh No. 123');
  printer.println('Tel: 08123456789');
  printer.println(`Tanggal: ${receiptData.date.toLocaleString()}`);
  printer.drawLine();

  printer.alignLeft();
  receiptData.items.forEach(item => {
    printer.println(`${item.name} x ${item.quantity}    Rp${item.price * item.quantity}`);
  });
  printer.drawLine();
  printer.println(`Total: Rp${receiptData.total}`);
  printer.println(`Bayar: Rp${receiptData.payment}`);
  printer.println(`Kembali: Rp${receiptData.change}`);
  printer.println('Terima kasih!');
  printer.cut();

  try {
    await printer.execute();
    return { success: true };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = { printReceipt };