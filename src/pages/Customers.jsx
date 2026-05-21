import { useEffect, useState } from 'react';
import { getCustomers, addCustomer, deleteCustomer } from '../api';

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

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search,    setSearch]    = useState('');
  const [form,      setForm]      = useState({ name:'', phone:'', email:'', addr:'' });
  const [msg,       setMsg]       = useState('');

  const load = () => getCustomers().then(r => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.phone) { setMsg('Name and phone are required'); return; }
    try {
      await addCustomer(form);
      setForm({ name:'', phone:'', email:'', addr:'' });
      setMsg('Customer added!'); load();
      setTimeout(() => setMsg(''), 2000);
    } catch { setMsg('Error adding customer'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    await deleteCustomer(id); load();
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const initials = name => name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);

  return (
    <div>
      <h1 style={{ fontSize:'22px', fontWeight:'600', marginBottom:'24px' }}>Customers</h1>

      {/* Add Form */}
      <div style={{ background:'#fff', border:'1px solid #e2e0d8', borderRadius:'12px', padding:'20px', marginBottom:'20px' }}>
        <h2 style={{ fontSize:'15px', fontWeight:'600', marginBottom:'16px' }}>Add Customer</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Full Name *</label>
            <input style={inp} placeholder="e.g. Ramesh Kumar" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Phone *</label>
            <input style={inp} placeholder="e.g. 9876543210" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Email</label>
            <input style={inp} placeholder="e.g. ramesh@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Address</label>
            <input style={inp} placeholder="e.g. 12 MG Road, Mumbai" value={form.addr} onChange={e=>setForm({...form,addr:e.target.value})} />
          </div>
        </div>
        {msg && <p style={{ fontSize:'13px', color: msg.includes('!')? '#2d7a4f':'#c0392b', marginBottom:'10px' }}>{msg}</p>}
        <button style={btn('primary')} onClick={handleAdd}>+ Add Customer</button>
      </div>

      {/* Customer List */}
      <div style={{ background:'#fff', border:'1px solid #e2e0d8', borderRadius:'12px', padding:'20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <h2 style={{ fontSize:'15px', fontWeight:'600' }}>All Customers ({filtered.length})</h2>
          <input style={{ ...inp, width:'220px' }} placeholder="Search customers..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>

        {filtered.length === 0
          ? <p style={{ color:'#6b6960', textAlign:'center', padding:'2rem' }}>No customers found</p>
          : <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {filtered.map(c=>(
                <div key={c._id} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px', border:'1px solid #e2e0d8', borderRadius:'10px' }}>
                  <div style={{ width:'42px', height:'42px', borderRadius:'50%', background:'#fdf0ed', color:'#c84b31', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'600', fontSize:'14px', flexShrink:0 }}>
                    {initials(c.name)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:'500', fontSize:'14px' }}>{c.name}</div>
                    <div style={{ fontSize:'12px', color:'#6b6960' }}>{c.phone}{c.email ? ` · ${c.email}` : ''}</div>
                    {c.addr && <div style={{ fontSize:'12px', color:'#6b6960' }}>{c.addr}</div>}
                  </div>
                  <button style={btn('danger')} onClick={()=>handleDelete(c._id)}>Delete</button>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}
