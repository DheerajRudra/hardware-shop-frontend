import axios from 'axios';

const API = axios.create({ 
  baseURL: 'https://hardware-shop-backend-avxa.onrender.com/api' 
});

export const getProducts   = ()        => API.get('/products');
export const addProduct    = (data)    => API.post('/products', data);
export const updateProduct = (id,data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id)      => API.delete(`/products/${id}`);

export const getCustomers  = ()        => API.get('/customers');
export const addCustomer   = (data)    => API.post('/customers', data);
export const deleteCustomer= (id)      => API.delete(`/customers/${id}`);

export const getVendors    = ()        => API.get('/vendors');
export const addVendor     = (data)    => API.post('/vendors', data);
export const deleteVendor  = (id)      => API.delete(`/vendors/${id}`);

export const getBills      = ()        => API.get('/bills');
export const addBill       = (data)    => API.post('/bills', data);
export const deleteBill    = (id)      => API.delete(`/bills/${id}`);
