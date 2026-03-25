const { ipcMain } = require('electron');
const { db } = require('./database');
const bcrypt = require('bcryptjs');

let currentUser = null;

function setupIpcHandlers() {
  ipcMain.handle('login', async (event, username, password) => {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return { success: false, message: 'User not found' };
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return { success: false, message: 'Invalid password' };
    currentUser = { id: user.id, name: user.name, username: user.username, role: user.role };
    return { success: true, user: currentUser };
  });

  ipcMain.handle('logout', () => {
    currentUser = null;
    return { success: true };
  });

  ipcMain.handle('getCurrentUser', () => currentUser);
}
ipcMain.handle('getProducts', () => {
  return db.prepare('SELECT * FROM products').all();
});

ipcMain.handle('addProduct', (event, product) => {
  const stmt = db.prepare('INSERT INTO products (name, category, price, stock, image) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(product.name, product.category, product.price, product.stock, product.image || null);
  return { id: info.lastInsertRowid };
});

ipcMain.handle('updateProduct', (event, id, product) => {
  const stmt = db.prepare('UPDATE products SET name = ?, category = ?, price = ?, stock = ?, image = ? WHERE id = ?');
  stmt.run(product.name, product.category, product.price, product.stock, product.image || null, id);
  return { success: true };
});

ipcMain.handle('deleteProduct', (event, id) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return { success: true };
});

ipcMain.handle('createTransaction', (event, { items, total, payment, change }) => {
  const user = currentUser;
  if (!user) throw new Error('Not logged in');

  // Insert transaction
  const txStmt = db.prepare('INSERT INTO transactions (total, payment, change, user_id) VALUES (?, ?, ?, ?)');
  const info = txStmt.run(total, payment, change, user.id);
  const transactionId = info.lastInsertRowid;

  // Insert items
  const itemStmt = db.prepare('INSERT INTO transaction_items (transaction_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
  for (const item of items) {
    itemStmt.run(transactionId, item.productId, item.quantity, item.price);
    // Update stock
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.productId);
  }

  return { transactionId };
});

const { printReceipt } = require('./printer');

ipcMain.handle('printReceipt', async (event, receiptData) => {
  return await printReceipt(receiptData);
});

ipcMain.handle('getSalesData', (event, range) => {
  let whereClause = '';
  if (range === 'today') {
    whereClause = "WHERE date(created_at) = date('now')";
  } else if (range === 'week') {
    whereClause = "WHERE created_at >= date('now', '-7 days')";
  } else if (range === 'month') {
    whereClause = "WHERE created_at >= date('now', '-30 days')";
  }
  const query = `
    SELECT 
      COUNT(*) as transactionCount,
      SUM(total) as totalRevenue
    FROM transactions
    ${whereClause}
  `;
  const result = db.prepare(query).get();

  // Best selling product (simple)
const bestProductQuery = `
  SELECT p.name, SUM(ti.quantity) as totalSold
  FROM transaction_items ti
  JOIN products p ON ti.product_id = p.id
  JOIN transactions t ON ti.transaction_id = t.id
  ${whereClause.replace(/created_at/g, 't.created_at')}
  GROUP BY p.id
  ORDER BY totalSold DESC
  LIMIT 1
`;
  const best = db.prepare(bestProductQuery).get();

  return {
    transactionCount: result.transactionCount || 0,
    totalRevenue: result.totalRevenue || 0,
    bestProduct: best ? best.name : null,
  };
});

// For detailed reports (daily/weekly/monthly)
ipcMain.handle('getDetailedSales', (event, startDate, endDate) => {
  const query = `
    SELECT date(created_at) as date, SUM(total) as daily_total
    FROM transactions
    WHERE date(created_at) BETWEEN ? AND ?
    GROUP BY date(created_at)
    ORDER BY date
  `;
  const rows = db.prepare(query).all(startDate, endDate);
  return rows;
});
module.exports = { setupIpcHandlers };