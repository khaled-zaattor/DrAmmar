import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import Sidebar from './Sidebar';

const BREADCRUMBS = {
  '/':                   'Appointments',
  '/dashboard':          'Dashboard',
  '/appointments':       'Appointments',
  '/availability':       'Available Appointments',
  '/barbers':            'Barbers',
  '/barbers/new':        'Add Barber',
  '/services':           'Services',
  '/services/new':       'Add Service',
  '/service-categories': 'Service Categories',
  '/users':              'Users',
};

const getPageTitle = (pathname) => {
  if (BREADCRUMBS[pathname]) return BREADCRUMBS[pathname];
  if (pathname.includes('/appointments/') && pathname.includes('/edit')) return 'Appointment Details';
  if (pathname.includes('/barbers/') && pathname.includes('/edit')) return 'Edit Barber';
  if (pathname.includes('/services/') && pathname.includes('/edit')) return 'Edit Service';
  return 'Dashboard';
};

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div style={s.shell}>
      {/* Mobile overlay — closes drawer on tap */}
      <div
        className={`sidebar-overlay${mobileOpen ? ' active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar wrapper — becomes off-canvas drawer on mobile */}
      <div className={`sidebar-root${mobileOpen ? ' sidebar-open' : ''}`}>
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      <div style={s.main}>
        {/* Top Bar */}
        <header style={s.topbar} className="topbar-shell">
          <div style={s.topLeft}>
            <button
              className="hamburger-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu size={22} />
            </button>
            <h2 style={s.pageTitle}>{pageTitle}</h2>
          </div>
          <div style={s.topRight}>
            <span style={s.dateChip}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main style={s.content} className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const s = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f0f2f5',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'auto',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    height: 64,
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    flexShrink: 0,
  },
  topLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  pageTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#1e2a38',
  },
  topRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  dateChip: {
    fontSize: 12,
    color: '#718096',
    background: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: '4px 10px',
  },
  content: {
    flex: 1,
    padding: '28px',
    maxWidth: 1400,
    width: '100%',
  },
};

export default Layout;
