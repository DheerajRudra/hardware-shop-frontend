import { useEffect, useState } from 'react';
import { getCustomers, addCustomer, deleteCustomer, addPurchase, softDeletePurchase, restorePurchase } from '../api';

export default function Customers() {
  const s = {
    inp: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e0d8', fontSize: '14px', background: '#fff', color: '#1a1917', width: '100%' },
    box: { background: '#fff', border: '1px solid #e2e0d8', borderRadius: '12px', padding: '20px' },
    label: { fontSize: '12px', color: '#6b6960', display: 'block', marginBottom: '4px' },
    btnPrimary: { padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', border: 'none', background: '#c84b31', color: '#fff', cursor: 'pointer' },
    btnDanger: { padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', border: '1px solid #e2e0d8', background: '#fdf0ee', color: '#c0392b', cursor: 'pointer' },
    btnGreen: { padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', border: '1px solid #e2e0d8', background: '#e6f4ee', color: '#2d7a4f', cursor: 'pointer' },
    btnSmallGreen: { padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', border: '1px solid #e2e0d8', background: '#e6f4ee', color: '#2d7a4f', cursor: 'pointer' },
    btnDefault: { padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '500', border: '1px solid #e2e0d8', background: '#fff', color: '#1a1917', cursor: 'pointer' },
  };

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', addr: '' });
  const [msg, setMsg] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [purchaseForm, setPurchaseForm] = useState({ itemName: '', price: '', qty: '1' });
  const [purchaseMsg, setPurchaseMsg] = useState('');
  const [showDeleted, setShowDeleted] = useState({});

  const load = () => getCustomers().then(r => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.phone) { setMsg('Name and phone are required'); return; }
    try {
      await addCustomer(form);
      setForm({ name: '', phone: '', email: '', addr: '' });
      setMsg('Customer added!');
      load();
      setTimeout(() => setMsg(''), 2000);
    } catch { setMsg('Error adding customer'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    await deleteCustomer(id); load();
  };

  const handleAddPurchase = async (cid) => {
    if (!purchaseForm.itemName || !purchaseForm.price) { setPurchaseMsg('Item name and price required'); return; }
    try {
      await addPurchase(cid, { itemName: purchaseForm.itemName, price: parseFloat(purchaseForm.price), qty: parseInt(purchaseForm.qty) || 1 });
      setPurchaseForm({ itemName: '', price: '', qty: '1' });
      setPurchaseMsg('Purchase added!');
      load();
      setTimeout(() => setPurchaseMsg(''), 2000);
    } catch { setPurchaseMsg('Error adding purchase'); }
  };

  const handleRemove = async (cid, pid) => {
    if (!confirm('Remove this purchase? You can restore it later.')) return;
    await softDeletePurchase(cid, pid); load();
  };

  const handleRestore = async (cid, pid) => {
    await restorePurchase(cid, pid); load();
  };

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  const initials = name => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const totalSpent = (purchases = []) => purchases.filter(p => !p.deleted).reduce((sum, p) => sum + p.price * p.qty, 0);

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>Customers</h1>

      <div style={{ ...s.box, marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Add Customer</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div><label style={s.label}>Full Name *</label><input style={s.inp} placeholder="Ramesh Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><label style={s.label}>Phone *</label><input style={s.inp} placeholder="9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label style={s.label}>Email</label><input style={s.inp} placeholder="ramesh@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div><label style={s.label}>Address</label><input style={s.inp} placeholder="12 MG Road, Mumbai" value={form.addr} onChange={e => setForm({ ...form, addr: e.target.value })} /></div>
        </div>
        {msg && <p style={{ fontSize: '13px', color: msg.includes('!') ? '#2d7a4f' : '#c0392b', marginBottom: '10px' }}>{msg}</p>}
        <button style={s.btnPrimary} onClick={handleAdd}>+ Add Customer</button>
      </div>

      <div style={s.box}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600' }}>All Customers ({filtered.length})</h2>
          <input style={{ ...s.inp, width: '220px' }} placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? <p style={{ color: '#6b6960', textAlign: 'center', padding: '2rem' }}>No customers found</p>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(c => (
              <div key={c._id} style={{ border: '1px solid #e2e0d8', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fdf0ed', color: '#c84b31', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', flexShrink: 0 }}>{initials(c.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b6960' }}>{c.phone}{c.email ? ' - ' + c.email : ''}</div>
                    {c.addr && <div style={{ fontSize: '12px', color: '#6b6960' }}>{c.addr}</div>}
                  </div>
                  {c.purchases && c.purchases.filter(p => !p.deleted).length > 0 && (
                    <div style={{ textAlign: 'center', marginRight: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#6b6960' }}>Total Spent</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d7a4f' }}>Rs.{totalSpent(c.purchases).toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '11px', color: '#6b6960' }}>{c.purchases.filter(p => !p.deleted).length} item(s)</div>
                    </div>
                  )}
                  <button style={s.btnGreen} onClick={() => setExpanded(expanded === c._id ? null : c._id)}>{expanded === c._id ? 'Hide' : 'Purchases'}</button>
                  <button style={s.btnDanger} onClick={() => handleDelete(c._id)}>Delete</button>
                </div>
                {expanded === c._id && (
                  <div style={{ borderTop: '1px solid #e2e0d8', background: '#fafaf8', padding: '16px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}>Add Purchase</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                        <div><label style={s.label}>Item Name *</label><input style={s.inp} placeholder="Hammer" value={purchaseForm.itemName} onChange={e => setPurchaseForm({ ...purchaseForm, itemName: e.target.value })} /></div>
                        <div><label style={s.label}>Price *</label><input style={s.inp} type="number" placeholder="250" value={purchaseForm.price} onChange={e => setPurchaseForm({ ...purchaseForm, price: e.target.value })} /></div>
                        <div><label style={s.label}>Qty</label><input style={s.inp} type="number" placeholder="1" value={purchaseForm.qty} onChange={e => setPurchaseForm({ ...purchaseForm, qty: e.target.value })} /></div>
                        <button style={s.btnPrimary} onClick={() => handleAddPurchase(c._id)}>Add</button>
                      </div>
                      {purchaseMsg && <p style={{ fontSize: '12px', color: purchaseMsg.includes('!') ? '#2d7a4f' : '#c0392b', marginTop: '6px' }}>{purchaseMsg}</p>}
                    </div>
                    {c.purchases && c.purchases.length > 0 ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h3 style={{ fontSize: '13px', fontWeight: '600' }}>Purchase History</h3>
                          <button style={s.btnDefault} onClick={() => setShowDeleted({ ...showDeleted, [c._id]: !showDeleted[c._id] })}>{showDeleted[c._id] ? 'Hide Removed' : 'Show Removed'}</button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                          <thead><tr style={{ background: '#f0ede8' }}>
                            <th style={{ padding: '8px 10px', textAlign: 'left', color: '#6b6960' }}>#</th>
                            <th style={{ padding: '8px 10px', textAlign: 'left', color: '#6b6960' }}>Item</th>
                            <th style={{ padding: '8px 10px', textAlign: 'right', color: '#6b6960' }}>Price</th>
                            <th style={{ padding: '8px 10px', textAlign: 'right', color: '#6b6960' }}>Qty</th>
                            <th style={{ padding: '8px 10px', textAlign: 'right', color: '#6b6960' }}>Total</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center', color: '#6b6960' }}>Date</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center', color: '#6b6960' }}>Action</th>
                          </tr></thead>
                          <tbody>
                            {c.purchases.filter(p => showDeleted[c._id] ? true : !p.deleted).map((p, i) => (
                              <tr key={p._id} style={{ borderBottom: '1px solid #e2e0d8', opacity: p.deleted ? 0.5 : 1, background: p.deleted ? '#fff5f5' : 'transparent' }}>
                                <td style={{ padding: '8px 10px', color: '#6b6960' }}>{i + 1}</td>
                                <td style={{ padding: '8px 10px', fontWeight: '500', textDecoration: p.deleted ? 'line-through' : 'none' }}>{p.itemName}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right' }}>Rs.{p.price.toLocaleString('en-IN')}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right' }}>{p.qty}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', color: '#2d7a4f' }}>Rs.{(p.price * p.qty).toLocaleString('en-IN')}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'center', color: '#6b6960' }}>{new Date(p.date).toLocaleDateString('en-IN')}</td>
                                <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                  {p.deleted
                                    ? <button style={s.btnSmallGreen} onClick={() => handleRestore(c._id, p._id)}>Restore</button>
                                    : <button style={s.btnDanger} onClick={() => handleRemove(c._id, p._id)}>Remove</button>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot><tr style={{ background: '#fdf0ed' }}>
                            <td colSpan="4" style={{ padding: '8px 10px', fontWeight: '600' }}>Grand Total</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#c84b31' }}>Rs.{totalSpent(c.purchases).toLocaleString('en-IN')}</td>
                            <td colSpan="2"></td>
                          </tr></tfoot>
                        </table>
                      </div>
                    ) : <p style={{ fontSize: '13px', color: '#6b6960', textAlign: 'center', padding: '10px' }}>No purchases yet.</p>}
                  </div>
                )}
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}