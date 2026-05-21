import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard  from './pages/Dashboard';
import Products   from './pages/Products';
import Billing    from './pages/Billing';
import Customers  from './pages/Customers';
import Vendors    from './pages/Vendors';

const navStyle = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '10px 16px', borderRadius: '8px',
  textDecoration: 'none', color: '#6b6960',
  fontSize: '14px', fontWeight: '500', transition: 'all 0.15s'
};

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* Sidebar */}
        <aside style={{
          width: '220px', background: '#ffffff',
          borderRight: '1px solid #e2e0d8',
          display: 'flex', flexDirection: 'column',
          padding: '24px 12px', position: 'fixed',
          height: '100vh', top: 0, left: 0
        }}>
          <div style={{
  fontFamily: 'Cormorant Garamond, serif',
  fontSize: '18px',
  fontWeight: '900',
  color: '#c84b31',
  lineHeight: '1.3',
  letterSpacing: '0.5px'
}}>
  ⚙️ JAI BABA BALAK RUPI
</div>
<div style={{
  fontFamily: 'Cormorant Garamond, serif',
  fontSize: '16px',
  fontWeight: '700',
  color: '#0a0a0a',
  marginTop: '2px',
  letterSpacing: '1px'
}}>
  Hardware Shop
</div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { to: '/',          label: 'Dashboard',  icon: '📊' },
              { to: '/products',  label: 'Products',   icon: '📦' },
              { to: '/billing',   label: 'Billing',    icon: '🧾' },
              { to: '/customers', label: 'Customers',  icon: '👥' },
              { to: '/vendors',   label: 'Vendors',    icon: '🏭' },
            ].map(({ to, label, icon }) => (
              <NavLink key={to} to={to} end={to === '/'}
                style={({ isActive }) => ({
                  ...navStyle,
                  background: isActive ? '#fdf0ed' : 'transparent',
                  color: isActive ? '#c84b31' : '#6b6960',
                })}>
                <span>{icon}</span> {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ marginLeft: '220px', flex: 1, padding: '32px', minHeight: '100vh' }}>
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/products"  element={<Products />} />
            <Route path="/billing"   element={<Billing />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/vendors"   element={<Vendors />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
