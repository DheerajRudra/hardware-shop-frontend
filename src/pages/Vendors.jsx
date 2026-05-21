import { useEffect, useState } from 'react';
import { getVendors, addVendor, deleteVendor } from '../api';

const inp = {
  padding:'8px 12px', borderRadius:'8px',
  border:'1px solid #e2e0d8', fontSize:'14px',
  background:'#fff', color:'#1a1917', width:'100%'
};
const btn = (variant='default') => ({
  padding:'8px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:'500',
  border: variant==='primary' ? 'none' : '1px solid #e2e0d8',
  background: variant==='primary' ? '#c84b31' : variant==='danger' ? '#fdf0ee' : variant==='local' ? '#edf7f2' : variant==='outside' ? '#eef3fd' : '#fff',
  color: variant==='primary' ? '#fff' : variant==='danger' ? '#c0392b' : variant==='local' ? '#2d7a4f' : variant==='outside' ? '#1a56a0' : '#1a1917',
  cursor:'pointer'
});

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'
];

const emptyForm = {
  name:'', phone:'', email:'', type:'local',
  supplyItems:'', addr:'',
  company:'', city:'', state:'Maharashtra', gst:''
};

export default function Vendors() {
  const [vendors,  setVendors]  = useState([]);
  const [form,     setForm]     = useState(emptyForm);
  const [filter,   setFilter]   = useState('all'); // all | local | outside
  const [search,   setSearch]   = useState('');
  const [msg,      setMsg]      = useState('');

  const load = () => getVendors().then(r => setVendors(r.data));
  useEffect(() => { load(); }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleAdd = async () => {
    if (!form.name || !form.phone) { setMsg('Name and phone are required'); return; }
    if (form.type === 'outside' && !form.company) { setMsg('Company name is required for outside vendor'); return; }
    try {
      await addVendor(form);
      setForm(emptyForm);
      setMsg('Vendor added!'); load();
      setTimeout(() => setMsg(''), 2000);
    } catch { setMsg('Error adding vendor'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vendor?')) return;
    await deleteVendor(id); load();
  };

  const filtered = vendors.filter(v => {
    const matchType   = filter === 'all' || v.type === filter;
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
                        v.phone.includes(search) ||
                        (v.company || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const localCount   = vendors.filter(v => v.type === 'local').length;
  const outsideCount = vendors.filter(v => v.type === 'outside').length;

  const initials = name => name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);

  return (
    <div>
      <h1 style={{ fontSize:'22px', fontWeight:'600', marginBottom:'24px' }}>Vendors</h1>

      {/* Summary Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'20px' }}>
        {[
          { label:'Total Vendors',    value: vendors.length,  icon:'🏭', bg:'#f5f4f0', color:'#1a1917' },
          { label:'Local Suppliers',  value: localCount,      icon:'🏪', bg:'#edf7f2', color:'#2d7a4f' },
          { label:'Outside Vendors',  value: outsideCount,    icon:'🏢', bg:'#eef3fd', color:'#1a56a0' },
        ].map(m => (
          <div key={m.label} style={{ background: m.bg, borderRadius:'10px', padding:'16px 20px' }}>
            <div style={{ fontSize:'22px', marginBottom:'4px' }}>{m.icon}</div>
            <div style={{ fontSize:'22px', fontWeight:'600', color: m.color }}>{m.value}</div>
            <div style={{ fontSize:'12px', color:'#6b6960' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Add Vendor Form */}
      <div style={{ background:'#fff', border:'1px solid #e2e0d8', borderRadius:'12px', padding:'20px', marginBottom:'20px' }}>
        <h2 style={{ fontSize:'15px', fontWeight:'600', marginBottom:'16px' }}>Add Vendor</h2>

        {/* Type Toggle */}
        <div style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
          <button style={{ ...btn(form.type==='local'?'local':'default'), padding:'8px 20px' }} onClick={()=>set('type','local')}>
            🏪 Local Supplier
          </button>
          <button style={{ ...btn(form.type==='outside'?'outside':'default'), padding:'8px 20px' }} onClick={()=>set('type','outside')}>
            🏢 Outside Vendor (Company)
          </button>
        </div>

        {/* Common Fields */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Vendor Name *</label>
            <input style={inp} placeholder="e.g. Ramesh Traders" value={form.name} onChange={e=>set('name',e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Phone *</label>
            <input style={inp} placeholder="e.g. 9876543210" value={form.phone} onChange={e=>set('phone',e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Email</label>
            <input style={inp} placeholder="e.g. vendor@email.com" value={form.email} onChange={e=>set('email',e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Items They Supply</label>
            <input style={inp} placeholder="e.g. Nuts, Bolts, Pipes" value={form.supplyItems} onChange={e=>set('supplyItems',e.target.value)} />
          </div>
        </div>

        {/* Local Vendor Extra Fields */}
        {form.type === 'local' && (
          <div style={{ background:'#edf7f2', border:'1px solid #c3e6d3', borderRadius:'8px', padding:'14px', marginBottom:'12px' }}>
            <div style={{ fontSize:'12px', fontWeight:'600', color:'#2d7a4f', marginBottom:'10px' }}>🏪 Local Supplier Details</div>
            <div>
              <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Address</label>
              <input style={inp} placeholder="e.g. Shop 12, Market Road, Mumbai" value={form.addr} onChange={e=>set('addr',e.target.value)} />
            </div>
          </div>
        )}

        {/* Outside Vendor Extra Fields */}
        {form.type === 'outside' && (
          <div style={{ background:'#eef3fd', border:'1px solid #c3d4f5', borderRadius:'8px', padding:'14px', marginBottom:'12px' }}>
            <div style={{ fontSize:'12px', fontWeight:'600', color:'#1a56a0', marginBottom:'10px' }}>🏢 Company / Manufacturer Details</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <div>
                <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>Company Name *</label>
                <input style={inp} placeholder="e.g. Tata Steel Ltd." value={form.company} onChange={e=>set('company',e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>GST Number</label>
                <input style={inp} placeholder="e.g. 27AAPFU0939F1ZV" value={form.gst} onChange={e=>set('gst',e.target.value.toUpperCase())} />
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>City</label>
                <input style={inp} placeholder="e.g. Pune" value={form.city} onChange={e=>set('city',e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize:'12px', color:'#6b6960', display:'block', marginBottom:'4px' }}>State</label>
                <select style={inp} value={form.state} onChange={e=>set('state',e.target.value)}>
                  {INDIAN_STATES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {msg && <p style={{ fontSize:'13px', color: msg.includes('!')? '#2d7a4f':'#c0392b', marginBottom:'10px' }}>{msg}</p>}
        <button style={btn('primary')} onClick={handleAdd}>+ Add Vendor</button>
      </div>

      {/* Vendor List */}
      <div style={{ background:'#fff', border:'1px solid #e2e0d8', borderRadius:'12px', padding:'20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'10px' }}>
          <div style={{ display:'flex', gap:'8px' }}>
            {[['all','All'],['local','Local'],['outside','Outside']].map(([val,label])=>(
              <button key={val} onClick={()=>setFilter(val)} style={{
                padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'500', cursor:'pointer',
                border: filter===val ? 'none' : '1px solid #e2e0d8',
                background: filter===val ? '#c84b31' : '#fff',
                color: filter===val ? '#fff' : '#6b6960'
              }}>{label} {val==='all'?`(${vendors.length})`:val==='local'?`(${localCount})`:`(${outsideCount})`}</button>
            ))}
          </div>
          <input style={{ ...inp, width:'220px' }} placeholder="Search vendors..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>

        {filtered.length === 0
          ? <p style={{ color:'#6b6960', textAlign:'center', padding:'2rem' }}>No vendors found</p>
          : <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {filtered.map(v => (
                <div key={v._id} style={{
                  display:'flex', alignItems:'flex-start', gap:'14px', padding:'16px',
                  border:`1px solid ${v.type==='local'?'#c3e6d3':'#c3d4f5'}`,
                  borderRadius:'10px',
                  background: v.type==='local' ? '#fafffe' : '#f8faff'
                }}>
                  {/* Avatar */}
                  <div style={{
                    width:'44px', height:'44px', borderRadius:'50%', flexShrink:0,
                    background: v.type==='local' ? '#edf7f2' : '#eef3fd',
                    color: v.type==='local' ? '#2d7a4f' : '#1a56a0',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontWeight:'600', fontSize:'14px'
                  }}>
                    {initials(v.name)}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'2px' }}>
                      <strong style={{ fontSize:'14px' }}>{v.name}</strong>
                      <span style={{
                        fontSize:'11px', fontWeight:'500', padding:'2px 8px', borderRadius:'20px',
                        background: v.type==='local' ? '#edf7f2' : '#eef3fd',
                        color: v.type==='local' ? '#2d7a4f' : '#1a56a0'
                      }}>
                        {v.type==='local' ? '🏪 Local Supplier' : '🏢 Outside Vendor'}
                      </span>
                    </div>

                    <div style={{ fontSize:'12px', color:'#6b6960', marginBottom:'4px' }}>
                      📞 {v.phone}{v.email ? ` · ✉️ ${v.email}` : ''}
                    </div>

                    {/* Local specific */}
                    {v.type==='local' && v.addr &&
                      <div style={{ fontSize:'12px', color:'#6b6960' }}>📍 {v.addr}</div>
                    }

                    {/* Outside specific */}
                    {v.type==='outside' && (
                      <div style={{ fontSize:'12px', color:'#6b6960' }}>
                        {v.company && <span>🏢 {v.company} </span>}
                        {(v.city || v.state) && <span>· 📍 {[v.city, v.state].filter(Boolean).join(', ')} </span>}
                        {v.gst && <span>· GST: <span style={{ fontFamily:'monospace' }}>{v.gst}</span></span>}
                      </div>
                    )}

                    {v.supplyItems &&
                      <div style={{ fontSize:'12px', color:'#6b6960', marginTop:'4px' }}>
                        📦 Supplies: {v.supplyItems}
                      </div>
                    }
                  </div>

                  <button style={btn('danger')} onClick={()=>handleDelete(v._id)}>Delete</button>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}
