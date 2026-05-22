import { useEffect, useState } from 'react';
import { getProducts, getCustomers, getBills, addBill, deleteBill } from '../api';

const inp = {
  padding:'8px 12px', borderRadius:'8px',
  border:'1px solid #e2e0d8', fontSize:'14px',
  background:'#fff', color:'#1a1917'
};
const btn = (variant='default') => ({
  padding:'8px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:'500',
  border: variant==='primary' ? 'none' : '1px solid #e2e0d8',
  background: variant==='primary' ? '#c84b31' : variant==='danger' ? '#fdf0ee' : '#fff',
  color: variant==='primary' ? '#fff' : variant==='danger' ? '#c0392b' : '#1a1917',
  cursor:'pointer'
});

export default function Billing() {
  const [products,  setProducts]  = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bills,     setBills]     = useState([]);
  const [items,     setItems]     = useState([]);
  const [selCust,   setSelCust]   = useState('');
  const [selProd,   setSelProd]   = useState('');
  const [qty,       setQty]       = useState(1);
  const [date,      setDate]      = useState(new Date().toISOString().split('T')[0]);
  const [msg,       setMsg]       = useState('');

  const load = async () => {
    const [p, c, b] = await Promise.all([getProducts(), getCustomers(), getBills()]);
    setProducts(p.data); setCustomers(c.data); setBills(b.data);
  };
  useEffect(() => { load(); }, []);

  const addItem = () => {
    if (!selProd) { setMsg('Select a product'); return; }
    const prod = products.find(p => p._id === selProd);
    if (!prod) return;
    if (qty < 1 || qty > prod.stock) { setMsg(`Max available: ${prod.stock}`); return; }
    const existing = items.find(i => i.productId === selProd);
    if (existing) {
      setItems(items.map(i => i.productId === selProd ? { ...i, qty: i.qty + Number(qty) } : i));
    } else {
      setItems([...items, {
        productId:    prod._id,
        name:         prod.name,
        actualPrice:  prod.actualPrice,
        price:        prod.sellingPrice,
        qty:          Number(qty)
      }]);
    }
    setSelProd(''); setQty(1); setMsg('');
  };

  const removeItem = (pid) => setItems(items.filter(i => i.productId !== pid));

  const total = items.reduce((a, i) => a + i.price * i.qty, 0);

  const handleGenerate = async () => {
    if (!selCust) { setMsg('Select a customer'); return; }
    if (items.length === 0) { setMsg('Add at least one item'); return; }
    const cust = customers.find(c => c._id === selCust);
    try {
      await addBill({ customer: { id: cust._id, name: cust.name, phone: cust.phone }, items, total, date });
      setItems([]); setSelCust(''); setMsg('Bill generated!');
      load(); setTimeout(() => setMsg(''), 2000);
    } catch { setMsg('Error generating bill'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bill?')) return;
    await deleteBill(id); load();
  };

  return (
    <div>
      <h1 style={{ fontSize:'22px', fontWeight:'600', marginBottom:'24px' }}>Billing</h1>

      {/* New Bill */}
      <div style={{ background:'#fff', border:'1px solid #e2e0d8', borderRadius:'12px', padding:'20px', marginBottom:'20px' }}>
        <h2 style={{ fontSize:'15px', fontWeight:'600', marginBottom:'16px' }}>New Bill</h2>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Customer</label>
            <select style={{ ...inp, width:'100%' }} value={selCust} onChange={e=>setSelCust(e.target.value)}>
              <option value="">-- Select Customer --</option>
              {customers.map(c=><option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Date</label>
            <input style={{ ...inp, width:'100%' }} type="date" value={date} onChange={e=>setDate(e.target.value)} />
          </div>
        </div>

        {/* Add Item Row */}
        <div style={{ display:'flex', gap:'10px', marginBottom:'16px', alignItems:'flex-end' }}>
          <div style={{ flex:3 }}>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Product</label>
            <select style={{ ...inp, width:'100%' }} value={selProd} onChange={e=>setSelProd(e.target.value)}>
              <option value="">-- Select Product --</option>
              {products.filter(p=>p.stock>0).map(p=>(
                <option key={p._id} value={p._id}>
                  {p.name} — Selling: ₹{p.sellingPrice} | Purchase: ₹{p.actualPrice} [Stock: {p.stock}]
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex:1 }}>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Qty</label>
            <input style={{ ...inp, width:'100%' }} type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} />
          </div>
          <button style={btn()} onClick={addItem}>+ Add Item</button>
        </div>

        {/* Items Table */}
        {items.length > 0 && (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px', marginBottom:'12px' }}>
            <thead>
              <tr>{['Product','Purchase Price','Selling Price','Qty','Subtotal','Profit',''].map(h=>(
                <th key={h} style={{ textAlign:'left', padding:'6px 8px', color:'#6b6960', borderBottom:'1px solid #e2e0d8', fontSize:'12px' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {items.map(item=>{
                const profit = (item.price - item.actualPrice) * item.qty;
                return (
                  <tr key={item.productId} style={{ borderBottom:'1px solid #f5f4f0' }}>
                    <td style={{ padding:'8px' }}>{item.name}</td>
                    <td style={{ padding:'8px', color:'#6b6960' }}>₹{item.actualPrice}</td>
                    <td style={{ padding:'8px' }}>₹{item.price}</td>
                    <td style={{ padding:'8px' }}>{item.qty}</td>
                    <td style={{ padding:'8px', fontWeight:'500' }}>₹{(item.price*item.qty).toLocaleString('en-IN')}</td>
                    <td style={{ padding:'8px', fontWeight:'500', color: profit>=0?'#2d7a4f':'#c0392b' }}>
                      ₹{profit.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding:'8px' }}><button style={btn('danger')} onClick={()=>removeItem(item.productId)}>✕</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:'16px', borderTop:'1px solid #e2e0d8', paddingTop:'12px' }}>
          <span style={{ color:'#6b6960' }}>Total:</span>
          <strong style={{ fontSize:'20px' }}>₹{total.toLocaleString('en-IN')}</strong>
        </div>

        {msg && <p style={{ marginTop:'10px', fontSize:'13px', color: msg.includes('!')? '#2d7a4f':'#c0392b' }}>{msg}</p>}

        <div style={{ display:'flex', gap:'10px', marginTop:'16px' }}>
          <button style={btn('primary')} onClick={handleGenerate}>🧾 Generate Bill</button>
          <button style={btn()} onClick={()=>setItems([])}>Clear</button>
        </div>
      </div>

      {/* Bill History */}
      <div style={{ background:'#fff', border:'1px solid #e2e0d8', borderRadius:'12px', padding:'20px' }}>
        <h2 style={{ fontSize:'15px', fontWeight:'600', marginBottom:'16px' }}>Bill History</h2>
        {bills.length === 0
          ? <p style={{ color:'#6b6960', textAlign:'center', padding:'2rem' }}>No bills yet</p>
          : bills.map(b=>(
              <div key={b._id} style={{ border:'1px solid #e2e0d8', borderRadius:'10px', padding:'14px', marginBottom:'10px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <strong style={{ fontSize:'14px' }}>{b.customer?.name}</strong>
                    <span style={{ fontSize:'12px', color:'#6b6960', marginLeft:'8px' }}>{b.customer?.phone}</span>
                    <div style={{ fontSize:'12px', color:'#6b6960', marginTop:'2px' }}>{b.date}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <strong style={{ fontSize:'16px' }}>₹{b.total.toLocaleString('en-IN')}</strong>
                    <button style={btn('danger')} onClick={()=>handleDelete(b._id)}>Delete</button>
                  </div>
                </div>
                <div style={{ fontSize:'12px', color:'#6b6960', marginTop:'8px' }}>
                  {b.items.map(i=>`${i.name} × ${i.qty}`).join(' · ')}
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
