import { useEffect, useState } from 'react';
import { getProducts, getCustomers, getBills, getVendors } from '../api';

const card = {
  background: '#fff', border: '1px solid #e2e0d8',
  borderRadius: '12px', padding: '20px'
};
const metric = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '16px 20px',
  border: '2px solid #e2e0d8',
  boxShadow: '4px 4px 0px #e2e0d8'
};
export default function Dashboard() {
  const [products,  setProducts]  = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bills,     setBills]     = useState([]);
  const [vendors,   setVendors]   = useState([]);

  useEffect(() => {
    getProducts().then(r  => setProducts(r.data));
    getCustomers().then(r => setCustomers(r.data));
    getBills().then(r     => setBills(r.data));
    getVendors().then(r   => setVendors(r.data));
  }, []);

  const revenue      = bills.reduce((a, b) => a + b.total, 0);
  const lowStock     = products.filter(p => p.stock <= p.alert);
  const localVendors   = vendors.filter(v => v.type === 'local').length;
  const outsideVendors = vendors.filter(v => v.type === 'outside').length;

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>Dashboard</h1>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Products',   value: products.length,                      icon: '📦' },
          { label: 'Customers',  value: customers.length,                     icon: '👥' },
          { label: 'Vendors',    value: vendors.length,                       icon: '🏭' },
          { label: 'Bills',      value: bills.length,                         icon: '🧾' },
          { label: 'Revenue',    value: '₹' + revenue.toLocaleString('en-IN'),icon: '💰' },
        ].map(m => (
          <div key={m.label} style={metric}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>{m.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: '600' }}>{m.value}</div>
            <div style={{ fontSize: '12px', color: '#6b6960' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Vendor Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
        <div style={{ background:'#edf7f2', border:'1px solid #c3e6d3', borderRadius:'10px', padding:'14px 18px', display:'flex', alignItems:'center', gap:'14px' }}>
          <span style={{ fontSize:'28px' }}>🏪</span>
          <div>
            <div style={{ fontSize:'20px', fontWeight:'600', color:'#2d7a4f' }}>{localVendors}</div>
            <div style={{ fontSize:'12px', color:'#6b6960' }}>Local Suppliers</div>
          </div>
        </div>
        <div style={{ background:'#eef3fd', border:'1px solid #c3d4f5', borderRadius:'10px', padding:'14px 18px', display:'flex', alignItems:'center', gap:'14px' }}>
          <span style={{ fontSize:'28px' }}>🏢</span>
          <div>
            <div style={{ fontSize:'20px', fontWeight:'600', color:'#1a56a0' }}>{outsideVendors}</div>
            <div style={{ fontSize:'12px', color:'#6b6960' }}>Outside Vendors (Companies)</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Low Stock */}
        <div style={card}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>⚠️ Low Stock Alerts</h2>
          {lowStock.length === 0
            ? <p style={{ color: '#6b6960', fontSize: '13px' }}>All products well stocked</p>
            : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr>{['Product','Stock','Alert'].map(h=><th key={h} style={{ textAlign:'left', padding:'6px 8px', color:'#6b6960', borderBottom:'1px solid #e2e0d8' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {lowStock.map(p => (
                    <tr key={p._id}>
                      <td style={{ padding:'8px', borderBottom:'1px solid #f0ede6' }}>{p.name}</td>
                      <td style={{ padding:'8px', borderBottom:'1px solid #f0ede6' }}>
                        <span style={{ background: p.stock===0?'#fdf0ee':'#fef8ec', color: p.stock===0?'#c0392b':'#a06000', padding:'2px 8px', borderRadius:'20px', fontSize:'12px' }}>
                          {p.stock}
                        </span>
                      </td>
                      <td style={{ padding:'8px', borderBottom:'1px solid #f0ede6', color:'#6b6960' }}>{p.alert}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        {/* Recent Bills */}
        <div style={card}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>🧾 Recent Bills</h2>
          {bills.length === 0
            ? <p style={{ color: '#6b6960', fontSize: '13px' }}>No bills yet</p>
            : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr>{['Customer','Date','Total'].map(h=><th key={h} style={{ textAlign:'left', padding:'6px 8px', color:'#6b6960', borderBottom:'1px solid #e2e0d8' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {bills.slice(0,6).map(b => (
                    <tr key={b._id}>
                      <td style={{ padding:'8px', borderBottom:'1px solid #f0ede6' }}>{b.customer?.name}</td>
                      <td style={{ padding:'8px', borderBottom:'1px solid #f0ede6', color:'#6b6960' }}>{b.date}</td>
                      <td style={{ padding:'8px', borderBottom:'1px solid #f0ede6', fontWeight:'500' }}>₹{b.total.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>
    </div>
  );
}
