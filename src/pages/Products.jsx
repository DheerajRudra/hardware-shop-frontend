import { useEffect, useState } from 'react';
import { getProducts, addProduct, deleteProduct } from '../api';

const inp = {
  padding:'8px 12px', borderRadius:'8px',
  border:'1px solid #e2e0d8', fontSize:'14px',
  background:'#fff', color:'#1a1917', width:'100%'
};
const btn = (variant='default') => ({
  padding:'8px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:'500',
  border: variant==='primary' ? 'none' : '1px solid #e2e0d8',
  background: variant==='primary' ? '#c84b31' : variant==='danger' ? '#fdf0ee' : '#fff',
  color: variant==='primary' ? '#fff' : variant==='danger' ? '#c0392b' : '#1a1917',
  cursor:'pointer'
});

const CATS = ['Tools','Fasteners','Electrical','Plumbing','Paint','Safety','Other'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search,   setSearch]   = useState('');
  const [form,     setForm]     = useState({ name:'', category:'Tools', actualPrice:'', sellingPrice:'', stock:'', alert:'5' });
  const [msg,      setMsg]      = useState('');

  const load = () => getProducts().then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.actualPrice || !form.sellingPrice || !form.stock) { setMsg('Fill all required fields'); return; }
    try {
      await addProduct({ ...form, actualPrice: +form.actualPrice, sellingPrice: +form.sellingPrice, stock: +form.stock, alert: +form.alert });
      setForm({ name:'', category:'Tools', actualPrice:'', sellingPrice:'', stock:'', alert:'5' });
      setMsg('Product added!'); load();
      setTimeout(() => setMsg(''), 2000);
    } catch { setMsg('Error adding product'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id); load();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ fontSize:'22px', fontWeight:'600', marginBottom:'24px' }}>Products</h1>

      {/* Add Form */}
      <div style={{ background:'#fff', border:'1px solid #e2e0d8', borderRadius:'12px', padding:'20px', marginBottom:'20px' }}>
        <h2 style={{ fontSize:'15px', fontWeight:'600', marginBottom:'16px' }}>Add Product</h2>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr auto', gap:'10px', alignItems:'flex-end' }}>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Product Name *</label>
            <input style={inp} placeholder="e.g. Hammer" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Category</label>
            <select style={inp} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Purchase Price (₹) *</label>
            <input style={inp} type="number" placeholder="0" value={form.actualPrice} onChange={e=>setForm({...form,actualPrice:e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Selling Price (₹) *</label>
            <input style={inp} type="number" placeholder="0" value={form.sellingPrice} onChange={e=>setForm({...form,sellingPrice:e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Stock *</label>
            <input style={inp} type="number" placeholder="0" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Alert At</label>
            <input style={inp} type="number" placeholder="5" value={form.alert} onChange={e=>setForm({...form,alert:e.target.value})} />
          </div>
          <button style={btn('primary')} onClick={handleAdd}>+ Add</button>
        </div>
        {msg && <p style={{ marginTop:'10px', fontSize:'13px', color: msg.includes('!')? '#2d7a4f':'#c0392b' }}>{msg}</p>}
      </div>

      {/* Product Table */}
      <div style={{ background:'#fff', border:'1px solid #e2e0d8', borderRadius:'12px', padding:'20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <h2 style={{ fontSize:'15px', fontWeight:'600' }}>Inventory ({filtered.length})</h2>
          <input style={{ ...inp, width:'220px' }} placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>

        {filtered.length === 0
          ? <p style={{ color:'#6b6960', textAlign:'center', padding:'2rem' }}>No products found</p>
          : <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr>{['Name','Category','Purchase Price','Selling Price','Profit','Stock','Status',''].map(h=><th key={h} style={{ textAlign:'left', padding:'8px 10px', color:'#6b6960', borderBottom:'1px solid #e2e0d8', fontSize:'12px' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const profit = (p.sellingPrice||0) - (p.actualPrice||0);
                  const status = p.stock === 0
                    ? { label:'Out of stock', bg:'#fdf0ee', color:'#c0392b' }
                    : p.stock <= p.alert
                    ? { label:'Low stock',    bg:'#fef8ec', color:'#a06000' }
                    : { label:'In stock',     bg:'#edf7f2', color:'#2d7a4f' };
                  return (
                    <tr key={p._id} style={{ borderBottom:'1px solid #f5f4f0' }}>
                      <td style={{ padding:'10px' }}><strong>{p.name}</strong></td>
                      <td style={{ padding:'10px', color:'#6b6960' }}>{p.category}</td>
                      <td style={{ padding:'10px' }}>₹{(p.actualPrice||0).toLocaleString('en-IN')}</td>
                      <td style={{ padding:'10px' }}>₹{(p.sellingPrice||0).toLocaleString('en-IN')}</td>
                      <td style={{ padding:'10px', fontWeight:'500', color: profit >= 0 ? '#2d7a4f' : '#c0392b' }}>
                        ₹{profit.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding:'10px' }}>{p.stock}</td>
                      <td style={{ padding:'10px' }}>
                        <span style={{ background:status.bg, color:status.color, padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'500' }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding:'10px' }}>
                        <button style={btn('danger')} onClick={()=>handleDelete(p._id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}
