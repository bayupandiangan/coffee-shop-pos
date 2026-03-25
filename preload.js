const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  logout: () => ipcRenderer.invoke('logout'),
  getCurrentUser: () => ipcRenderer.invoke('getCurrentUser'),

  // Products
  getProducts: () => ipcRenderer.invoke('getProducts'),
  addProduct: (product) => ipcRenderer.invoke('addProduct', product),
  updateProduct: (id, product) => ipcRenderer.invoke('updateProduct', id, product),
  deleteProduct: (id) => ipcRenderer.invoke('deleteProduct', id),

  // Transactions
  createTransaction: (transaction) => ipcRenderer.invoke('createTransaction', transaction),

  // Reports
  getSalesData: (range) => ipcRenderer.invoke('getSalesData', range),

  // Users (Admin only)
  getUsers: () => ipcRenderer.invoke('getUsers'),
  addUser: (user) => ipcRenderer.invoke('addUser', user),
  updateUser: (id, user) => ipcRenderer.invoke('updateUser', id, user),
  deleteUser: (id) => ipcRenderer.invoke('deleteUser', id),

  // Printing
  printReceipt: (receiptData) => ipcRenderer.invoke('printReceipt', receiptData),

  // Navigation
  navigate: (page) => ipcRenderer.send('navigate', page),
});