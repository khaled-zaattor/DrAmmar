import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const adminNavItems = [
  { to: '/dashboard',          label: 'Dashboard',              icon: '▦'  },
  { to: '/availability',       label: 'Available Appointments', icon: '🕐' },
  { to: '/appointments',       label: 'Booked Appointments',    icon: '📅' },
  { to: '/barbers',            label: 'Barbers',                icon: '✂'  },
  { to: '/services',           label: 'Services',               icon: '💈' },
  { to: '/service-categories', label: 'Service Categories',     icon: '🏷' },
  { to: '/users',              label: 'Users',                  icon: '👤' },
];

const barberNavItems = [
  { to: '/appointments', label: 'My Appointments', icon: '📅' },
  { to: '/availability', label: 'Blocked Slots',   icon: '🕐' },
];

const Sidebar = ({ collapsed, onToggle, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === 'admin' ? adminNavItems : barberNavItems;

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out');
    navigate('/login');
  };

  return (
    <aside style={{ ...s.sidebar, width: collapsed ? 68 : 240 }}>
      {/* Logo */}
      <div style={s.logoArea}>
        <div style={s.logoIcon}>✂</div>
        {!collapsed && (
          <div>
            <div style={s.logoText}>BarberShop</div>
            <div style={s.logoSub}>Admin Panel</div>
          </div>
        )}
        {/* Desktop collapse toggle */}
        <button
          style={s.toggleBtn}
          className="sidebar-toggle-desktop"
          onClick={onToggle}
          title="Toggle sidebar"
        >
          {collapsed ? '»' : '«'}
        </button>
        {/* Mobile close button */}
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav style={s.nav}>
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => { if (onClose) onClose(); }}
            style={({ isActive }) => ({
              ...s.navItem,
              ...(isActive ? s.navItemActive : {}),
              justifyContent: collapsed ? 'center' : 'flex-start',
            })}
            title={collapsed ? label : undefined}
          >
            <span style={s.navIcon}>{icon}</span>
            {!collapsed && <span style={s.navLabel}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div style={s.footer}>
        {!collapsed && user && (
          <div style={s.userInfo}>
            <div style={s.avatar}>
              {user.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div style={s.userDetails}>
              <div style={s.userName}>{user.name}</div>
              <div style={s.userRole}>{user.role || 'admin'}</div>
            </div>
          </div>
        )}
        <button
          style={{ ...s.logoutBtn, justifyContent: collapsed ? 'center' : 'flex-start' }}
          onClick={handleLogout}
          title="Logout"
        >
          <span style={{ fontSize: 16 }}>⏻</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

const s = {
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    background: '#1e2a38',
    height: '100vh',
    position: 'sticky',
    top: 0,
    flexShrink: 0,
    transition: 'width 0.2s ease',
    overflow: 'hidden',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    minHeight: 70,
  },
  logoIcon: {
    width: 36,
    height: 36,
    background: 'linear-gradient(135deg, #4299e1, #3182ce)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    color: '#fff',
    flexShrink: 0,
  },
  logoText: {
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  },
  logoSub: {
    fontSize: 11,
    color: '#8899a8',
    whiteSpace: 'nowrap',
  },
  toggleBtn: {
    marginLeft: 'auto',
    background: 'rgba(255,255,255,0.07)',
    border: 'none',
    color: '#8899a8',
    borderRadius: 6,
    width: 28,
    height: 28,
    cursor: 'pointer',
    fontSize: 14,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nav: {
    flex: 1,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 8,
    color: '#8899a8',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.15s',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  navItemActive: {
    background: 'rgba(66,153,225,0.15)',
    color: '#63b3ed',
  },
  navIcon: { fontSize: 16, flexShrink: 0, width: 20, textAlign: 'center' },
  navLabel: { fontSize: 14 },
  footer: {
    padding: '12px 8px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    marginBottom: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    background: '#4299e1',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userDetails: { overflow: 'hidden' },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e2e8f0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: 11,
    color: '#8899a8',
    textTransform: 'capitalize',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '9px 12px',
    background: 'none',
    border: 'none',
    color: '#8899a8',
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};

export default Sidebar;
